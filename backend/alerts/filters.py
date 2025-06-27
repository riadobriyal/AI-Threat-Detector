import django_filters
from .models import Alert

class AlertFilter(django_filters.FilterSet):
    status = django_filters.MultipleChoiceFilter(
        choices=Alert.STATUS_CHOICES,
        field_name='status',
        lookup_expr='in'
    )
    
    priority = django_filters.MultipleChoiceFilter(
        choices=Alert.PRIORITY_CHOICES,
        field_name='priority',
        lookup_expr='in'
    )
    
    alert_type = django_filters.MultipleChoiceFilter(
        choices=Alert.ALERT_TYPES,
        field_name='alert_type',
        lookup_expr='in'
    )
    
    assigned_to = django_filters.NumberFilter(
        field_name='assigned_to',
        lookup_expr='exact'
    )
    
    created_from = django_filters.DateTimeFilter(
        field_name='created_at',
        lookup_expr='gte'
    )
    
    created_to = django_filters.DateTimeFilter(
        field_name='created_at',
        lookup_expr='lte'
    )
    
    escalated = django_filters.BooleanFilter()
    
    class Meta:
        model = Alert
        fields = []