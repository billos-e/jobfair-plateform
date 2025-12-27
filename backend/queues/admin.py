"""
Django Admin configuration for Queues app
"""
from django.contrib import admin
from .models import Queue


@admin.register(Queue)
class QueueAdmin(admin.ModelAdmin):
    """Admin interface for Queue model"""
    
    list_display = ['student', 'company', 'position', 'is_completed', 'created_at', 'completed_at']
    list_filter = ['company', 'is_completed']
    search_fields = ['student__first_name', 'student__last_name', 'company__name']
    raw_id_fields = ['student', 'company']
    ordering = ['company', 'position']
    
    fieldsets = (
        ('Entry', {'fields': ('company', 'student', 'position')}),
        ('Status', {'fields': ('is_completed', 'completed_at')}),
        ('Dates', {'fields': ('created_at',)}),
    )
    readonly_fields = ['created_at', 'completed_at']
    
    actions = ['mark_completed', 'reset_to_pending']
    
    @admin.action(description='Mark as completed')
    def mark_completed(self, request, queryset):
        from django.utils import timezone
        queryset.filter(is_completed=False).update(
            is_completed=True,
            completed_at=timezone.now()
        )
        self.message_user(request, f"Marked {queryset.count()} entries as completed")
    
    @admin.action(description='Reset to pending')
    def reset_to_pending(self, request, queryset):
        queryset.update(is_completed=False, completed_at=None)
        self.message_user(request, f"Reset {queryset.count()} entries to pending")
