from rest_framework import serializers
from .models import Threat, ThreatFeed

class ThreatSerializer(serializers.ModelSerializer):
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    threat_type_display = serializers.CharField(source='get_threat_type_display', read_only=True)
    severity_color = serializers.CharField(source='get_severity_display_color', read_only=True)
    
    class Meta:
        model = Threat
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'risk_score', 
                           'ai_classification', 'incident_response_suggestion']

class ThreatCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Threat
        fields = ['source', 'threat_type', 'severity', 'title', 'description', 
                 'date_detected', 'related_assets', 'indicators_of_compromise', 
                 'references', 'tags', 'external_id', 'cve_id']

class ThreatUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Threat
        fields = ['title', 'description', 'severity', 'related_assets', 
                 'indicators_of_compromise', 'references', 'tags', 
                 'is_active', 'is_false_positive']

class ThreatFeedSerializer(serializers.ModelSerializer):
    class Meta:
        model = ThreatFeed
        fields = '__all__'
        read_only_fields = ['created_at', 'last_fetched', 'total_threats_imported']

class ThreatStatsSerializer(serializers.Serializer):
    total_threats = serializers.IntegerField()
    active_threats = serializers.IntegerField()
    high_risk_threats = serializers.IntegerField()
    threats_by_type = serializers.DictField()
    threats_by_severity = serializers.DictField()
    recent_threats = serializers.ListField()