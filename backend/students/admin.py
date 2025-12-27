"""
Django Admin configuration for Students app
"""
from django.contrib import admin
from .models import Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    """Admin interface for Student model"""
    
    list_display = ['full_name', 'user', 'status', 'current_company']
    list_filter = ['status']
    search_fields = ['first_name', 'last_name', 'user__email']
    raw_id_fields = ['user', 'current_company']
    
    fieldsets = (
        ('Identity', {'fields': ('user', 'first_name', 'last_name')}),
        ('Status', {'fields': ('status', 'current_company')}),
    )
    
    def full_name(self, obj):
        return obj.full_name
    full_name.short_description = 'Name'
