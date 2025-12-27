"""
ASGI config for JobFair Platform

Configures Django Channels for WebSocket support with custom auth middleware
"""
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Initialize Django ASGI application early to ensure the AppRegistry
# is populated before importing code that may import ORM models.
django_asgi_app = get_asgi_application()

# Import after Django setup
from notifications.routing import websocket_urlpatterns
from notifications.middleware import WebSocketAuthMiddleware

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': WebSocketAuthMiddleware(
        URLRouter(websocket_urlpatterns)
    ),
})
