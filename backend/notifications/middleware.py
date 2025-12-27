"""
WebSocket middleware for JWT authentication
Handles both student JWT and company token authentication
"""
from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


@database_sync_to_async
def get_user_from_token(token_str):
    """Validate JWT token and return user"""
    try:
        token = AccessToken(token_str)
        user_id = token['user_id']
        
        from django.contrib.auth import get_user_model
        User = get_user_model()
        return User.objects.get(id=user_id)
    except (InvalidToken, TokenError, Exception):
        return AnonymousUser()


@database_sync_to_async
def get_company_from_token(token_str):
    """Validate company access token and return company"""
    try:
        from companies.models import Company
        return Company.objects.get(access_token=token_str)
    except Company.DoesNotExist:
        return None


class WebSocketAuthMiddleware(BaseMiddleware):
    """
    Custom middleware for WebSocket authentication
    
    Supports two authentication methods:
    1. JWT token for students/admin: ws://...?token=<jwt_token>
    2. Company token: ws://...?company_token=<company_access_token>
    """
    
    async def __call__(self, scope, receive, send):
        # Parse query string
        query_string = scope.get('query_string', b'').decode()
        query_params = parse_qs(query_string)
        
        # Initialize scope variables
        scope['user'] = AnonymousUser()
        scope['company'] = None
        scope['auth_type'] = None
        
        # Check for JWT token (student/admin)
        jwt_token = query_params.get('token', [None])[0]
        if jwt_token:
            user = await get_user_from_token(jwt_token)
            if user and not isinstance(user, AnonymousUser):
                scope['user'] = user
                scope['auth_type'] = 'jwt'
        
        # Check for company token
        company_token = query_params.get('company_token', [None])[0]
        if company_token:
            company = await get_company_from_token(company_token)
            if company:
                scope['company'] = company
                scope['auth_type'] = 'company'
        
        return await super().__call__(scope, receive, send)
