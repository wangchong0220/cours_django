"""
@author: haiwen
@date: 2021/10/23
@file: test_serializers.py
"""
from django.test import TestCase
from sqtp.models import Step, Request
from sqtp.serializers import RequestSerializer
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser

class TestRequestSerializer(TestCase):
    req1 = Request.objects.create(method=1,url='/mgr/teacher1/',data={"name":"小刚","age":18,"address":"beijing"})
    # 序列化1：数据对象转化成python原生数据类型
    req1_serializer = RequestSerializer(req1)
    print(req1_serializer.data)  # 序列化后的数据存储于序列化对象的data属性中
    # 序列化2： python原生数据类型转化为Json
    content =JSONRenderer().render(req1_serializer.data)
    print(content)

    # 反序列化1： 将数据流解析为Python原生数据类型
    import io
    steam = io.BytesIO(content)  #构建一个steam流
    data = JSONParser().parse(steam) # 转化成python原生数据类型
    print(data)
    # 反序列化2： python原生数据转化成模型对象实例
    serializer = RequestSerializer(data=data) #构建序列化器
    if serializer.is_valid(): #校验入参是否合法
        print(serializer.validated_data) # 校验之后的数据
        serializer.save()               # 保存数据对象

    # 序列化器返回完整结果集
    serializer = RequestSerializer(Request.objects.all(),many=True)
    print(serializer.data)  #

    # 序列化器内部代码
    print(repr(serializer))