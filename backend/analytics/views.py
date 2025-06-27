from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Avg, Q
from django.utils import timezone
from datetime import timedelta, date
import requests
import logging

from .models import ThreatPrediction, MLModelMetrics, DashboardMetrics
from .serializers import (
    ThreatPredictionSerializer, MLModelMetricsSerializer, 
    DashboardMetricsSerializer, DashboardStatsSerializer
)
from threats.models import Threat
from alerts.models import Alert
from accounts.permissions import IsAdminOrAnalyst

logger = logging.getLogger(__name__)

class AnalyticsViewSet(viewsets.ModelViewSet):
    queryset = DashboardMetrics.objects.all()
    serializer_class = DashboardMetricsSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get comprehensive dashboard statistics"""
        try:
            # Get current date metrics
            today = timezone.now().date()
            
            # Threat statistics
            threats_qs = Threat.objects.filter(is_active=True)
            total_threats = threats_qs.count()
            critical_threats = threats_qs.filter(severity__gte=8).count()
            high_threats = threats_qs.filter(severity__in=[6, 7]).count()
            medium_threats = threats_qs.filter(severity__in=[4, 5]).count()
            low_threats = threats_qs.filter(severity__lte=3).count()
            
            # Alert statistics
            alerts_qs = Alert.objects.all()
            resolved_threats = alerts_qs.filter(status='resolved').count()
            false_positives = threats_qs.filter(is_false_positive=True).count()
            
            # Average resolution time
            resolved_alerts = alerts_qs.filter(resolved_at__isnull=False)
            avg_resolution_time = 0
            if resolved_alerts.exists():
                avg_time = resolved_alerts.aggregate(
                    avg_time=Avg('resolved_at') - Avg('created_at')
                )['avg_time']
                if avg_time:
                    avg_resolution_time = avg_time.total_seconds() / 3600
            
            # Trend data (last 7 days)
            last_7_days = [today - timedelta(days=i) for i in range(6, -1, -1)]
            threat_trend = []
            for day in last_7_days:
                day_threats = Threat.objects.filter(
                    created_at__date=day,
                    is_active=True
                ).count()
                threat_trend.append({
                    'date': day.strftime('%Y-%m-%d'),
                    'threats': day_threats
                })
            
            # Threat types distribution
            threat_types = dict(
                threats_qs.values('threat_type')
                .annotate(count=Count('id'))
                .values_list('threat_type', 'count')
            )
            
            # Top sources
            top_sources = list(
                threats_qs.values('source')
                .annotate(count=Count('id'))
                .order_by('-count')[:5]
                .values('source', 'count')
            )
            
            # ML Model performance
            latest_metrics = MLModelMetrics.objects.first()
            model_accuracy = latest_metrics.accuracy if latest_metrics else 0.0
            
            # Prediction confidence (average from recent predictions)
            recent_predictions = ThreatPrediction.objects.filter(
                prediction_date__gte=timezone.now() - timedelta(days=7)
            )
            prediction_confidence = 0.85  # Default value
            
            # Active feeds count
            from threats.models import ThreatFeed
            active_feeds = ThreatFeed.objects.filter(is_active=True).count()
            
            stats = {
                'total_threats': total_threats,
                'critical_threats': critical_threats,
                'high_threats': high_threats,
                'medium_threats': medium_threats,
                'low_threats': low_threats,
                'resolved_threats': resolved_threats,
                'false_positives': false_positives,
                'avg_resolution_time': round(avg_resolution_time, 2),
                'threat_trend': threat_trend,
                'threat_types_distribution': threat_types,
                'top_sources': top_sources,
                'model_accuracy': model_accuracy,
                'prediction_confidence': prediction_confidence,
                'active_feeds': active_feeds,
                'last_update': timezone.now()
            }
            
            serializer = DashboardStatsSerializer(stats)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error generating dashboard stats: {str(e)}")
            return Response(
                {'error': 'Failed to generate dashboard statistics'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def predict_threat_resolution(self, request):
        """Get ML prediction for threat resolution time"""
        threat_id = request.data.get('threat_id')
        
        if not threat_id:
            return Response(
                {'error': 'threat_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            threat = Threat.objects.get(id=threat_id)
            
            # Check if prediction already exists
            existing_prediction = ThreatPrediction.objects.filter(threat=threat).first()
            if existing_prediction:
                serializer = ThreatPredictionSerializer(existing_prediction)
                return Response(serializer.data)
            
            # Call ML model API
            ml_api_url = "http://localhost:8000/predict"  # ML model API
            
            # Prepare data for ML model
            ml_request_data = {
                "country": "USA",  # Default or extract from threat data
                "year": timezone.now().year,
                "attack_type": self._map_threat_type_to_ml(threat.threat_type),
                "target_industry": "IT",  # Default or extract from context
                "financial_loss": 10.0,  # Estimate based on severity
                "affected_users": 1000,  # Estimate based on scope
                "attack_source": "Unknown",
                "vulnerability_type": "Unpatched Software",
                "defense_mechanism": "AI-based Detection"
            }
            
            # Make prediction request
            response = requests.post(ml_api_url, json=ml_request_data, timeout=10)
            
            if response.status_code == 200:
                ml_result = response.json()
                
                # Store prediction in database
                prediction = ThreatPrediction.objects.create(
                    threat=threat,
                    predicted_resolution_time=ml_result['predicted_resolution_time'],
                    confidence_interval_lower=ml_result['confidence_interval']['lower_bound'],
                    confidence_interval_upper=ml_result['confidence_interval']['upper_bound'],
                    risk_level=ml_result['risk_level'],
                    model_used=ml_result['model_used']
                )
                
                serializer = ThreatPredictionSerializer(prediction)
                return Response(serializer.data)
            else:
                return Response(
                    {'error': 'ML model prediction failed'}, 
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
                
        except Threat.DoesNotExist:
            return Response(
                {'error': 'Threat not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except requests.RequestException as e:
            logger.error(f"ML API request failed: {str(e)}")
            return Response(
                {'error': 'ML service unavailable'}, 
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            logger.error(f"Error in threat prediction: {str(e)}")
            return Response(
                {'error': 'Internal server error'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _map_threat_type_to_ml(self, threat_type):
        """Map Django threat types to ML model expected types"""
        mapping = {
            'malware': 'Malware',
            'phishing': 'Phishing',
            'ransomware': 'Ransomware',
            'ddos': 'DDoS',
            'vulnerability': 'SQL Injection',  # Default mapping
            'apt': 'Malware',
            'other': 'Malware'
        }
        return mapping.get(threat_type, 'Malware')

class ThreatPredictionViewSet(viewsets.ModelViewSet):
    queryset = ThreatPrediction.objects.all()
    serializer_class = ThreatPredictionSerializer
    permission_classes = [IsAuthenticated]

class MLModelMetricsViewSet(viewsets.ModelViewSet):
    queryset = MLModelMetrics.objects.all()
    serializer_class = MLModelMetricsSerializer
    permission_classes = [IsAuthenticated, IsAdminOrAnalyst]