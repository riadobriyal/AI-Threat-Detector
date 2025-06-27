from django.contrib import admin
from .models import ThreatPrediction, MLModelMetrics, DashboardMetrics

@admin.register(ThreatPrediction)
class ThreatPredictionAdmin(admin.ModelAdmin):
    list_display = ['threat', 'predicted_resolution_time', 'risk_level', 'model_used', 'prediction_date']
    list_filter = ['risk_level', 'model_used', 'prediction_date']
    search_fields = ['threat__title']
    readonly_fields = ['prediction_date']

@admin.register(MLModelMetrics)
class MLModelMetricsAdmin(admin.ModelAdmin):
    list_display = ['model_name', 'accuracy', 'precision', 'recall', 'f1_score', 'training_date']
    list_filter = ['model_name', 'training_date']
    readonly_fields = ['created_at']

@admin.register(DashboardMetrics)
class DashboardMetricsAdmin(admin.ModelAdmin):
    list_display = ['date', 'total_threats', 'critical_threats', 'resolved_threats', 'avg_resolution_time']
    list_filter = ['date']
    readonly_fields = ['created_at']