from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admins to edit users.
    """
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'admin'

class IsAdminOrAnalyst(permissions.BasePermission):
    """
    Custom permission for admin or analyst roles.
    """
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role in ['admin', 'analyst']
        )

class IsAdminOrManager(permissions.BasePermission):
    """
    Custom permission for admin or manager roles.
    """
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role in ['admin', 'manager']
        )

class CanModifyIncident(permissions.BasePermission):
    """
    Custom permission to check if user can modify incidents.
    """
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.can_modify_incidents()
        )
    
    def has_object_permission(self, request, view, obj):
        # Users can always view incidents assigned to them
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Only admins, analysts, and managers can modify incidents
        if not request.user.can_modify_incidents():
            return False
        
        # Users can modify incidents assigned to them
        return obj.assigned_to == request.user or request.user.role == 'admin'