import django_filters
from django.db.models import Q
from .models import Threat

class ThreatFilter(django_filters.FilterSet):
    threat_type = django_filters.MultipleChoiceFilter(
        choices=Threat.THREAT_TYPES,
        field_name='threat_type',
        lookup_expr='in'
    )
    
    severity_min = django_filters.NumberFilter(
        field_name='severity',
        lookup_expr='gte'
    )
    
    severity_max = django_filters.NumberFilter(
        field_name='severity',
        lookup_expr='lte'
    )
    
    risk_score_min = django_filters.NumberFilter(
        field_name='risk_score',
        lookup_expr='gte'
    )
    
    risk_score_max = django_filters.NumberFilter(
        field_name='risk_score',
        lookup_expr='lte'
    )
    
    date_from = django_filters.DateTimeFilter(
        field_name='date_detected',
        lookup_expr='gte'
    )
    
    date_to = django_filters.DateTimeFilter(
        field_name='date_detected',
        lookup_expr='lte'
    )
    
    source = django_filters.CharFilter(
        field_name='source',
        lookup_expr='icontains'
    )
    
    is_active = django_filters.BooleanFilter()
    is_false_positive = django_filters.BooleanFilter()
    
    tags = django_filters.CharFilter(method='filter_tags')
    
    def filter_tags(self, queryset, name, value):
        """Filter by tags in JSON field"""
        if value:
            return queryset.filter(tags__contains=[value])
        return queryset
    
    class Meta:
        model = Threat
        fields = []