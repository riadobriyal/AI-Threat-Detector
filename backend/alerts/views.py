from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Avg
from django.utils import timezone
from datetime import timedelta

from .models import Alert, AlertComment, AlertRule
from .serializers import (
    AlertSerializer, AlertCreateSerializer, AlertUpdateSerializer,
    AlertCommentSerializer, AlertRuleSerializer, AlertStatsSerializer
)
from .filters import AlertFilter
from accounts.permissions import IsAdminOrAnalyst, CanModifyIncident

class AlertViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = AlertFilter
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AlertCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return AlertUpdateSerializer
        return AlertSerializer
    
    def get_queryset(self):
        # Users can see alerts assigned to them or created by them
        if self.request.user.role == 'admin':
            return Alert.objects.all()
        elif self.request.user.role in ['analyst', 'manager']:
            return Alert.objects.all()
        else:
            return Alert.objects.filter(assigned_to=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get dashboard statistics for alerts"""
        queryset = self.get_queryset()
        
        # Basic counts
        total_alerts = queryset.count()
        open_alerts = queryset.filter(status__in=['open', 'acknowledged', 'investigating']).count()
        high_priority_alerts = queryset.filter(priority__gte=4, status__in=['open', 'acknowledged', 'investigating']).count()
        
        # Alerts by status
        alerts_by_status = dict(
            queryset.values('status')
            .annotate(count=Count('id'))
            .values_list('status', 'count')
        )
        
        # Alerts by priority
        alerts_by_priority = dict(
            queryset.values('priority')
            .annotate(count=Count('id'))
            .values_list('priority', 'count')
        )
        
        # Recent alerts (last 24 hours)
        last_24h = timezone.now() - timedelta(hours=24)
        recent_alerts = queryset.filter(created_at__gte=last_24h).count()
        
        # Average resolution time (in hours)
        resolved_alerts = queryset.filter(resolved_at__isnull=False)
        avg_resolution_time = 0
        if resolved_alerts.exists():
            avg_time = resolved_alerts.aggregate(
                avg_time=Avg('resolved_at') - Avg('created_at')
            )['avg_time']
            if avg_time:
                avg_resolution_time = avg_time.total_seconds() / 3600  # Convert to hours
        
        stats = {
            'total_alerts': total_alerts,
            'open_alerts': open_alerts,
            'high_priority_alerts': high_priority_alerts,
            'alerts_by_status': alerts_by_status,
            'alerts_by_priority': alerts_by_priority,
            'recent_alerts': recent_alerts,
            'avg_resolution_time': round(avg_resolution_time, 2),
        }
        
        serializer = AlertStatsSerializer(stats)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_alerts(self, request):
        """Get alerts assigned to current user"""
        my_alerts = self.get_queryset().filter(assigned_to=request.user)
        
        page = self.paginate_queryset(my_alerts)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(my_alerts, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        """Acknowledge an alert"""
        alert = self.get_object()
        if alert.status == 'open':
            alert.status = 'acknowledged'
            alert.acknowledged_at = timezone.now()
            alert.save()
            return Response({'message': 'Alert acknowledged'})
        return Response({'error': 'Alert cannot be acknowledged'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Resolve an alert"""
        alert = self.get_object()
        if alert.status not in ['resolved', 'closed']:
            alert.status = 'resolved'
            alert.resolved_at = timezone.now()
            alert.save()
            return Response({'message': 'Alert resolved'})
        return Response({'error': 'Alert cannot be resolved'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def escalate(self, request, pk=None):
        """Escalate an alert"""
        alert = self.get_object()
        if not alert.escalated:
            alert.escalated = True
            alert.escalated_at = timezone.now()
            alert.priority = min(5, alert.priority + 1)  # Increase priority
            alert.save()
            return Response({'message': 'Alert escalated'})
        return Response({'error': 'Alert already escalated'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        """Assign alert to a user"""
        alert = self.get_object()
        user_id = request.data.get('user_id')
        
        if user_id:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                user = User.objects.get(id=user_id)
                alert.assigned_to = user
                alert.save()
                return Response({'message': f'Alert assigned to {user.get_full_name()}'})
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response({'error': 'User ID required'}, status=status.HTTP_400_BAD_REQUEST)

class AlertCommentViewSet(viewsets.ModelViewSet):
    serializer_class = AlertCommentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return AlertComment.objects.filter(alert_id=self.kwargs['alert_pk'])
    
    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user,
            alert_id=self.kwargs['alert_pk']
        )

class AlertRuleViewSet(viewsets.ModelViewSet):
    queryset = AlertRule.objects.all()
    serializer_class = AlertRuleSerializer
    permission_classes = [IsAuthenticated, IsAdminOrAnalyst]
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle rule active status"""
        rule = self.get_object()
        rule.is_active = not rule.is_active
        rule.save()
        status_text = 'activated' if rule.is_active else 'deactivated'
        return Response({'message': f'Rule {status_text}'})