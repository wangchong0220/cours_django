"""
@author: haiwen
@date: 2021/10/30
@file: base.py
"""
from django.db import models
from django.conf import settings
# 公共模型
class CommonInfo(models.Model):
    # 公共字段部分--创建时间，更新时间，描述,创建者，更新者
    create_time = models.DateTimeField('创建时间',auto_now_add=True,null=True)
    # auto_now_add 第1次创建数据时自动添加当前时间
    update_time = models.DateTimeField('更新时间',auto_now=True)
    # auto_now 每次更新数据时自动添加当前时间
    desc = models.TextField(null=True,blank=True,verbose_name='描述')

    create_by = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.DO_NOTHING,null=True,verbose_name='创建者',related_name='%(class)s_create_by')

    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.DO_NOTHING,null=True,verbose_name='更新者',related_name='%(class)s_updated_by')

    def __str__(self):
        # 判断当前数据对象是否有name属性
        if hasattr(self,'name'): # hasattr(self,'name') python中反射的一种用法
            return self.name
        else:
            return self.desc   # 返回描述信息

    class Meta:
        abstract = True  # 当前类为抽象表，字段会被子模型类继承，但是不会创建数据库表 只有abstract这个字段不会被继承
        ordering = ['id']