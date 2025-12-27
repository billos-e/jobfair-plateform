"""
Queue model for JobFair Platform
Represents student inscription in a company's waiting queue
Implements order and completion tracking per business rules R1-R4
"""
from django.db import models


class Queue(models.Model):
    """
    Queue entry: a student's inscription in a company's waiting list
    
    Key concepts:
    - position: Order of inscription, immutable (R1)
    - is_completed: True when company marks student as 'passé' (R6, R12)
    - Unique constraint: One inscription per student per company
    """
    
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='queue_entries'
    )
    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='queue_entries'
    )
    # R1: Position determined by inscription order, sacré (immutable)
    position = models.PositiveIntegerField()
    # R6, R12: Marked True when company clicks "Marquer passé"
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'queues'
        verbose_name = 'Queue Entry'
        verbose_name_plural = 'Queue Entries'
        # One inscription per student per company
        unique_together = ['company', 'student']
        # Default ordering by position
        ordering = ['position']
        indexes = [
            models.Index(fields=['company', 'position']),
            models.Index(fields=['company', 'is_completed']),
            models.Index(fields=['student', 'is_completed']),
        ]
    
    def __str__(self):
        status = "✓" if self.is_completed else f"#{self.position}"
        return f"{self.student} @ {self.company} [{status}]"
    
    def save(self, *args, **kwargs):
        """Auto-assign position on creation"""
        if not self.pk and not self.position:
            # Get max position for this company and add 1
            max_pos = Queue.objects.filter(company=self.company).aggregate(
                max_pos=models.Max('position')
            )['max_pos'] or 0
            self.position = max_pos + 1
        super().save(*args, **kwargs)
    
    def mark_completed(self):
        """
        R6, R7, R12: Company marks student as 'passé'
        - Sets is_completed = True
        - Student status auto-changes to 'paused'
        - Slot is freed immediately
        """
        from django.utils import timezone
        
        self.is_completed = True
        self.completed_at = timezone.now()
        self.save()
        
        # R7: Auto-pause student
        self.student.end_interview()
    
    @classmethod
    def get_next_available(cls, company, count=1):
        """
        Get the next N available students in queue
        
        R2-R3: Skip grayed students (in_interview elsewhere, paused)
        but they keep their position
        
        Returns: QuerySet of Queue entries for available students
        """
        return cls.objects.filter(
            company=company,
            is_completed=False,
            student__status='available',
            student__current_company__isnull=True
        ).select_related('student').order_by('position')[:count]
    
    @classmethod
    def get_students_ahead_count(cls, queue_entry):
        """
        Calculate number of non-completed students ahead in queue
        Used for notification: "Il y a encore X personnes avant toi"
        
        Excludes:
        - Already completed (is_completed=True)
        - Currently in interview at this company
        """
        return cls.objects.filter(
            company=queue_entry.company,
            position__lt=queue_entry.position,
            is_completed=False
        ).exclude(
            student__current_company=queue_entry.company
        ).count()
