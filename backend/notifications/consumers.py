"""
WebSocket consumers for real-time notifications
Complete implementation for Phase 4
"""
import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async


class NotificationConsumer(AsyncJsonWebsocketConsumer):
    """
    WebSocket consumer for real-time notifications
    
    Authentication:
    - Students/Admin: JWT token in query string (?token=xxx)
    - Companies: Company access token (?company_token=xxx)
    
    Groups:
    - student_{id}: Personal notifications for a student
    - company_{token}: Updates for a company dashboard
    - admin: Global admin notifications
    """
    
    async def connect(self):
        """Handle WebSocket connection with authentication"""
        self.user = self.scope.get('user')
        self.company = self.scope.get('company')
        self.auth_type = self.scope.get('auth_type')
        self.groups = []
        
        # Reject unauthenticated connections
        if not self.auth_type:
            await self.close(code=4001)
            return
        
        # Accept connection
        await self.accept()
        
        # Join appropriate groups based on auth type
        if self.auth_type == 'jwt' and self.user.is_authenticated:
            await self._setup_user_groups()
        elif self.auth_type == 'company' and self.company:
            await self._setup_company_groups()
        
        # Send connection confirmation
        await self.send_json({
            'type': 'connection_established',
            'auth_type': self.auth_type,
            'groups': self.groups
        })
    
    async def _setup_user_groups(self):
        """Set up groups for authenticated user (student/admin)"""
        user = self.user
        
        if user.role == 'student':
            # Get student ID
            student_id = await self._get_student_id(user)
            if student_id:
                group_name = f"student_{student_id}"
                await self.channel_layer.group_add(group_name, self.channel_name)
                self.groups.append(group_name)
        
        if user.role == 'admin' or user.is_superuser:
            await self.channel_layer.group_add('admin', self.channel_name)
            self.groups.append('admin')
    
    async def _setup_company_groups(self):
        """Set up groups for company token auth"""
        group_name = f"company_{self.company.access_token}"
        await self.channel_layer.group_add(group_name, self.channel_name)
        self.groups.append(group_name)
    
    @database_sync_to_async
    def _get_student_id(self, user):
        """Get student ID for user"""
        if hasattr(user, 'student'):
            return user.student.id
        return None
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection - leave all groups"""
        for group in self.groups:
            await self.channel_layer.group_discard(group, self.channel_name)
    
    async def receive_json(self, content):
        """
        Handle incoming WebSocket messages
        
        Supported message types:
        - ping: Keep-alive, responds with pong
        - subscribe: Subscribe to additional groups (future use)
        """
        message_type = content.get('type')
        
        if message_type == 'ping':
            await self.send_json({'type': 'pong'})
        
        elif message_type == 'subscribe':
            # Future: allow subscribing to specific company updates
            pass
    
    # ==========================================
    # Event handlers (called by channel_layer.group_send)
    # ==========================================
    
    async def notification(self, event):
        """
        Handle notification events
        Sent by NotificationService for personal notifications
        """
        await self.send_json({
            'type': 'notification',
            'data': event.get('data', {})
        })
    
    async def queue_update(self, event):
        """
        Handle queue update events
        Sent when queue state changes (inscription, completion, etc.)
        """
        await self.send_json({
            'type': 'queue_update',
            'data': event.get('data', {})
        })
    
    async def status_change(self, event):
        """
        Handle status change events
        Sent when student or company status changes
        """
        await self.send_json({
            'type': 'status_change',
            'data': event.get('data', {})
        })
    
    async def interview_started(self, event):
        """Handle interview started event"""
        await self.send_json({
            'type': 'interview_started',
            'data': event.get('data', {})
        })
    
    async def interview_completed(self, event):
        """Handle interview completed event"""
        await self.send_json({
            'type': 'interview_completed',
            'data': event.get('data', {})
        })
    
    async def can_start(self, event):
        """
        Handle "you can start" notification
        Critical notification when it's student's turn
        """
        await self.send_json({
            'type': 'can_start',
            'data': event.get('data', {}),
            'urgent': True
        })
