from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta

from .models import Threat, ThreatFeed
from .serializers import (
    ThreatSerializer, ThreatCreateSerializer, ThreatUpdateSerializer,
    ThreatFeedSerializer, ThreatStatsSerializer
)
from .filters import ThreatFilter
from accounts.permissions import IsAdminOrAnalyst
from .tasks import process_threat_with_ai

class ThreatViewSet(viewsets.ModelViewSet):
    queryset = Threat.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ThreatFilter
    search_fields = ['title', 'description', 'source', 'cve_id']
    ordering_fields = ['risk_score', 'severity', 'date_detected', 'created_at']
    ordering = ['-risk_score', '-date_detected']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ThreatCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ThreatUpdateSerializer
        return ThreatSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdminOrAnalyst()]
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        threat = serializer.save()
        # Trigger AI processing asynchronously
        process_threat_with_ai.delay(threat.id)
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get dashboard statistics for threats"""
        now = timezone.now()
        last_24h = now - timedelta(hours=24)
        last_7d = now - timedelta(days=7)
        
        # Basic counts
        total_threats = Threat.objects.filter(is_active=True).count()
        active_threats = Threat.objects.filter(
            is_active=True, 
            is_false_positive=False
        ).count()
        high_risk_threats = Threat.objects.filter(
            is_active=True,
            is_false_positive=False,
            risk_score__gte=7
        ).count()
        
        # Threats by type
        threats_by_type = dict(
            Threat.objects.filter(is_active=True)
            .values('threat_type')
            .annotate(count=Count('id'))
            .values_list('threat_type', 'count')
        )
        
        # Threats by severity
        threats_by_severity = dict(
            Threat.objects.filter(is_active=True)
            .values('severity')
            .annotate(count=Count('id'))
            .values_list('severity', 'count')
        )
        
        # Recent threats (last 24 hours)
        recent_threats = Threat.objects.filter(
            created_at__gte=last_24h,
            is_active=True
        ).count()
        
        stats = {
            'total_threats': total_threats,
            'active_threats': active_threats,
            'high_risk_threats': high_risk_threats,
            'threats_by_type': threats_by_type,
            'threats_by_severity': threats_by_severity,
            'recent_threats': recent_threats,
        }
        
        serializer = ThreatStatsSerializer(stats)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def high_risk(self, request):
        """Get high-risk threats (risk score >= 7)"""
        high_risk_threats = self.get_queryset().filter(
            risk_score__gte=7,
            is_active=True,
            is_false_positive=False
        )
        
        page = self.paginate_queryset(high_risk_threats)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(high_risk_threats, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_false_positive(self, request, pk=None):
        """Mark a threat as false positive"""
        threat = self.get_object()
        threat.is_false_positive = True
        threat.save()
        return Response({'message': 'Threat marked as false positive'})
    
    @action(detail=True, methods=['post'])
    def reprocess_ai(self, request, pk=None):
        """Reprocess threat with AI"""
        threat = self.get_object()
        process_threat_with_ai.delay(threat.id)
        return Response({'message': 'Threat queued for AI reprocessing'})

class ThreatFeedViewSet(viewsets.ModelViewSet):
    queryset = ThreatFeed.objects.all()
    serializer_class = ThreatFeedSerializer
    permission_classes = [IsAuthenticated, IsAdminOrAnalyst]
    
    @action(detail=True, methods=['post'])
    def fetch_now(self, request, pk=None):
        """Manually trigger feed fetch"""
        feed = self.get_object()
        from .tasks import fetch_single_threat_feed
        fetch_single_threat_feed.delay(feed.id)
        return Response({'message': f'Feed {feed.name} fetch triggered'})