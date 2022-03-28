"""
@author: haiwen
@date: 2021/11/4
@file: mgr.py
"""
from rest_framework import serializers

from sqtp.models import  Project, Environment

# 项目
from sqtp.serializers import UserSerializer


class ProjectSerializer(serializers.ModelSerializer):
    create_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S',read_only=True)
    update_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S',read_only=True)
    admin_id = serializers.IntegerField(write_only=True)
    admin = UserSerializer(read_only=True)

    class Meta:
        model = Project
        fields = ['id','admin','admin_id','name','status','version','desc','create_time','update_time',]


# 环境
class EnvironmentSerializer(serializers.ModelSerializer):
    project_id=serializers.IntegerField(write_only=True)
    project = ProjectSerializer(read_only=True)
    category = serializers.SerializerMethodField()
    os = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    create_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S',read_only=True)
    update_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S',read_only=True)

    def get_category(self,obj):
        return obj.get_category_display()

    def get_status(self,obj):
        return obj.get_status_display()

    def get_os(self,obj):
        return obj.get_os_display()

    def validate(self, attrs): # 综合校验器
        return attrs

    def validate_project_id(self,project_id): #单个字段校验器
        #根据project_id能找到对应的项目
        if not Project.objects.filter(pk=project_id).count():
            raise serializers.ValidationError('请传递正确的project_id')
        return project_id

    class Meta:
        model = Environment
        fields = '__all__'