"""
@author: haiwen
@date: 2021/11/9
@file: mgr.py
"""

# Create your views here.

from sqtp.models import  Project, Environment
from sqtp.permissions import IsOwnerOrReadOnly
from sqtp.serializers import  ProjectSerializer, \
    EnvironmentSerializer
from rest_framework import viewsets


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    #权限
    permission_classes = (IsOwnerOrReadOnly,)


class EnvironmentViewSet(viewsets.ModelViewSet):
    queryset = Environment.objects.all()
    serializer_class = EnvironmentSerializer
    #权限
    #authentication_classes = (()) #传入空元组表示禁用全局认证
    permission_classes = (())