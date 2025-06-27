from django.contrib import admin
from .models import Alert, AlertComment, AlertRule

@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ['title', 'alert_type', 'priority', 'status', 'assigned_to', 'created_at']
    list_filter = ['alert_type', 'priority', 'status', 'escalated', 'created_at']
    search_fields = ['title', 'description']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'alert_type', 'priority')
        }),
        ('Assignment', {
            'fields': ('assigned_to', 'status', 'escalated')
        }),
        ('Threat', {
            'fields': ('threat',)
        }),
        ('Metadata', {
            'fields': ('metadata', 'created_by'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'acknowledged_at', 'resolved_at', 'escalated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'acknowledged_at', 'resolved_at', 'escalated_at']

@admin.register(AlertComment)
class AlertCommentAdmin(admin.ModelAdmin):
    list_display = ['alert', 'user', 'is_internal', 'created_at']
    list_filter = ['is_internal', 'created_at']
    search_fields = ['comment', 'alert__title']

@admin.register(AlertRule)
class AlertRuleAdmin(admin.ModelAdmin):
    list_display = ['name', 'alert_type', 'priority', 'is_active', 'created_at']
    list_filter = ['alert_type', 'priority', 'is_active']
    search_fields = ['name', 'description']