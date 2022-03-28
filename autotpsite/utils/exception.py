"""
@author: haiwen
@date: 2021/10/28
@file: exception.py
"""
from rest_framework import exceptions
from rest_framework.views import exception_handler,Response

# 处理异常返回
def my_exception_handler(exc,context):
    '''
    exc：异常信息
    context 上下文
    '''
    #获取标准错误响应
    error_response= exception_handler(exc,context)
    if error_response: # 属于APIExcpetion
        if isinstance(exc,exceptions.APIException):
            error_msg = exc.detail
        else:
            error_msg = exc    # Http404 或者 PermissionDenied

        error_response.data={
            'msg':'error',
            'retcode': error_response.status_code,
            'error': str(error_msg)
        }

    return error_response