"""
@author: haiwen
@date: 2021/11/9
@file: demo001.py
"""

# 过滤参数测试--接收字典格式参数，过滤掉不必要和非空的字段
from pprint import pprint


def filter_data(data):
    # 准备HR3格式模板，用来比对数据
    template = {
        'config': {
            'name': str,
            'base_url': str,
            'variables': dict,
            'parameters': dict,
            'verify': bool,
            'export': list
        },
        'teststeps': [{
            'name': str,
            'variables': list,
            'extract': dict,
            'validate': list,
            'setup_hooks': list,
            'teardown_hooks': list,
            'request': {
                'method': str,
                'url': str,
                'params': list,
                'headers': dict,
                'cookies': dict,
                'data': dict,
                'json': dict
            },
        }]
    }
    return merge_dict(template,data)

def merge_dict(left,right):
    '''
    合并字典同类项，删除空的数据
    '''
    # 覆盖左侧模板同类项
    for k in right:
        if k in left:
            if isinstance(left[k],dict) and isinstance(right[k],dict):
                merge_dict(left[k],right[k])
            elif isinstance(left[k],list) and isinstance(right[k],list):
                for one in right[k]:
                    merge_dict(left[k][0],one)
            # 合并条件:right[k]不为空（也包含空字符串，空列表，空字典）
            elif right[k]:
                left[k]=right[k]
            elif not right[k]:
                left.pop(k) # 删除左侧对应右侧为空的数据
    # 删除左侧多余项
    for k in list(left.keys()):
        if k not in right:
            left.pop(k)

    return left  # left为处理好的数据。

if __name__ == '__main__':
    template = {
        'config': {
            'name': str,
            'base_url': str,
            'variables': dict,
            'parameters': dict,
            'verify': bool,
            'export': list
        },
        'teststeps': [{
            'name': str,
            'variables': list,
            'extract': dict,
            'validate': list,
            'setup_hooks': list,
            'teardown_hooks': list,
            'request': {
                'method': str,
                'url': str,
                'params': list,
                'headers': dict,
                'cookies': dict,
                'data': dict,
                'json': dict
            },
        }]
    }
    data={
        "config": {
            "project": {
                "id": 1,
                "admin": {
                    "date_joined": "2021-11-02T12:57:17.610002Z",
                    "email": "haiwen@sqtest.com",
                    "id": 1,
                    "is_active": True,
                    "is_superuser": True,
                    "phone": "13512354875",
                    "realname": "海文",
                    "username": "haiwen",
                    "user_type": 1
                },
                "name": "测开3期",
                "status": 0,
                "version": "v3",
                "desc": "测开3期",
                "create_time": "2021-11-02 14:20:24",
                "update_time": "2021-11-02 14:20:24"
            },
            "name": "case004",
            "base_url": "localhost",
            "variables": {},
            "parameters": {},
            "export": [],
            "verify": False
        },
        "teststeps": [
            {
                "name": "step_name",
                "variables": {},
                "request": {
                    "method": "GET",
                    "url": "/demo/path",
                    "params": None,
                    "headers": None,
                    "json": None,
                    "data": None
                },
                "extract": {},
                "validate": [],
                "setup_hooks": [],
                "teardown_hooks": [],
                "belong_case_id": 1,
                "sorted_no": 1
            }
        ],
        "desc": "testcase666",
        "id": 1,
        "file_path": "测开3期_case001.json",
        "create_time": "2021-11-04T13:01:04.720807Z",
        "update_time": "2021-11-09T12:49:20.941195Z"
    }
    res = merge_dict(template,data)
    pprint(res)