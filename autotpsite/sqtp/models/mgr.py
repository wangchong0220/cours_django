"""
@author: haiwen
@date: 2021/10/30
@file: mgr.py
"""
from django.db import models
from .base import CommonInfo

from django.conf import settings

class Project(CommonInfo):
    PRO_STATUS=(
        (0,'开发中'),
        (1,'维护中'),
        (2,'稳定运行'),
    )
    # 管理员
    admin = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.DO_NOTHING,null=True,verbose_name='项目管理员',related_name='project_admin')
    # 成员
    members = models.ManyToManyField(settings.AUTH_USER_MODEL,verbose_name='项目成员',related_name='project_members')

    # 名称
    name = models.CharField('项目名称',max_length=32,unique=True,)
    # 状态 - 开发中，维护中，稳定运行
    status = models.SmallIntegerField('项目状态',choices=PRO_STATUS,default=2)
    # 版本
    version = models.CharField('项目版本',max_length=32,default='v0.1')

    class Meta(CommonInfo.Meta): # 元类需要显示继承父类的元类才会生效
        ordering = ["id",]
        verbose_name = "项目表"


class Environment(CommonInfo):
    # 服务器类型选项
    service_type=(
        (0,'web服务器'),
        (1,'数据库服务器'),
    )
    service_os=(
        (0,'windows'),
        (1,'Linux'),
    )
    #服务器状态
    service_status=(
        (0,'active'),
        (1,'disable')
    )
    project = models.ForeignKey(Project,on_delete=models.CASCADE,verbose_name='所属项目')
    # ip django-ORM提供GenericIPAddressField专门存储IP类型信息
    ip = models.GenericIPAddressField('IP地址',default='127.0.0.1')
    port = models.PositiveSmallIntegerField(default=80,verbose_name='端口号')
    category=models.SmallIntegerField('服务器类型',default=0,choices=service_type)
    os = models.SmallIntegerField('服务器操作系统',choices=service_os,default=1)
    status = models.SmallIntegerField('服务器状态',choices=service_status,default=0)

    def __str__(self):
        return self.ip+':'+self.port

    class Meta(CommonInfo.Meta):
        ordering = ["id",]
        verbose_name = '测试环境'
