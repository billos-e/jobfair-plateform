"""
Company model for JobFair Platform
Companies access via unique token URL, no user account needed
Implements status and slots management per business rules R9-R12, R17-R20
"""
import secrets
from django.db import models


def generate_access_token():
    """Generate a unique 32-character token for company access"""
    return secrets.token_urlsafe(24)  # 32 chars base64


class Company(models.Model):
    """
    Company participating in job fair
    
    Authentication: Via unique access_token in URL (not User model)
    Status: recruiting (visible) or paused (hidden from public list)
    Slots: Number of concurrent interviews allowed (R9)
    """
    
    STATUS_CHOICES = [
        ('recruiting', 'Recruiting'),
        ('paused', 'Paused'),
    ]
    
    name = models.CharField(max_length=200, unique=True)
    access_token = models.CharField(
        max_length=50,
        unique=True,
        default=generate_access_token
    )
    status = models.CharField(
        max_length=12,
        choices=STATUS_CHOICES,
        default='recruiting'
    )
    # R9: Default 1 slot, only admin can modify
    max_concurrent_interviews = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'companies'
        verbose_name = 'Company'
        verbose_name_plural = 'Companies'
    
    def __str__(self):
        return self.name
    
    def regenerate_token(self):
        """Generate new access token (used if token is compromised)"""
        self.access_token = generate_access_token()
        self.save()
        return self.access_token
    
    def get_current_interview_count(self):
        """
        R11: Count students currently in interview with this company
        slots_occupés = COUNT(étudiants WHERE current_company = X AND is_completed = False)
        """
        from queues.models import Queue
        # Students in interview at this company and not yet marked complete
        return Queue.objects.filter(
            company=self,
            is_completed=False,
            student__current_company=self
        ).count()
    
    def get_available_slots(self):
        """Calculate number of available interview slots"""
        return max(0, self.max_concurrent_interviews - self.get_current_interview_count())
    
    def has_available_slots(self):
        """Check if company can accept new interviews (R10)"""
        return self.get_available_slots() > 0 and self.status == 'recruiting'
    
    def is_recruiting(self):
        """R17: Check if company appears in public list"""
        return self.status == 'recruiting'
    
    def pause(self):
        """R17-R20: Put company on pause"""
        self.status = 'paused'
        self.save()
    
    def resume(self):
        """Resume recruiting"""
        self.status = 'recruiting'
        self.save()
