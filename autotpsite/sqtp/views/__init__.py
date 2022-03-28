"""
@author: haiwen
@date: 2021/11/9
@file: __init__.py.py
"""
from .auth import user_list,user_detail,current_user,register,login,logout
from .hr3 import CaseViewSet,RequestViewSet,StepViewSet,FileUploadView
from .mgr import ProjectViewSet,EnvironmentViewSet
from .task import PlanViewSet,ReportViewSet