from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ThreatViewSet, ThreatFeedViewSet

router = DefaultRouter()
router.register(r'threats', ThreatViewSet)
router.register(r'feeds', ThreatFeedViewSet)

urlpatterns = [
    path('', include(router.urls)),
]