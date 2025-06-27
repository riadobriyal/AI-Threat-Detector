from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Threat(models.Model):
    THREAT_TYPES = [
        ('malware', 'Malware'),
        ('phishing', 'Phishing'),
        ('vulnerability', 'Vulnerability'),
        ('ddos', 'DDoS'),
        ('data_breach', 'Data Breach'),
        ('ransomware', 'Ransomware'),
        ('apt', 'Advanced Persistent Threat'),
        ('other', 'Other'),
    ]
    
    SEVERITY_LEVELS = [
        (1, 'Very Low'),
        (2, 'Low'),
        (3, 'Low-Medium'),
        (4, 'Medium'),
        (5, 'Medium-High'),
        (6, 'High'),
        (7, 'High-Critical'),
        (8, 'Critical'),
        (9, 'Very Critical'),
        (10, 'Extreme'),
    ]
    
    # Core fields
    source = models.CharField(max_length=200)
    threat_type = models.CharField(max_length=50, choices=THREAT_TYPES)
    severity = models.IntegerField(choices=SEVERITY_LEVELS)
    title = models.CharField(max_length=500)
    description = models.TextField()
    date_detected = models.DateTimeField()
    
    # AI-generated fields
    risk_score = models.FloatField(default=0.0)
    ai_classification = models.CharField(max_length=100, blank=True)
    incident_response_suggestion = models.TextField(blank=True)
    
    # Metadata
    related_assets = models.JSONField(default=list, blank=True)
    indicators_of_compromise = models.JSONField(default=list, blank=True)
    references = models.JSONField(default=list, blank=True)
    tags = models.JSONField(default=list, blank=True)
    
    # External identifiers
    external_id = models.CharField(max_length=200, blank=True)
    cve_id = models.CharField(max_length=50, blank=True)
    
    # Status tracking
    is_active = models.BooleanField(default=True)
    is_false_positive = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'threats'
        indexes = [
            models.Index(fields=['threat_type']),
            models.Index(fields=['severity']),
            models.Index(fields=['risk_score']),
            models.Index(fields=['date_detected']),
            models.Index(fields=['is_active']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['-risk_score', '-date_detected']
    
    def __str__(self):
        return f"{self.get_threat_type_display()} - {self.title[:50]}"
    
    def get_severity_display_color(self):
        """Return color code for severity level"""
        colors = {
            1: '#28a745', 2: '#28a745', 3: '#ffc107',
            4: '#ffc107', 5: '#fd7e14', 6: '#fd7e14',
            7: '#dc3545', 8: '#dc3545', 9: '#721c24', 10: '#721c24'
        }
        return colors.get(self.severity, '#6c757d')
    
    def should_trigger_alert(self, threshold=7):
        """Check if threat should trigger an alert"""
        return self.risk_score >= threshold and self.is_active

class ThreatFeed(models.Model):
    """Model to track threat feed sources and their status"""
    name = models.CharField(max_length=200, unique=True)
    url = models.URLField()
    feed_type = models.CharField(max_length=50)
    is_active = models.BooleanField(default=True)
    api_key = models.CharField(max_length=500, blank=True)
    last_fetched = models.DateTimeField(null=True, blank=True)
    fetch_interval = models.IntegerField(default=30)  # minutes
    total_threats_imported = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'threat_feeds'
    
    def __str__(self):
        return self.name