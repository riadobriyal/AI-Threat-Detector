from django.db import models
from django.contrib.auth import get_user_model
from threats.models import Threat

User = get_user_model()

class Incident(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'),
        ('assigned', 'Assigned'),
        ('investigating', 'Investigating'),
        ('containment', 'Containment'),
        ('eradication', 'Eradication'),
        ('recovery', 'Recovery'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    PRIORITY_CHOICES = [
        (1, 'Very Low'),
        (2, 'Low'),
        (3, 'Medium'),
        (4, 'High'),
        (5, 'Critical'),
    ]
    
    CATEGORY_CHOICES = [
        ('security_incident', 'Security Incident'),
        ('data_breach', 'Data Breach'),
        ('malware', 'Malware Incident'),
        ('phishing', 'Phishing Incident'),
        ('ddos', 'DDoS Attack'),
        ('insider_threat', 'Insider Threat'),
        ('system_compromise', 'System Compromise'),
        ('other', 'Other'),
    ]
    
    # Core fields
    title = models.CharField(max_length=500)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    priority = models.IntegerField(choices=PRIORITY_CHOICES, default=3)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    
    # Relationships
    threat = models.ForeignKey(
        Threat, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='incidents'
    )
    assigned_to = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='assigned_incidents'
    )
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='created_incidents'
    )
    
    # Impact assessment
    affected_systems = models.JSONField(default=list, blank=True)
    affected_users = models.IntegerField(default=0)
    business_impact = models.TextField(blank=True)
    
    # Response details
    containment_actions = models.TextField(blank=True)
    eradication_actions = models.TextField(blank=True)
    recovery_actions = models.TextField(blank=True)
    lessons_learned = models.TextField(blank=True)
    
    # Metadata
    external_reference = models.CharField(max_length=200, blank=True)
    tags = models.JSONField(default=list, blank=True)
    attachments = models.JSONField(default=list, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    assigned_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    
    # SLA tracking
    sla_due_date = models.DateTimeField(null=True, blank=True)
    sla_breached = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'incidents'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['priority']),
            models.Index(fields=['category']),
            models.Index(fields=['assigned_to']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['-priority', '-created_at']
    
    def __str__(self):
        return f"INC-{self.id:06d} - {self.title[:50]}"
    
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
    
    def time_to_resolve(self):
        """Calculate time to resolve incident"""
        if self.resolved_at:
            return self.resolved_at - self.created_at
        return None
    
    def is_overdue(self):
        """Check if incident is overdue based on SLA"""
        if self.sla_due_date and self.status not in ['resolved', 'closed']:
            from django.utils import timezone
            return timezone.now() > self.sla_due_date
        return False

class IncidentComment(models.Model):
    incident = models.ForeignKey(Incident, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    comment = models.TextField()
    is_internal = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'incident_comments'
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment by {self.user.email} on {self.incident.title[:30]}"

class IncidentTimeline(models.Model):
    """Track incident timeline events"""
    EVENT_TYPES = [
        ('created', 'Incident Created'),
        ('assigned', 'Incident Assigned'),
        ('status_changed', 'Status Changed'),
        ('priority_changed', 'Priority Changed'),
        ('comment_added', 'Comment Added'),
        ('containment', 'Containment Action'),
        ('eradication', 'Eradication Action'),
        ('recovery', 'Recovery Action'),
        ('resolved', 'Incident Resolved'),
        ('closed', 'Incident Closed'),
        ('other', 'Other Event'),
    ]
    
    incident = models.ForeignKey(Incident, on_delete=models.CASCADE, related_name='timeline')
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES)
    description = models.TextField()
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'incident_timeline'
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.get_event_type_display()} - {self.incident.title[:30]}"

class IncidentTemplate(models.Model):
    """Templates for common incident types"""
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=50, choices=Incident.CATEGORY_CHOICES)
    description_template = models.TextField()
    containment_template = models.TextField(blank=True)
    eradication_template = models.TextField(blank=True)
    recovery_template = models.TextField(blank=True)
    default_priority = models.IntegerField(choices=Incident.PRIORITY_CHOICES, default=3)
    tags = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'incident_templates'
    
    def __str__(self):
        return self.name