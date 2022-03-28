"""
@author: haiwen
@date: 2021/11/2
@file: permissions.py
"""
from rest_framework import permissions

#自定义权限类
class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # 如果是访问之类的HTTP方法，就通过
        if request.method in permissions.SAFE_METHODS:
            return True
        # 当前用户是否属于该项目管理员
        return obj.admin == request.user