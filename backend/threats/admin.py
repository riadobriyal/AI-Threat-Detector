from django.contrib import admin
from .models import Threat, ThreatFeed

@admin.register(Threat)
class ThreatAdmin(admin.ModelAdmin):
    list_display = ['title', 'threat_type', 'severity', 'risk_score', 'source', 'is_active', 'created_at']
    list_filter = ['threat_type', 'severity', 'is_active', 'is_false_positive', 'source']
    search_fields = ['title', 'description', 'cve_id', 'external_id']
    readonly_fields = ['risk_score', 'ai_classification', 'incident_response_suggestion', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'source', 'threat_type', 'severity')
        }),
        ('AI Analysis', {
            'fields': ('risk_score', 'ai_classification', 'incident_response_suggestion'),
            'classes': ('collapse',)
        }),
        ('Technical Details', {
            'fields': ('external_id', 'cve_id', 'related_assets', 'indicators_of_compromise', 'references', 'tags'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_active', 'is_false_positive', 'date_detected')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(ThreatFeed)
class ThreatFeedAdmin(admin.ModelAdmin):
    list_display = ['name', 'feed_type', 'is_active', 'last_fetched', 'total_threats_imported']
    list_filter = ['feed_type', 'is_active']
    search_fields = ['name', 'url']
    readonly_fields = ['last_fetched', 'total_threats_imported', 'created_at']