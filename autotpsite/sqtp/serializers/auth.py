"""
@author: haiwen
@date: 2021/11/4
@file: auth.py
"""
from django.contrib import auth
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from sqtp.models import  User

#注册序列化器
class RegisterSerializer(serializers.ModelSerializer):
    admin_code = serializers.CharField(default='')

    class Meta:
        model = User
        fields=['username','password','email','phone','realname','admin_code']

    # 校验器-自定义校验规则
    def validate(self, attrs): # attrs为入参的字典形式
        #检测admin_code是否正确，
        if attrs.get('admin_code') and attrs['admin_code'] != 'sqtp':
            raise ValidationError('错误的admin_code')
        return attrs #需要返回attrs

    # 创建用户数据
    def register(self):
        #获取入参
        in_param = self.data
        if 'admin_code' in in_param: #创建管理员
            in_param.pop('admin_code') # 用户模型没有admin_code字段，硬传会报错
            user=User.objects.create_superuser(**in_param)
        else:
            user=User.objects.create_user(**in_param)
        return user

#登录序列化器
class LoginSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username','password']

    def validate(self, attrs):
        #验证用户名和密码
        user = auth.authenticate(**attrs)
        if not user:
            raise ValidationError('用户名或密码错误')
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['date_joined','email','id','is_active','is_superuser','phone','realname','username','user_type']