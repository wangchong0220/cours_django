"""
@author: haiwen
@date: 2021/10/26
@file: renderers.py
"""
from rest_framework.renderers import JSONRenderer
# 自定义渲染器
class MyRenderer(JSONRenderer):
    #重构render方法
    def render(self, data, accepted_media_type=None, renderer_context=None):
        status_code = renderer_context['response'].status_code
        # 正常返回 status_code 以2开头
        if str(status_code).startswith('2'):
            # 处理自定义分页内容
            res={'msg':'success','retcode':status_code} #返回模板
            if not isinstance(data,list):
                if 'retlist' not in data:
                    res.update({'retlist':[data]}) # 单个数据的情况
                else:
                    res.update(data) # 多个数据情况
            else:
                res.update({'retlist':data})
            return super().render(res,accepted_media_type,renderer_context)
        else: # 异常情况
            return super().render(data,accepted_media_type,renderer_context)
