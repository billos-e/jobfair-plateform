"""
Django Admin configuration for Companies app
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import Company


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    """Admin interface for Company model"""
    
    list_display = ['name', 'status', 'max_concurrent_interviews', 'current_interviews', 'access_link', 'created_at']
    list_filter = ['status']
    search_fields = ['name']
    readonly_fields = ['access_token', 'access_link', 'created_at']
    
    fieldsets = (
        ('Company Info', {'fields': ('name', 'status')}),
        ('Capacity', {'fields': ('max_concurrent_interviews',)}),
        ('Access', {'fields': ('access_token', 'access_link'), 'classes': ('collapse',)}),
        ('Dates', {'fields': ('created_at',)}),
    )
    
    actions = ['regenerate_tokens', 'pause_companies', 'resume_companies']
    
    def current_interviews(self, obj):
        """Display current interview count"""
        count = obj.get_current_interview_count()
        max_slots = obj.max_concurrent_interviews
        return f"{count}/{max_slots}"
    current_interviews.short_description = 'In Interview'
    
    def access_link(self, obj):
        """Display formatted access link"""
        # TODO: Update with actual frontend URL
        url = f"http://localhost:5173/company/{obj.access_token}"
        return format_html('<a href="{}" target="_blank">{}</a>', url, obj.access_token[:16] + '...')
    access_link.short_description = 'Access Link'
    
    @admin.action(description='Regenerate access tokens')
    def regenerate_tokens(self, request, queryset):
        for company in queryset:
            company.regenerate_token()
        self.message_user(request, f"Regenerated tokens for {queryset.count()} companies")
    
    @admin.action(description='Pause selected companies')
    def pause_companies(self, request, queryset):
        queryset.update(status='paused')
        self.message_user(request, f"Paused {queryset.count()} companies")
    
    @admin.action(description='Resume recruiting for selected companies')
    def resume_companies(self, request, queryset):
        queryset.update(status='recruiting')
        self.message_user(request, f"Resumed {queryset.count()} companies")
