from celery import shared_task
from django.utils import timezone
from django.db.models import Count, Avg
from datetime import date, timedelta
import logging
import requests

from .models import DashboardMetrics, MLModelMetrics
from threats.models import Threat
from alerts.models import Alert

logger = logging.getLogger(__name__)

@shared_task
def update_daily_metrics():
    """Update daily dashboard metrics"""
    try:
        today = timezone.now().date()
        
        # Calculate metrics for today
        threats_today = Threat.objects.filter(
            created_at__date=today,
            is_active=True
        )
        
        alerts_today = Alert.objects.filter(created_at__date=today)
        
        total_threats = threats_today.count()
        critical_threats = threats_today.filter(severity__gte=8).count()
        high_threats = threats_today.filter(severity__in=[6, 7]).count()
        medium_threats = threats_today.filter(severity__in=[4, 5]).count()
        low_threats = threats_today.filter(severity__lte=3).count()
        
        resolved_threats = alerts_today.filter(status='resolved').count()
        false_positives = threats_today.filter(is_false_positive=True).count()
        
        # Calculate average resolution time
        resolved_alerts = alerts_today.filter(resolved_at__isnull=False)
        avg_resolution_time = 0
        if resolved_alerts.exists():
            avg_time = resolved_alerts.aggregate(
                avg_time=Avg('resolved_at') - Avg('created_at')
            )['avg_time']
            if avg_time:
                avg_resolution_time = avg_time.total_seconds() / 3600
        
        # Update or create metrics
        metrics, created = DashboardMetrics.objects.update_or_create(
            date=today,
            defaults={
                'total_threats': total_threats,
                'critical_threats': critical_threats,
                'high_threats': high_threats,
                'medium_threats': medium_threats,
                'low_threats': low_threats,
                'resolved_threats': resolved_threats,
                'false_positives': false_positives,
                'avg_resolution_time': avg_resolution_time,
            }
        )
        
        action = "Created" if created else "Updated"
        logger.info(f"{action} daily metrics for {today}")
        
    except Exception as e:
        logger.error(f"Error updating daily metrics: {str(e)}")

@shared_task
def check_ml_model_health():
    """Check ML model API health and update metrics"""
    try:
        ml_api_url = "http://localhost:8000/health"
        response = requests.get(ml_api_url, timeout=5)
        
        if response.status_code == 200:
            health_data = response.json()
            logger.info(f"ML Model health check: {health_data}")
            
            # You could store health metrics here
            # For now, just log the status
            
        else:
            logger.warning(f"ML Model health check failed: {response.status_code}")
            
    except requests.RequestException as e:
        logger.error(f"ML Model health check error: {str(e)}")

@shared_task
def cleanup_old_metrics():
    """Clean up old dashboard metrics (keep last 90 days)"""
    try:
        cutoff_date = timezone.now().date() - timedelta(days=90)
        
        deleted_count = DashboardMetrics.objects.filter(
            date__lt=cutoff_date
        ).delete()[0]
        
        logger.info(f"Cleaned up {deleted_count} old dashboard metrics")
        
    except Exception as e:
        logger.error(f"Error cleaning up old metrics: {str(e)}")