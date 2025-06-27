from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AnalyticsViewSet, ThreatPredictionViewSet, MLModelMetricsViewSet

router = DefaultRouter()
router.register(r'dashboard', AnalyticsViewSet, basename='analytics')
router.register(r'predictions', ThreatPredictionViewSet)
router.register(r'model-metrics', MLModelMetricsViewSet)

urlpatterns = [
    path('', include(router.urls)),
]