from django.db import models
from django.contrib.auth import get_user_model
from threats.models import Threat

User = get_user_model()

class Alert(models.Model):
    ALERT_TYPES = [
        ('threat_detected', 'Threat Detected'),
        ('high_risk', 'High Risk Threat'),
        ('critical', 'Critical Alert'),
        ('system', 'System Alert'),
        ('custom', 'Custom Alert'),
    ]
    
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('acknowledged', 'Acknowledged'),
        ('investigating', 'Investigating'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
        ('false_positive', 'False Positive'),
    ]
    
    PRIORITY_CHOICES = [
        (1, 'Very Low'),
        (2, 'Low'),
        (3, 'Medium'),
        (4, 'High'),
        (5, 'Critical'),
    ]
    
    # Core fields
    threat = models.ForeignKey(Threat, on_delete=models.CASCADE, related_name='alerts')
    alert_type = models.CharField(max_length=50, choices=ALERT_TYPES)
    title = models.CharField(max_length=500)
    description = models.TextField()
    priority = models.IntegerField(choices=PRIORITY_CHOICES, default=3)
    
    # Assignment and status
    assigned_to = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='assigned_alerts'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True)
    escalated = models.BooleanField(default=False)
    escalated_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    # Tracking
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='created_alerts'
    )
    
    class Meta:
        db_table = 'alerts'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['priority']),
            models.Index(fields=['alert_type']),
            models.Index(fields=['assigned_to']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['-priority', '-created_at']
    
    def __str__(self):
        return f"{self.get_alert_type_display()} - {self.title[:50]}"
    
    def get_priority_color(self):
        """Return color code for priority level"""
        colors = {
            1: '#28a745',  # Green
            2: '#17a2b8',  # Info
            3: '#ffc107',  # Warning
            4: '#fd7e14',  # Orange
            5: '#dc3545',  # Danger
        }
        return colors.get(self.priority, '#6c757d')
    
    def time_to_acknowledge(self):
        """Calculate time to acknowledge alert"""
        if self.acknowledged_at:
            return self.acknowledged_at - self.created_at
        return None
    
    def time_to_resolve(self):
        """Calculate time to resolve alert"""
        if self.resolved_at:
            return self.resolved_at - self.created_at
        return None

class AlertComment(models.Model):
    alert = models.ForeignKey(Alert, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    comment = models.TextField()
    is_internal = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'alert_comments'
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment by {self.user.email} on {self.alert.title[:30]}"

class AlertRule(models.Model):
    """Rules for automatic alert generation"""
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Conditions
    threat_type = models.CharField(max_length=50, blank=True)
    min_severity = models.IntegerField(default=1)
    min_risk_score = models.FloatField(default=0.0)
    keywords = models.JSONField(default=list, blank=True)
    
    # Actions
    alert_type = models.CharField(max_length=50, choices=Alert.ALERT_TYPES)
    priority = models.IntegerField(choices=Alert.PRIORITY_CHOICES, default=3)
    auto_assign_to = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    
    # Settings
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'alert_rules'
    
    def __str__(self):
        return self.name
    
    def matches_threat(self, threat):
        """Check if this rule matches a given threat"""
        if not self.is_active:
            return False
        
        # Check threat type
        if self.threat_type and threat.threat_type != self.threat_type:
            return False
        
        # Check severity
        if threat.severity < self.min_severity:
            return False
        
        # Check risk score
        if threat.risk_score < self.min_risk_score:
            return False
        
        # Check keywords
        if self.keywords:
            text_content = f"{threat.title} {threat.description}".lower()
            if not any(keyword.lower() in text_content for keyword in self.keywords):
                return False
        
        return True