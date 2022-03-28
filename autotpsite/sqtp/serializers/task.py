"""
@author: haiwen
@date: 2021/11/9
@file: task.py
"""

from rest_framework import serializers
from sqtp.models import Plan, Environment, User, Case, Report
from sqtp.serializers import EnvironmentSerializer, UserSerializer, CaseSerializer


class PlanSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    environment = EnvironmentSerializer(read_only=True)
    executor = UserSerializer(read_only=True)
    environment_id = serializers.IntegerField(write_only=True, required=False)
    executor_id = serializers.IntegerField(write_only=True, required=False)
    case_ids = serializers.PrimaryKeyRelatedField(queryset=Case.objects.all(), many=True, required=False,write_only=True)
    cases = CaseSerializer(read_only=True, many=True)
    create_by = UserSerializer(write_only=True, required=False)
    updated_by = UserSerializer(write_only=True, required=False)
    create_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    update_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)

    def get_status(self, obj):
        return obj.get_status_display()

    class Meta:
        model = Plan
        fields = ['case_ids','cases',  'id', 'name', 'desc', 'status', 'exec_counts', 'environment', 'executor','create_time', 'update_time', 'environment_id', 'executor_id', 'create_by', 'updated_by']

    def validate(self, attrs):
        environment_id = attrs.get('environment_id', 0)
        executor_id = attrs.get('executor_id', 0)
        if not Environment.objects.filter(pk=environment_id).count():
            raise serializers.ValidationError(f'请传入正确的environment_id: {environment_id}')
        if not User.objects.filter(pk=executor_id).count():
            raise serializers.ValidationError(f'请传入正确的executor_id: {executor_id}')

        return attrs

    def update(self, instance, validated_data):
        # 关联用例
        case_ids = validated_data.pop('case_ids') # caseid列表
        instance.cases.set(case_ids) # 重新关联用例数据
        # 设置plan自身属性
        for k,v in validated_data.items():
            setattr(instance,k,v)
        instance.save()
        return instance

class ReportSerialzier(serializers.ModelSerializer):
    plan = PlanSerializer(read_only=True)
    trigger = UserSerializer(read_only=True)
    create_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True) #开始时间
    update_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True) #结束时间

    class Meta:
        model = Report
        fields = ['id','plan','trigger','detail','create_time','update_time','detail','path']
