import os
import django
import sys
import json

# Setup Django environment
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
os.environ['ALLOWED_HOSTS'] = 'testserver,localhost,127.0.0.1'
django.setup()

from django.contrib.auth import get_user_model
from django.test import Client
from students.models import Student
from companies.models import Company
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

def verify_backend_logic():
    print(f"--- STARTING BACKEND LOGIC VERIFICATION ---")
    
    # 1. Setup Data
    print(f"\n[1] Setting up test data...")
    User.objects.filter(email__in=['student_test@jobfair.com']).delete()
    Company.objects.filter(name='Logic Corp').delete()
    

    # Create Student
    student_user = User.objects.create_user(
        email='student_test@jobfair.com', 
        password='password123', 
        role='student'
    )
    student = Student.objects.create(
        user=student_user,
        first_name='Logic',
        last_name='Tester'
    )
    print(f"✅ Student created: {student_user.email}")
    
    # Create Company
    company = Company.objects.create(
        name='Logic Corp',
        max_concurrent_interviews=3
    )
    print(f"✅ Company created: {company.name}")
    print(f"   Token: {company.access_token}")
    
    # 2. Test Flow using Django Client
    client = Client()
    
    # Login
    print(f"\n[2] Logging in...")
    try:
        login_resp = client.post(
            '/api/auth/login/', 
            {'email': 'student_test@jobfair.com', 'password': 'password123'}, 
            content_type='application/json'
        )
    except Exception as e:
        print(f"❌ Login Request Exception: {e}")
        return False
    
    if login_resp.status_code != 200:
        print(f"❌ Login failed: {login_resp.status_code}")
        # Print first 200 chars of content to avoid flooding
        print(f"Response: {login_resp.content[:200]}")
        return False
        
    token = login_resp.json()['access']
    print(f"✅ Login successful.")
    
    auth_headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
    
    # Join Queue
    print(f"\n[3] Joining Queue...")
    join_resp = client.post(
        '/api/queues/', 
        {'company': company.id}, 
        content_type='application/json', 
        **auth_headers
    )
    
    if join_resp.status_code == 201:
        queue_data = join_resp.json()
        print(f"✅ Joined Queue. Position: {queue_data['position']}")
    else:
        print(f"❌ Join Queue failed: {join_resp.status_code}")
        print(f"Response: {join_resp.content[:500]}")
        return False

    # Check Company Dashboard
    print(f"\n[4] Checking Company Dashboard...")
    dashboard_resp = client.get(f"/api/companies/{company.access_token}/")
    
    if dashboard_resp.status_code == 200:
        data = dashboard_resp.json()
        waiting_list = data['waiting']
        print(f"   Waiting count: {len(waiting_list)}")
        
        if len(waiting_list) == 1 and waiting_list[0]['student_id'] == student.id:
            print(f"✅ Student found in Company Waiting list.")
        else:
            print(f"❌ Student NOT found or count mismatch.")
            return False
    else:
        print(f"❌ Dashboard access failed: {dashboard_resp.status_code}")
        print(f"Response: {dashboard_resp.content[:500]}")
        return False
        
    print(f"\n--- VERIFICATION SUCCESSFUL ---")
    return True

if __name__ == "__main__":
    success = verify_backend_logic()
    sys.exit(0 if success else 1)
