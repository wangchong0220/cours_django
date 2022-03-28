"""
@author: haiwen
@date: 2021/11/9
@file: auth.py
"""
from django.contrib import auth
from rest_framework import status
from rest_framework.authentication import BasicAuthentication, SessionAuthentication
from rest_framework.decorators import api_view, authentication_classes, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from sqtp.models import User
from sqtp.serializers import UserSerializer, RegisterSerializer, LoginSerializer

@api_view(['GET'])
@authentication_classes((BasicAuthentication,SessionAuthentication))
@permission_classes((IsAuthenticated,))
def user_list(request):
    query_set = User.objects.all()
    serializer = UserSerializer(query_set, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def user_detail(request, _id):
    try:
        user = User.objects.get(pk=_id)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    serializer = UserSerializer(instance=user)
    return Response(serializer.data)

#注册用户
@api_view(['POST'])
@permission_classes(())
def register(request):
    # 获取序列化器
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid(): #根据序列器和模型字段综合检查数据是否合法
        user = serializer.register() #创建用户数据
        auth.login(request,user) # 完成用户登录状态设置
        return Response(data={'msg':'register success','is_admin':user.is_superuser,'retcode':status.HTTP_201_CREATED},status=status.HTTP_201_CREATED)
    return Response(data={'msg':'error','retcode':status.HTTP_400_BAD_REQUEST,'error':serializer.errors},status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes(())
def login(request):
    # 获取登录信息--序列化器
    serializer = LoginSerializer(data=request.data)
    user = serializer.validate(request.data)
    if user:
        auth.login(request,user) #登录存储session信息
        return Response(data={'msg':'login success','to':'index.html'},status=status.HTTP_302_FOUND)
    return Response(data={'msg':'error','retcode':status.HTTP_400_BAD_REQUEST,'error':serializer.errors},status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def logout(request):
    if request.user.is_authenticated: #如果当前用户处于登录状态
        auth.logout(request) #登出，清除session
    return Response(data={'msg':'logout success','to':'login.html'},status=status.HTTP_302_FOUND)

#当前用户信息
@api_view(['GET'])
@permission_classes(())
def current_user(request):
    if request.user.is_authenticated: #如果当前用户处于登录状态
        # 返回当前用户信息
        serializer = UserSerializer(request.user)
        return Response(data=serializer.data)
    else:
        return Response(data={'retcode':403,'msg':'未登录','to':'login.html'},status=403)