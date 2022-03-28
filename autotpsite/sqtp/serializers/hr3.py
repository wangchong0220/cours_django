"""
@author: haiwen
@date: 2021/11/4
@file: hr3.py
"""
from rest_framework.exceptions import ValidationError
from rest_framework.renderers import JSONRenderer

from sqtp.models import Step, Request, Case, Config, Project
from rest_framework import serializers

#命名规范：模型名+Serializer
from . import UserSerializer
from .mgr import ProjectSerializer
from ..utils import filter_data


class RequestSerializer(serializers.ModelSerializer):
    method = serializers.SerializerMethodField() # 指定该字段通过get_method方法获取
    step_id = serializers.IntegerField(write_only=True,required=False) #非必填入参

    def get_method(self,obj): #
        return obj.get_method_display()

    class Meta:
        model = Request #指定序列器对应的模型
        fields =['step_id','method','url','params','headers','json','data'] # 指定序列化模型中的字段

    def validate(self, attrs):
        template={
            'params':dict,
            'headers':dict,
            'cookies':dict,
        }
        for param_name, type_name in template.items():
            if param_name in attrs and not isinstance(attrs[param_name],type_name):
                # 数据类型校验
                raise ValidationError(f'请传递正确的{param_name}格式: {type_name}')
        return attrs


class ConfigSerializer(serializers.ModelSerializer):
    project = ProjectSerializer(required=False,read_only=True)

    class Meta:
        model = Config
        fields = ['project','name','base_url','variables','parameters','export','verify']

    def validate(self, attrs):
        template={
            'variables':dict,
            'parameters': dict,
            'export': list
        }
        for param_name, type_name in template.items():
            if param_name in attrs and not isinstance(attrs[param_name],type_name):
                # 数据类型校验
                raise ValidationError(f'请传递正确的{param_name}格式: {type_name}')
        # 再加入base_url格式检测--是否以http://或https://开头
        return attrs


class StepSerializer(serializers.ModelSerializer):
    request = RequestSerializer()
    belong_case_id = serializers.IntegerField(required=False)

    class Meta:
        model = Step
        fields = ['name', 'variables', 'request', 'extract', 'validate', 'setup_hooks', 'teardown_hooks','belong_case_id','sorted_no']

    def validate(self, attrs):
        template={
            'variables':dict,
            'request':dict,
            'extract':dict,
            'validate':list,
            'setup_hooks':list,
            'teardown_hooks':list,
        }
        for param_name, type_name in template.items():
            if param_name in attrs and not isinstance(attrs[param_name],type_name):
                # 数据类型校验
                raise ValidationError(f'请传递正确的{param_name}格式: {type_name}')
        return attrs

    def create(self, validated_data):
        req_kws = validated_data.pop('request')
        #构造步骤
        step_obj = Step.objects.create(**validated_data)
        #构造请求
        req_kws['step_id']=step_obj.id
        req_serializer=RequestSerializer(data=req_kws)
        if req_serializer.is_valid(raise_exception=True):
            req_obj = req_serializer.save()
        # else:
        #     raise ValidationError(req_serializer.errors)

        return step_obj




class CaseSerializer(serializers.ModelSerializer):
    config = ConfigSerializer()  # config字段就对应其序列化器返回的内容
    teststeps = StepSerializer(required=False,many=True)
    # read_only=True为只读参数，required=False 表示非必填，就不会校验入参 many=True展示为列表形式
    project_id = serializers.CharField(write_only=True,required=False) # 只做为入参
    create_by = UserSerializer(write_only=True,required=False)
    updated_by = UserSerializer(write_only=True,required=False)

    class Meta:
        model = Case
        fields = ['config','teststeps','project_id','desc','id','file_path','create_time','update_time','create_by','updated_by'] #序列化器定义的字段必须再此展示

    def validate(self, attrs):
        template={
            'config':dict,
            'teststeps': list,
        }
        for param_name, type_name in template.items():
            if param_name in attrs and not isinstance(attrs[param_name],type_name):
                # 数据类型校验
                raise ValidationError(f'请传递正确的{param_name}格式: {type_name}')
        return attrs

    # 覆盖父类新增反方法
    def create(self, validated_data):
        '''
        validated_data: 校验后的入参--字典形式
        '''
        # 创建config
        config_kws = validated_data.pop('config') # 取出config参数
        project = Project.objects.get(pk=validated_data.pop('project_id'))
        config =Config.objects.create(project=project,**config_kws) #关联project
        # 取步骤数据
        step_kws=[]
        if 'teststeps' in validated_data:
            step_kws = validated_data.pop('teststeps')
        # 创建用例
        file_path = f'{project.name}_{config.name}.json' # 项目名+用例名.json
        case = Case.objects.create(config=config,file_path=file_path,**validated_data)
        # 创建步骤
        if step_kws:
            for step_kw in step_kws:
                step_kw['belong_case_id'] = case.id
                serializer = StepSerializer(data=step_kw)
                if serializer.is_valid(raise_exception=True):
                    serializer.save()
        return case

    # 修改用例
    def update(self, instance, validated_data):
        '''
        instance 当前被修改的数据对象
        validated_data 校验后的入参--字典形式
        '''
        config_kws = validated_data.pop('config')  # config入参
        project = Project.objects.get(pk=validated_data.pop('project_id'))
        # 把project数据传递到config入参中
        config_kws['project']=project.id
        conf_serializer = ConfigSerializer(instance=instance.config,data=config_kws)
        # 通过序列化器更新数据
        if conf_serializer.is_valid():
            conf_serializer.save()#调用save方法之前必须调用检查参数动作
        else:
            raise ValidationError(conf_serializer.errors) # 发生错误后，信息保存在序列化器的error字段中

        # teststeps更新
        # 先删除当前用例下关联的所有step
        step_qs = instance.teststeps.all()
        for step in step_qs:
            step.delete() #逐个删除
        # 重新创建
        teststeps=validated_data.pop('teststeps')
        for step in teststeps:
            # 取出步骤关联的用例ID
            step['belong_case']=self.instance.id
            ss=StepSerializer(data=step)
            if ss.is_valid():
                ss.save()
            else:
                raise ValidationError(ss.errors)

        # 利用python反射自动赋值
        for k,v in validated_data.items():
            # 注意validated_data不要包含instance数据对象没有的字段参数
            setattr(instance,k,v)
        instance.save() #保持到数据库
        return instance

    # 生成hr3格式json文件
    def to_json_file(self,path=None):
        if path is None:
            path = self.instance.file_path #如果没传就采用用例自己的文件路径
        if not path.endswith('json'):
            path = path + 'json'

        # 生成的用例文件存放在项目目录的testcase目录下
        path = f'testcase/{path}'
        # 过滤输出参数
        valid_data = filter_data(self.data)
        # 生成json文件
        content = JSONRenderer().render(valid_data,accepted_media_type='application/json; indent=4') # 获取文件内容--bytes
        with open(path,'wb') as f:
            f.write(content)
        return path




