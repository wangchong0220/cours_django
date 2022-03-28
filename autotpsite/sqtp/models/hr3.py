"""
@author: haiwen
@date: 2021/10/30
@file: hr3.py
"""
from django.db import models

from .mgr import Project
from .base import CommonInfo
# Create your models here.

# 测试平台核心模型--拆解HR用例部分


class Config(CommonInfo):
    project = models.ForeignKey(Project,on_delete=models.DO_NOTHING,null=True)
    name = models.CharField('名称',max_length=128)
    base_url = models.CharField('IP/域名',max_length=256,null=True,blank=True) # 可为空或空白
    variables = models.JSONField('变量', null=True) # sqlite不支持JSONField 数据类型，需要用到mysql
    parameters = models.JSONField('参数',null=True)
    export = models.JSONField('用例返回值',null=True)
    verify = models.BooleanField('https校验',default=False)

    class Meta(CommonInfo.Meta): # 模型元类的作用，提供些额外的信息，比如模型对应的表名
        # db_table=['Config'] # 如果不设置 默认的名称是app名_模型名
        verbose_name = '用例配置表'


class Case(CommonInfo):
    config = models.OneToOneField(Config,on_delete=models.DO_NOTHING)
    file_path = models.CharField('用例文件路径',max_length=1000,default='demo_case.json')

    def __str__(self):
        return self.config.name

    class Meta(CommonInfo.Meta):
        verbose_name = '测试用例表'


class Step(CommonInfo):
    #反向查询名称 同个模型中，两个以上字段关联同一个模型，必须指定related_name
    # 属于那条用例
    belong_case = models.ForeignKey(Case,on_delete=models.CASCADE,related_name='teststeps')
    # 引用的哪条用例
    linked_case = models.ForeignKey(Case,on_delete=models.SET_NULL,null=True,related_name='linked_steps')
    name = models.CharField('名称',max_length=128)
    variables = models.JSONField('变量', null=True)
    extract = models.JSONField('请求返回值',null=True)
    validate = models.JSONField('校验项',null=True)
    setup_hooks = models.JSONField('初始化',null=True)
    teardown_hooks = models.JSONField('清除',null=True)
    sorted_no = models.PositiveSmallIntegerField('步骤顺序',default=1)

    class Meta(CommonInfo.Meta):
        verbose_name = '测试步骤表'
        ordering = ['id','sorted_no']
        unique_together = ['belong_case','sorted_no'] # 同一个用例的步骤顺序是不一样的


class Request(CommonInfo):
    method_choices=( # method可选的字段，
        (0,'GET'),   # 参数1:实际存储在数据库中的值, 参数2：对外显示的值
        (1,'POST'),
        (2,'PUT'),
        (3,'DELETE'),
    )
    step = models.OneToOneField(Step,on_delete=models.CASCADE,null=True,related_name='request')
    method = models.SmallIntegerField('请求方法',choices=method_choices,default=0)
    url = models.CharField('请求路径',default='/',max_length=1000)
    params = models.JSONField('url参数',null=True)
    headers = models.JSONField('请求头',null=True)
    cookies = models.JSONField('Cookies',null=True)
    data = models.JSONField('表单参数',null=True)
    json = models.JSONField('json参数',null=True)

    def __str__(self):
        return self.url

    class Meta(CommonInfo.Meta):
        verbose_name= '请求信息表'
