from celery import shared_task
from django.utils import timezone
from django.conf import settings
import logging

from .models import Alert, AlertRule
from threats.models import Threat

logger = logging.getLogger(__name__)

@shared_task
def create_threat_alert(threat_id):
    """Create an alert for a high-risk threat"""
    try:
        threat = Threat.objects.get(id=threat_id)
        
        # Check if alert already exists for this threat
        if Alert.objects.filter(threat=threat).exists():
            logger.info(f"Alert already exists for threat {threat_id}")
            return
        
        # Determine alert type and priority based on risk score
        if threat.risk_score >= 9:
            alert_type = 'critical'
            priority = 5
        elif threat.risk_score >= 7:
            alert_type = 'high_risk'
            priority = 4
        else:
            alert_type = 'threat_detected'
            priority = 3
        
        # Create alert
        alert = Alert.objects.create(
            threat=threat,
            alert_type=alert_type,
            title=f"High Risk Threat Detected: {threat.title[:100]}",
            description=f"A {threat.get_threat_type_display().lower()} threat with risk score {threat.risk_score} has been detected.\n\nDescription: {threat.description[:500]}",
            priority=priority,
            metadata={
                'auto_generated': True,
                'trigger_threshold': settings.THREAT_ALERT_THRESHOLD,
                'risk_score': threat.risk_score,
            }
        )
        
        # Check for matching alert rules
        apply_alert_rules(alert)
        
        logger.info(f"Alert {alert.id} created for threat {threat_id}")
        
        # Send notifications
        send_alert_notifications.delay(alert.id)
        
    except Exception as e:
        logger.error(f"Error creating alert for threat {threat_id}: {str(e)}")

@shared_task
def apply_alert_rules(alert):
    """Apply alert rules to determine assignment and actions"""
    try:
        active_rules = AlertRule.objects.filter(is_active=True)
        
        for rule in active_rules:
            if rule.matches_threat(alert.threat):
                # Auto-assign if specified
                if rule.auto_assign_to and not alert.assigned_to:
                    alert.assigned_to = rule.auto_assign_to
                
                # Update priority if rule priority is higher
                if rule.priority > alert.priority:
                    alert.priority = rule.priority
                
                # Update alert type if more specific
                if rule.alert_type != 'threat_detected':
                    alert.alert_type = rule.alert_type
        
        alert.save()
        logger.info(f"Alert rules applied to alert {alert.id}")
        
    except Exception as e:
        logger.error(f"Error applying alert rules: {str(e)}")

@shared_task
def send_alert_notifications(alert_id):
    """Send notifications for new alerts"""
    try:
        alert = Alert.objects.get(id=alert_id)
        
        # This is a placeholder for notification logic
        # In production, you would implement:
        # - Email notifications
        # - Slack/Teams notifications
        # - SMS for critical alerts
        # - Push notifications
        
        recipients = []
        
        # Add assigned user
        if alert.assigned_to:
            recipients.append(alert.assigned_to.email)
        
        # Add managers for high priority alerts
        if alert.priority >= 4:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            managers = User.objects.filter(role__in=['admin', 'manager'])
            recipients.extend([user.email for user in managers])
        
        # Log notification (replace with actual notification sending)
        logger.info(f"Would send alert {alert_id} notifications to: {recipients}")
        
    except Exception as e:
        logger.error(f"Error sending alert notifications for {alert_id}: {str(e)}")

@shared_task
def cleanup_old_alerts():
    """Clean up old resolved alerts"""
    try:
        from datetime import timedelta
        cutoff_date = timezone.now() - timedelta(days=90)
        
        old_alerts = Alert.objects.filter(
            status__in=['resolved', 'closed'],
            resolved_at__lt=cutoff_date
        )
        
        count = old_alerts.count()
        old_alerts.delete()
        
        logger.info(f"Cleaned up {count} old alerts")
        
    except Exception as e:
        logger.error(f"Error cleaning up old alerts: {str(e)}")