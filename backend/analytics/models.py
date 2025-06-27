from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class ThreatPrediction(models.Model):
    """Store ML model predictions for threats"""
    threat = models.OneToOneField(
        'threats.Threat',
        on_delete=models.CASCADE,
        related_name='prediction'
    )
    predicted_resolution_time = models.FloatField()
    confidence_interval_lower = models.FloatField()
    confidence_interval_upper = models.FloatField()
    risk_level = models.CharField(max_length=20)
    model_used = models.CharField(max_length=100)
    prediction_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'threat_predictions'
    
    def __str__(self):
        return f"Prediction for {self.threat.title}: {self.predicted_resolution_time}h"

class MLModelMetrics(models.Model):
    """Track ML model performance metrics"""
    model_name = models.CharField(max_length=100)
    accuracy = models.FloatField()
    precision = models.FloatField()
    recall = models.FloatField()
    f1_score = models.FloatField()
    training_date = models.DateTimeField()
    data_points_used = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'ml_model_metrics'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.model_name} - Accuracy: {self.accuracy:.2%}"

class DashboardMetrics(models.Model):
    """Store dashboard analytics and metrics"""
    date = models.DateField(unique=True)
    total_threats = models.IntegerField(default=0)
    critical_threats = models.IntegerField(default=0)
    high_threats = models.IntegerField(default=0)
    medium_threats = models.IntegerField(default=0)
    low_threats = models.IntegerField(default=0)
    resolved_threats = models.IntegerField(default=0)
    false_positives = models.IntegerField(default=0)
    avg_resolution_time = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'dashboard_metrics'
        ordering = ['-date']
    
    def __str__(self):
        return f"Metrics for {self.date}"