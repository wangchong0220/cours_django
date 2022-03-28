"""
@author: haiwen
@date: 2021/10/23
@file: urls.py
"""

from django.urls import path, include
from rest_framework import permissions

from sqtp import views
from rest_framework.urlpatterns import format_suffix_patterns
# 使用rest框架自带的路由器生成路由列表
from rest_framework.routers import DefaultRouter
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(  # 文档视图
    openapi.Info(
        title='SQTP API DOC',
        default_version='v1',
        description='SQTP接口文档',
        terms_of_service='https://www.songqin.net',
        contact=openapi.Contact(email='haiwen@sqtest.org', url='http://haiwenblog.org'),
        license=openapi.License(name='BSD License')
    ),
    public=True,
    permission_classes=(permissions.AllowAny,)
)

router = DefaultRouter()
router.register(r'requests', views.RequestViewSet),  # 将视图信息注册路由列表
router.register(r'cases', views.CaseViewSet)
router.register(r'steps', views.StepViewSet)
router.register(r'projects', views.ProjectViewSet)
router.register(r'envs', views.EnvironmentViewSet)
router.register(r'plans', views.PlanViewSet)
router.register(r'reports',views.ReportViewSet)

urlpatterns = [
    # path('requests/',views.RequestList.as_view()), #视图类需要调用as_view转化
    # path('requests/<int:pk>',views.RequestDetail.as_view()),
    path('', include(router.urls)),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='redoc-ui'),
    path('users/', views.user_list),
    path('users/<int:_id>', views.user_detail),
    # 注册
    path('register/', views.register),
    # 登录
    path('login/', views.login),
    # 登出
    path('logout/', views.logout),
    # 当前用户信息
    path('current_user/', views.current_user),
    # 上传文件
    path('upload/<str:filename>/',views.FileUploadView.as_view())
]
# urlpatterns = format_suffix_patterns(urlpatterns) #重写路由
