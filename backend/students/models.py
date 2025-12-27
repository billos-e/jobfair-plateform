"""
Student model for JobFair Platform
Linked to User model via OneToOne relationship
Implements status tracking per business rules R2-R8
"""
from django.db import models
from django.conf import settings


class Student(models.Model):
    """
    Student profile with status management
    
    Status transitions (R5-R8):
    - available: Can start interviews, visible in queues
    - in_interview: Currently interviewing at current_company
    - paused: Finished interview, needs to manually go back to available
    """
    
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('in_interview', 'In Interview'),
        ('paused', 'Paused'),
    ]
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student'
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    status = models.CharField(
        max_length=15,
        choices=STATUS_CHOICES,
        default='available'
    )
    # Reference to the company where student is currently interviewing
    # Null if status != 'in_interview'
    current_company = models.ForeignKey(
        'companies.Company',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='current_students'
    )
    
    class Meta:
        db_table = 'students'
        verbose_name = 'Student'
        verbose_name_plural = 'Students'
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def is_available(self):
        """Check if student can start a new interview"""
        return self.status == 'available' and self.current_company is None
    
    def start_interview(self, company):
        """
        Start an interview at given company
        Called when student clicks "Commencer mon entretien"
        """
        self.status = 'in_interview'
        self.current_company = company
        self.save()
    
    def end_interview(self):
        """
        End current interview (R7: auto-pause after marked complete)
        Called when company marks student as 'passé'
        """
        self.status = 'paused'
        self.current_company = None
        self.save()
    
    def set_available(self):
        """
        Return to available status (R5: only student can do this)
        Called when student clicks "Repasser disponible"
        """
        if self.status == 'paused':
            self.status = 'available'
            self.current_company = None
            self.save()
