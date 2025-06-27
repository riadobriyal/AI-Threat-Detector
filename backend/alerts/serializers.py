from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Alert, AlertComment, AlertRule

User = get_user_model()

class AlertSerializer(serializers.ModelSerializer):
    threat_title = serializers.CharField(source='threat.title', read_only=True)
    threat_type = serializers.CharField(source='threat.threat_type', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    priority_color = serializers.CharField(source='get_priority_color', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    time_to_acknowledge = serializers.CharField(read_only=True)
    time_to_resolve = serializers.CharField(read_only=True)
    
    class Meta:
        model = Alert
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'created_by']

class AlertCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = ['threat', 'alert_type', 'title', 'description', 'priority', 
                 'assigned_to', 'metadata']

class AlertUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = ['title', 'description', 'priority', 'assigned_to', 'status', 'metadata']

class AlertCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = AlertComment
        fields = '__all__'
        read_only_fields = ['created_at', 'user']

class AlertRuleSerializer(serializers.ModelSerializer):
    auto_assign_to_name = serializers.CharField(source='auto_assign_to.get_full_name', read_only=True)
    
    class Meta:
        model = AlertRule
        fields = '__all__'
        read_only_fields = ['created_at']

class AlertStatsSerializer(serializers.Serializer):
    total_alerts = serializers.IntegerField()
    open_alerts = serializers.IntegerField()
    high_priority_alerts = serializers.IntegerField()
    alerts_by_status = serializers.DictField()
    alerts_by_priority = serializers.DictField()
    recent_alerts = serializers.IntegerField()
    avg_resolution_time = serializers.FloatField()