from rest_framework import serializers
from .models import ThreatPrediction, MLModelMetrics, DashboardMetrics

class ThreatPredictionSerializer(serializers.ModelSerializer):
    threat_title = serializers.CharField(source='threat.title', read_only=True)
    threat_type = serializers.CharField(source='threat.threat_type', read_only=True)
    
    class Meta:
        model = ThreatPrediction
        fields = '__all__'

class MLModelMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = MLModelMetrics
        fields = '__all__'

class DashboardMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DashboardMetrics
        fields = '__all__'

class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for real-time dashboard statistics"""
    total_threats = serializers.IntegerField()
    critical_threats = serializers.IntegerField()
    high_threats = serializers.IntegerField()
    medium_threats = serializers.IntegerField()
    low_threats = serializers.IntegerField()
    resolved_threats = serializers.IntegerField()
    false_positives = serializers.IntegerField()
    avg_resolution_time = serializers.FloatField()
    
    # Trend data
    threat_trend = serializers.ListField()
    threat_types_distribution = serializers.DictField()
    top_sources = serializers.ListField()
    
    # ML Model performance
    model_accuracy = serializers.FloatField()
    prediction_confidence = serializers.FloatField()
    
    # Real-time metrics
    active_feeds = serializers.IntegerField()
    last_update = serializers.DateTimeField()