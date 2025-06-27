from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import AlertViewSet, AlertCommentViewSet, AlertRuleViewSet

router = DefaultRouter()
router.register(r'alerts', AlertViewSet)
router.register(r'rules', AlertRuleViewSet)

# Nested router for alert comments
alerts_router = routers.NestedDefaultRouter(router, r'alerts', lookup='alert')
alerts_router.register(r'comments', AlertCommentViewSet, basename='alert-comments')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(alerts_router.urls)),
]