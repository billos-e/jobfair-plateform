"""
Queue Service - Business Logic for Queue Management
Implements rules R1-R4, R10-R15
"""
from django.db import transaction
from django.utils import timezone
from queues.models import Queue
from students.models import Student


class QueueService:
    """
    Service class for queue-related business logic
    Centralized logic for calculating positions, next available students,
    and managing queue state transitions
    """
    
    @staticmethod
    def get_first_available_students(company, count=1):
        """
        Get the first N available students in a company's queue
        
        R2-R3: Skip greyed students (in_interview elsewhere or paused)
        but they keep their original position
        
        Args:
            company: Company instance
            count: Number of students to return
            
        Returns:
            QuerySet of Queue entries for available students
        """
        return Queue.objects.filter(
            company=company,
            is_completed=False,
            student__status='available',
            student__current_company__isnull=True
        ).select_related('student').order_by('position')[:count]
    
    @staticmethod
    def get_students_ahead_count(queue_entry):
        """
        Calculate number of non-completed students ahead in queue
        
        R15: Used for notification "Il y a encore X personnes avant toi"
        
        Counts students who:
        - Are ahead in position
        - Are NOT completed (is_completed=False)
        - Are NOT currently interviewing at this company
        
        Args:
            queue_entry: Queue entry to check
            
        Returns:
            int: Number of students ahead
        """
        return Queue.objects.filter(
            company=queue_entry.company,
            position__lt=queue_entry.position,
            is_completed=False
        ).exclude(
            student__current_company=queue_entry.company
        ).count()
    
    @staticmethod
    def can_start_interview(queue_entry):
        """
        Check if student can start interview (R10 complete validation)
        
        Conditions:
        - Queue entry not completed
        - Student status is 'available'
        - Company status is 'recruiting'
        - Company has available slots
        - Student is first available in queue
        
        Args:
            queue_entry: Queue entry to validate
            
        Returns:
            tuple: (bool: can_start, str: error_message or None)
        """
        student = queue_entry.student
        company = queue_entry.company
        
        if queue_entry.is_completed:
            return False, "Vous êtes déjà passé chez cette entreprise."
        
        if student.status != 'available':
            if student.status == 'in_interview':
                return False, f"Vous êtes déjà en entretien chez {student.current_company.name}."
            return False, "Vous devez être disponible pour commencer un entretien."
        
        if company.status != 'recruiting':
            return False, "Cette entreprise est actuellement en pause."
        
        if not company.has_available_slots():
            return False, "Cette entreprise ne peut pas recevoir plus d'étudiants pour le moment."
        
        # Check if first available in queue
        first_available = QueueService.get_first_available_students(company, 1).first()
        if not first_available or first_available.id != queue_entry.id:
            if first_available:
                return False, f"Ce n'est pas encore votre tour. {first_available.student.full_name} passe avant vous."
            return False, "Ce n'est pas encore votre tour."
        
        return True, None
    
    @staticmethod
    @transaction.atomic
    def start_interview(queue_entry):
        """
        Start an interview - atomic transaction
        
        Changes:
        - Student status → 'in_interview'
        - Student current_company → company
        
        Args:
            queue_entry: Queue entry for the interview
            
        Returns:
            bool: Success
        """
        can_start, error = QueueService.can_start_interview(queue_entry)
        if not can_start:
            raise ValueError(error)
        
        student = queue_entry.student
        company = queue_entry.company
        
        # Update student status
        student.status = 'in_interview'
        student.current_company = company
        student.save()
        
        return True
    
    @staticmethod
    @transaction.atomic
    def complete_interview(queue_entry):
        """
        Complete an interview (mark student as 'passé')
        R6, R7, R12: Atomic transaction
        
        Changes:
        - Queue is_completed → True
        - Queue completed_at → now
        - Student status → 'paused' (R7: automatic)
        - Student current_company → None
        - Slot is freed immediately (R12)
        
        Args:
            queue_entry: Queue entry to complete
            
        Returns:
            dict: Info about next available students for notifications
        """
        if queue_entry.is_completed:
            raise ValueError("Cet étudiant a déjà été marqué comme passé.")
        
        student = queue_entry.student
        company = queue_entry.company
        
        # Verify student is in interview at this company
        if student.current_company_id != company.id:
            raise ValueError("Cet étudiant n'est pas en entretien chez vous.")
        
        # Mark queue entry as completed
        queue_entry.is_completed = True
        queue_entry.completed_at = timezone.now()
        queue_entry.save()
        
        # R7: Auto-pause student
        student.status = 'paused'
        student.current_company = None
        student.save()
        
        # R12: Slot is now free - find next available students
        available_slots = company.get_available_slots()
        next_students = list(
            QueueService.get_first_available_students(company, available_slots)
        )
        
        return {
            'completed_student': student,
            'next_available': next_students,
            'available_slots': available_slots
        }
    
    @staticmethod
    def get_queue_status(company):
        """
        Get complete queue status for a company
        
        Returns three sections:
        - in_interview: Students currently interviewing
        - waiting: Students waiting (ordered by position)
        - completed: Students already passed
        """
        all_entries = Queue.objects.filter(
            company=company
        ).select_related('student', 'student__current_company')
        
        in_interview = all_entries.filter(
            is_completed=False,
            student__current_company=company
        ).order_by('position')
        
        waiting = all_entries.filter(
            is_completed=False
        ).exclude(
            student__current_company=company
        ).order_by('position')
        
        completed = all_entries.filter(
            is_completed=True
        ).order_by('-completed_at')
        
        return {
            'in_interview': list(in_interview),
            'waiting': list(waiting),
            'completed': list(completed),
            'total_waiting': waiting.count(),
            'available_count': waiting.filter(
                student__status='available',
                student__current_company__isnull=True
            ).count()
        }
    
    @staticmethod
    def get_student_opportunities(student):
        """
        Get all opportunities for a student
        
        Returns queue entries where:
        - Not completed
        - Student is first available (can start now)
        - Or is next after current person
        """
        entries = Queue.objects.filter(
            student=student,
            is_completed=False
        ).select_related('company')
        
        opportunities = []
        for entry in entries:
            company = entry.company
            
            if company.status != 'recruiting':
                opportunities.append({
                    'queue_entry': entry,
                    'can_start': False,
                    'reason': 'company_paused',
                    'position': entry.position,
                    'ahead_count': QueueService.get_students_ahead_count(entry)
                })
                continue
            
            can_start, error = QueueService.can_start_interview(entry)
            
            opportunities.append({
                'queue_entry': entry,
                'can_start': can_start,
                'reason': error if not can_start else None,
                'position': entry.position,
                'ahead_count': QueueService.get_students_ahead_count(entry)
            })
        
        return sorted(opportunities, key=lambda x: (-x['can_start'], x['position']))
