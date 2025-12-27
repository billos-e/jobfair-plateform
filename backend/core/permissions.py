"""
Custom permissions for JobFair Platform
"""
from rest_framework import permissions
from companies.models import Company


class IsStudent(permissions.BasePermission):
    """Allow access only to authenticated students"""
    
    message = "You must be a student to access this resource."
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role == 'student' and
            hasattr(request.user, 'student')
        )


class IsAdmin(permissions.BasePermission):
    """Allow access only to admin users"""
    
    message = "You must be an admin to access this resource."
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsCompanyToken(permissions.BasePermission):
    """
    Allow access via company token in URL
    Expects 'token' in view kwargs
    """
    
    message = "Invalid company access token."
    
    def has_permission(self, request, view):
        token = view.kwargs.get('token')
        if not token:
            return False
        
        try:
            company = Company.objects.get(access_token=token)
            # Attach company to request for use in views
            request.company = company
            return True
        except Company.DoesNotExist:
            return False


class IsOwnerOrAdmin(permissions.BasePermission):
    """Allow access to resource owner or admin"""
    
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        
        # For Student objects
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        # For Queue objects
        if hasattr(obj, 'student'):
            return obj.student.user == request.user
        
        return False
