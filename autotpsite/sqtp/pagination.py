"""
@author: haiwen
@date: 2021/11/13
@file: pagination.py
"""
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class MyPageNumberPagination(PageNumberPagination):
    page_size = 5  # 默认的页面大小
    page_size_query_param = 'page_size'  # 前端的page_size查询参数
    page_query_param = 'page_index'      # 前端传递的页码参数--page_index

    # 覆盖父类返回数据格式
    def get_paginated_response(self, data):
        resp_data = {
            'retlist': data,                    # 分页后的数据
            'total': self.page.paginator.count  # 总数据量
        }
        return Response(resp_data)