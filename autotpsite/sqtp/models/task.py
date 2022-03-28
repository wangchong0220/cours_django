"""
@author: haiwen
@date: 2021/11/9
@file: task.py
"""
from django.conf import settings
from django.db import models

from .base import CommonInfo
from .hr3 import Case
from .mgr import Environment

# 测试计划与测试报告
class Plan(CommonInfo):
    status_choice=(
        (0,'未运行'),
        (1,'执行中'),
        (2,'中断'),
        (3,'已执行'),
    )
    # 关联用例
    cases = models.ManyToManyField(Case,verbose_name='测试用例',blank=True)
    # 执行者
    executor = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.DO_NOTHING,null=True,verbose_name='执行者')
    # 测试环境
    environment = models.ForeignKey(Environment,on_delete=models.SET_NULL,null=True,verbose_name='测试环境')
    # 状态
    status = models.SmallIntegerField(choices=status_choice,default=0,verbose_name='执行状态')
    # 执行次数
    exec_counts = models.PositiveSmallIntegerField(default=0,verbose_name='执行次数')
    # 计划名称
    name = models.CharField('计划名称',max_length=32,unique=True)

    class Meta(CommonInfo.Meta):
        pass


class Report(CommonInfo):
    # 关联计划
    plan = models.ForeignKey(Plan,on_delete=models.DO_NOTHING,related_name='reports')
    # 报告文件路径
    path = models.CharField('报告路径',max_length=500)
    # 保存报告详情
    detail = models.TextField('报告详情')
    # 执行人
    trigger = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.DO_NOTHING,null=True)
