"""
Notification Service - Business Logic for Real-time Notifications
Implements rules R13-R16 with proper WebSocket broadcasting
"""
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


class NotificationService:
    """
    Service class for managing notifications
    Handles WebSocket broadcasts to appropriate groups
    """
    
    # Notification types
    TYPE_CAN_START = 'can_start'
    TYPE_CAN_START_AFTER = 'can_start_after'
    TYPE_MARKED_COMPLETE = 'marked_complete'
    TYPE_QUEUE_UPDATE = 'queue_update'
    TYPE_STATUS_CHANGE = 'status_change'
    TYPE_COMPANY_STATUS = 'company_status'
    TYPE_INTERVIEW_STARTED = 'interview_started'
    TYPE_INTERVIEW_COMPLETED = 'interview_completed'
    
    @staticmethod
    def get_channel_layer():
        """Get the channel layer for WebSocket broadcasting"""
        return get_channel_layer()
    
    @staticmethod
    def _send_to_group(group_name, event_type, data):
        """
        Send message to a WebSocket group
        
        Args:
            group_name: Name of the channel group
            event_type: Type of event (maps to consumer method)
            data: Message payload
        """
        channel_layer = NotificationService.get_channel_layer()
        if channel_layer:
            try:
                async_to_sync(channel_layer.group_send)(
                    group_name,
                    {
                        'type': event_type,
                        'data': data
                    }
                )
                return True
            except Exception as e:
                print(f"WebSocket send error to {group_name}: {e}")
                return False
        return False
    
    @classmethod
    def notify_student(cls, student, notification_type, data):
        """
        Send notification to a specific student
        
        Args:
            student: Student instance
            notification_type: Type of notification
            data: Additional data to include
        """
        group_name = f"student_{student.id}"
        
        message = {
            'notification_type': notification_type,
            'student_id': student.id,
            **data
        }
        
        cls._send_to_group(group_name, 'notification', message)
    
    @classmethod
    def notify_company(cls, company, notification_type, data):
        """
        Send notification to a company dashboard
        
        Args:
            company: Company instance
            notification_type: Type of notification
            data: Additional data to include
        """
        group_name = f"company_{company.access_token}"
        
        message = {
            'notification_type': notification_type,
            'company_id': company.id,
            **data
        }
        
        cls._send_to_group(group_name, 'queue_update', message)
    
    @classmethod
    def notify_admin(cls, notification_type, data):
        """Send notification to admin dashboard"""
        cls._send_to_group('admin', 'notification', {
            'notification_type': notification_type,
            **data
        })
    
    @classmethod
    def on_interview_started(cls, queue_entry):
        """
        Handle interview start event
        
        Notifications:
        - Company: queue update (student started)
        - Admin: activity update
        """
        student = queue_entry.student
        company = queue_entry.company
        
        # Notify company dashboard
        cls.notify_company(company, cls.TYPE_INTERVIEW_STARTED, {
            'action': 'interview_started',
            'student_id': student.id,
            'student_name': student.full_name,
            'position': queue_entry.position
        })
        
        # Notify admin
        cls.notify_admin(cls.TYPE_INTERVIEW_STARTED, {
            'action': 'interview_started',
            'student_name': student.full_name,
            'company_name': company.name,
            'company_id': company.id
        })
    
    @classmethod
    def on_interview_completed(cls, completed_student, company, next_students):
        """
        Handle interview completion event (R13, R14, R16)
        
        Notifications sent:
        - Completed student: "Tu as été marqué passé" (R16)
        - Next available students: "Tu peux passer !" (R13, R14)
        - Company: queue update with new available students
        """
        # R16: Notify completed student
        cls._send_to_group(
            f"student_{completed_student.id}",
            'notification',
            {
                'notification_type': cls.TYPE_MARKED_COMPLETE,
                'message': f"Tu as été marqué passé chez {company.name}. Pense à repasser Disponible pour tes autres opportunités.",
                'company_id': company.id,
                'company_name': company.name,
                'new_status': 'paused'
            }
        )
        
        # R13, R14: Notify next available students with "can_start" event
        for i, queue_entry in enumerate(next_students):
            student = queue_entry.student
            
            if i == 0:
                # First available - urgent "can start" notification
                cls._send_to_group(
                    f"student_{student.id}",
                    'can_start',  # Special urgent event type
                    {
                        'notification_type': cls.TYPE_CAN_START,
                        'message': f"🎯 C'est ton tour chez {company.name} !",
                        'company_id': company.id,
                        'company_name': company.name,
                        'queue_id': queue_entry.id,
                        'can_start': True,
                        'position': 1
                    }
                )
            else:
                # Not first but slot may be available soon
                ahead_name = next_students[0].student.full_name if next_students else None
                cls.notify_student(student, cls.TYPE_CAN_START_AFTER, {
                    'message': f"Tu peux passer chez {company.name} après {ahead_name}",
                    'company_id': company.id,
                    'company_name': company.name,
                    'ahead_name': ahead_name,
                    'position': i + 1
                })
        
        # Notify company of queue update
        cls.notify_company(company, cls.TYPE_INTERVIEW_COMPLETED, {
            'action': 'interview_completed',
            'completed_student_id': completed_student.id,
            'completed_student_name': completed_student.full_name,
            'next_available_count': len(next_students),
            'next_available': [
                {'id': q.student.id, 'name': q.student.full_name}
                for q in next_students[:3]
            ]
        })
        
        # Notify admin
        cls.notify_admin(cls.TYPE_INTERVIEW_COMPLETED, {
            'action': 'interview_completed',
            'student_name': completed_student.full_name,
            'company_name': company.name
        })
    
    @classmethod
    def on_student_status_change(cls, student, old_status, new_status):
        """
        Handle student status change event
        
        If student becomes available:
        - Check all queues where they're inscribed
        - If first available anywhere, send notification
        """
        # Notify the student themselves
        cls.notify_student(student, cls.TYPE_STATUS_CHANGE, {
            'old_status': old_status,
            'new_status': new_status,
            'message': f"Ton statut est maintenant: {new_status}"
        })
        
        # If becoming available, check for opportunities
        if new_status == 'available':
            from queues.services import QueueService
            opportunities = QueueService.get_student_opportunities(student)
            
            for opp in opportunities:
                if opp['can_start']:
                    queue_entry = opp['queue_entry']
                    # Send urgent can_start notification
                    cls._send_to_group(
                        f"student_{student.id}",
                        'can_start',
                        {
                            'notification_type': cls.TYPE_CAN_START,
                            'message': f"🎯 Tu peux passer chez {queue_entry.company.name} !",
                            'company_id': queue_entry.company_id,
                            'company_name': queue_entry.company.name,
                            'queue_id': queue_entry.id,
                            'can_start': True
                        }
                    )
                    break  # Only notify for first opportunity

        # Notify admin of status change
        cls.notify_admin(cls.TYPE_STATUS_CHANGE, {
            'student_id': student.id,
            'student_name': student.full_name,
            'old_status': old_status,
            'new_status': new_status,
            'message': f"{student.full_name} est maintenant {new_status}"
        })
    
    @classmethod
    def on_company_status_change(cls, company, new_status):
        """
        Handle company status change (pause/resume) - R17-R19
        
        When resuming (R19):
        - Notify first available students that they can pass
        
        When pausing:
        - Notify inscribed students that company is paused
        """
        from queues.models import Queue
        
        # Get all inscribed students
        inscribed_entries = Queue.objects.filter(
            company=company,
            is_completed=False
        ).select_related('student')
        
        if new_status == 'paused':
            # Notify inscribed students
            for entry in inscribed_entries:
                cls.notify_student(entry.student, cls.TYPE_COMPANY_STATUS, {
                    'message': f"{company.name} est maintenant en pause",
                    'company_id': company.id,
                    'company_name': company.name,
                    'status': 'paused'
                })
        else:  # recruiting
            # Notify inscribed students
            for entry in inscribed_entries:
                cls.notify_student(entry.student, cls.TYPE_COMPANY_STATUS, {
                    'message': f"{company.name} a repris le recrutement",
                    'company_id': company.id,
                    'company_name': company.name,
                    'status': 'recruiting'
                })
            
            # Send "can start" to first available students
            from queues.services import QueueService
            available_slots = company.get_available_slots()
            next_students = QueueService.get_first_available_students(company, available_slots)
            
            for i, entry in enumerate(next_students):
                if i == 0:
                    cls._send_to_group(
                        f"student_{entry.student.id}",
                        'can_start',
                        {
                            'notification_type': cls.TYPE_CAN_START,
                            'message': f"🎯 {company.name} a repris ! Tu peux passer maintenant !",
                            'company_id': company.id,
                            'company_name': company.name,
                            'queue_id': entry.id,
                            'can_start': True
                        }
                    )
        
        # Notify admin
        cls.notify_admin(cls.TYPE_COMPANY_STATUS, {
            'company_id': company.id,
            'company_name': company.name,
            'status': new_status
        })
    
    @classmethod
    def on_queue_inscription(cls, queue_entry):
        """
        Handle new queue inscription (R14)
        
        If student is immediately first available, notify them
        """
        from queues.services import QueueService
        from queues.models import Queue
        
        student = queue_entry.student
        company = queue_entry.company
        
        can_start, _ = QueueService.can_start_interview(queue_entry)
        ahead_count = QueueService.get_students_ahead_count(queue_entry)
        
        if can_start:
            cls._send_to_group(
                f"student_{student.id}",
                'can_start',
                {
                    'notification_type': cls.TYPE_CAN_START,
                    'message': f"🎯 Tu peux passer chez {company.name} maintenant !",
                    'company_id': company.id,
                    'company_name': company.name,
                    'queue_id': queue_entry.id,
                    'can_start': True,
                    'position': queue_entry.position
                }
            )
        else:
            cls.notify_student(student, cls.TYPE_QUEUE_UPDATE, {
                'message': f"Tu es inscrit chez {company.name} (position {queue_entry.position})",
                'company_id': company.id,
                'company_name': company.name,
                'position': queue_entry.position,
                'ahead_count': ahead_count
            })
        
        # Notify company of new inscription
        cls.notify_company(company, cls.TYPE_QUEUE_UPDATE, {
            'action': 'new_inscription',
            'student_id': student.id,
            'student_name': student.full_name,
            'position': queue_entry.position,
            'total_waiting': Queue.objects.filter(
                company=company, is_completed=False
            ).count()
        })

        # Notify admin
        cls.notify_admin(cls.TYPE_QUEUE_UPDATE, {
            'action': 'new_inscription',
            'student_name': student.full_name,
            'company_name': company.name,
            'message': f"{student.full_name} a rejoint la file de {company.name}"
        })
