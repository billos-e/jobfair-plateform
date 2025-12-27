"""
Unit tests for QueueService business logic
Testing rules R1-R15
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from students.models import Student
from companies.models import Company
from queues.models import Queue
from queues.services import QueueService

User = get_user_model()


class QueueServiceTest(TestCase):
    """Tests for QueueService business logic"""
    
    def setUp(self):
        """Set up test data"""
        # Create users
        self.user1 = User.objects.create_user(
            email='student1@test.com',
            password='testpass123',
            role='student'
        )
        self.user2 = User.objects.create_user(
            email='student2@test.com',
            password='testpass123',
            role='student'
        )
        self.user3 = User.objects.create_user(
            email='student3@test.com',
            password='testpass123',
            role='student'
        )
        
        # Create students
        self.student1 = Student.objects.create(
            user=self.user1,
            first_name='Alice',
            last_name='Test'
        )
        self.student2 = Student.objects.create(
            user=self.user2,
            first_name='Bob',
            last_name='Test'
        )
        self.student3 = Student.objects.create(
            user=self.user3,
            first_name='Charlie',
            last_name='Test'
        )
        
        # Create company
        self.company = Company.objects.create(
            name='Test Company',
            max_concurrent_interviews=1
        )
    
    def test_queue_position_order_R1(self):
        """R1: Position is determined by inscription order"""
        q1 = Queue.objects.create(company=self.company, student=self.student1)
        q2 = Queue.objects.create(company=self.company, student=self.student2)
        q3 = Queue.objects.create(company=self.company, student=self.student3)
        
        self.assertEqual(q1.position, 1)
        self.assertEqual(q2.position, 2)
        self.assertEqual(q3.position, 3)
    
    def test_first_available_skips_unavailable_R2_R3(self):
        """R2/R3: Skip unavailable students but they keep position"""
        Queue.objects.create(company=self.company, student=self.student1)
        Queue.objects.create(company=self.company, student=self.student2)
        Queue.objects.create(company=self.company, student=self.student3)
        
        # Make first student unavailable
        self.student1.status = 'in_interview'
        self.student1.save()
        
        # Should skip student1 and return student2
        first_available = QueueService.get_first_available_students(self.company, 1)
        self.assertEqual(first_available.first().student, self.student2)
    
    def test_can_start_interview_all_conditions_R10(self):
        """R10: All conditions must be met to start interview"""
        q1 = Queue.objects.create(company=self.company, student=self.student1)
        
        # All conditions met
        can_start, error = QueueService.can_start_interview(q1)
        self.assertTrue(can_start)
        self.assertIsNone(error)
    
    def test_cannot_start_if_not_first_R10(self):
        """R10: Cannot start if not first available"""
        Queue.objects.create(company=self.company, student=self.student1)
        q2 = Queue.objects.create(company=self.company, student=self.student2)
        
        can_start, error = QueueService.can_start_interview(q2)
        self.assertFalse(can_start)
        self.assertIn("pas encore votre tour", error)
    
    def test_cannot_start_if_company_paused_R10(self):
        """R10: Cannot start if company is paused"""
        self.company.status = 'paused'
        self.company.save()
        
        q1 = Queue.objects.create(company=self.company, student=self.student1)
        
        can_start, error = QueueService.can_start_interview(q1)
        self.assertFalse(can_start)
        self.assertIn("pause", error)
    
    def test_cannot_start_if_no_slots_R10(self):
        """R10: Cannot start if no available slots"""
        q1 = Queue.objects.create(company=self.company, student=self.student1)
        
        # Start interview for first student
        self.student1.start_interview(self.company)
        
        q2 = Queue.objects.create(company=self.company, student=self.student2)
        
        can_start, error = QueueService.can_start_interview(q2)
        self.assertFalse(can_start)
        self.assertIn("plus d'étudiants", error)
    
    def test_complete_interview_marks_completed_R6(self):
        """R6: Company can mark student as passed"""
        q1 = Queue.objects.create(company=self.company, student=self.student1)
        self.student1.start_interview(self.company)
        
        result = QueueService.complete_interview(q1)
        
        q1.refresh_from_db()
        self.assertTrue(q1.is_completed)
        self.assertIsNotNone(q1.completed_at)
    
    def test_complete_interview_auto_pauses_student_R7(self):
        """R7: Student is auto-paused when marked complete"""
        q1 = Queue.objects.create(company=self.company, student=self.student1)
        self.student1.start_interview(self.company)
        
        QueueService.complete_interview(q1)
        
        self.student1.refresh_from_db()
        self.assertEqual(self.student1.status, 'paused')
        self.assertIsNone(self.student1.current_company)
    
    def test_complete_interview_frees_slot_R12(self):
        """R12: Slot is freed immediately when marked complete"""
        q1 = Queue.objects.create(company=self.company, student=self.student1)
        self.student1.start_interview(self.company)
        
        # No slots available
        self.assertEqual(self.company.get_available_slots(), 0)
        
        QueueService.complete_interview(q1)
        
        # Slot is freed
        self.assertEqual(self.company.get_available_slots(), 1)
    
    def test_students_ahead_count(self):
        """Test students ahead calculation"""
        q1 = Queue.objects.create(company=self.company, student=self.student1)
        q2 = Queue.objects.create(company=self.company, student=self.student2)
        q3 = Queue.objects.create(company=self.company, student=self.student3)
        
        # Student1 is first, 0 ahead
        self.assertEqual(QueueService.get_students_ahead_count(q1), 0)
        
        # Student2 is second, 1 ahead
        self.assertEqual(QueueService.get_students_ahead_count(q2), 1)
        
        # Student3 is third, 2 ahead
        self.assertEqual(QueueService.get_students_ahead_count(q3), 2)
        
        # If student1 completes, student2 still has 0 (because q1 is completed)
        q1.is_completed = True
        q1.save()
        self.assertEqual(QueueService.get_students_ahead_count(q2), 0)


class CompanyStatusTest(TestCase):
    """Tests for company pause/resume - R17-R20"""
    
    def setUp(self):
        self.company = Company.objects.create(
            name='Test Company',
            max_concurrent_interviews=2
        )
    
    def test_company_defaults_to_recruiting_R17(self):
        """R17: Companies default to recruiting status"""
        self.assertEqual(self.company.status, 'recruiting')
        self.assertTrue(self.company.is_recruiting())
    
    def test_company_pause_R17(self):
        """R17: Company can be paused"""
        self.company.pause()
        self.assertEqual(self.company.status, 'paused')
        self.assertFalse(self.company.is_recruiting())
    
    def test_company_resume_R19(self):
        """R19: Company can resume recruiting"""
        self.company.pause()
        self.company.resume()
        self.assertEqual(self.company.status, 'recruiting')
