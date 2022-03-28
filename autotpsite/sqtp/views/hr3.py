"""
@author: haiwen
@date: 2021/11/9
@file: hr3.py
"""
import os

from httprunner import loader, compat
from httprunner.cli import main_run
from rest_framework import status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from sqtp.models import Request, Case, Step
from sqtp.serializers import RequestSerializer, CaseSerializer, StepSerializer
from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets
from django.utils.decorators import method_decorator
from rest_framework.parsers import FileUploadParser


# 优化3：视图集--增删改查
@method_decorator(name='list',
                  decorator=swagger_auto_schema(operation_summary='列出数据', operation_description='列出请求数据...'))
@method_decorator(name='create',
                  decorator=swagger_auto_schema(operation_summary='增加数据', operation_description='增加请求数据...'))
@method_decorator(name='retrieve',
                  decorator=swagger_auto_schema(operation_summary='查看详情', operation_description='查看单个请求数据...'))
@method_decorator(name='destroy',
                  decorator=swagger_auto_schema(operation_summary='删除数据', operation_description='删除请求数据...'))
@method_decorator(name='update',
                  decorator=swagger_auto_schema(operation_summary='更新数据', operation_description='更新请求数据...'))
class RequestViewSet(viewsets.ModelViewSet):
    queryset = Request.objects.all()  # 数据的查询集
    serializer_class = RequestSerializer


class CaseViewSet(viewsets.ModelViewSet):
    queryset = Case.objects.all()
    serializer_class = CaseSerializer

    # 同步创建用户
    def perform_create(self, serializer):
        serializer.save(create_by=self.request.user)

    # 同步更新用户
    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    @action(methods=['GET'], detail=True, url_path='run', url_name='run_case')
    # 完整的url等于/cases/<int:pk>/run
    def run_case(self, request, pk):
        # 获取序列化器
        case = Case.objects.get(pk=pk)  # 根据ID获取当前用例
        serializer = self.get_serializer(instance=case)
        path = serializer.to_json_file()
        # subprocess.Popen(f'hrun {path}',shell=True)  #命令行执行法
        # HR3 API执行法
        exit_code = main_run([path])
        # 根据推出代码判断是否执行成功
        if exit_code != 0:
            return Response(data={'error': 'failed run case', 'retcode': exit_code},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(data={'msg': 'run success', 'retcode': 200})


class StepViewSet(viewsets.ModelViewSet):
    queryset = Step.objects.all()
    serializer_class = StepSerializer


class FileUploadView(APIView):
    parser_classes = [FileUploadParser]  # 指定数据解析器

    def put(self, request, filename, format=None):
        # 接收文件
        file_list = request.FILES
        if not os.path.exists('upload'):  # 确保project_dir/upload存在
            os.mkdir('upload')
        for k, v in file_list.items():
            with open(f'upload/{v.name}', 'wb') as f:
                f.write(v.read())  # 保存上传文件内容
        # 去除http文件分隔符，前三行和最后一行
        with open(f'upload/{filename}', ) as f:
            lines = f.readlines()[3:][:-1]  # 过滤前三行和最后一行
        with open(f'upload/{filename}', 'w') as f:
            for line in lines:
                f.write(line)

        # 检查文件内容是否符合hr3格式
        try:
            content = loader.load_test_file(f'upload/{filename}')
            valid_case = compat.ensure_testcase_v3(content)
        except Exception as e:
            raise serializers.ValidationError(f'错误的hr3用例格式: {repr(e)}')
        # 内容导入到数据库
        valid_case['project_id'] = 1 # 上传用例时的默认关联项目
        serializer = CaseSerializer(data=valid_case)
        if serializer.is_valid():
            serializer.save()
        else:
            return Response({'retcode': 400, 'msg': 'upload failed', 'error': serializer.errors}, status=400)

        return Response({'retcode': 204, 'msg': 'uploading..'})
