/**
 * WebSocket Context
 * Manages WebSocket connection and provides hooks for real-time updates
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { wsClient } from '../services/websocket'
import { useAuth } from './AuthContext'
import { getAccessToken } from '../services/api'
import { useToast } from './ToastContext'

const WebSocketContext = createContext(null)

export function WebSocketProvider({ children }) {
    const { user, isAuthenticated } = useAuth()
    const queryClient = useQueryClient()
    const { showToast } = useToast()
    const [connectionStatus, setConnectionStatus] = useState('disconnected')
    const [lastNotification, setLastNotification] = useState(null)

    // Connect WebSocket when authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            const token = getAccessToken()
            wsClient.connect(token)
        } else {
            wsClient.disconnect()
        }


        return () => {
            wsClient.disconnect()
        }
    }, [isAuthenticated, user])

    // Set up event listeners
    useEffect(() => {
        const handleConnection = (data) => {
            setConnectionStatus(data.status)
        }

        const handleNotification = (data) => {
            setLastNotification(data)

            // Show toast for important notifications
            if (data.data?.message) {
                showToast(data.data.message, 'info')
            }

            // Student/Admin dashboard usually need refresh on notifications
            queryClient.invalidateQueries({ queryKey: ['queues'] })
            queryClient.invalidateQueries({ queryKey: ['opportunities'] })
            queryClient.invalidateQueries({ queryKey: ['profile'] })
        }

        const handleUrgent = (data) => {
            setLastNotification({ ...data, urgent: true })

            // Urgent notification - can start interview!
            if (data.data?.message) {
                showToast(data.data.message, 'success')
            }

            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ['opportunities'] })
            queryClient.invalidateQueries({ queryKey: ['queues'] })
            queryClient.invalidateQueries({ queryKey: ['profile'] })
        }

        const handleQueueUpdate = (data) => {
            // Invalidate queue queries to refetch
            queryClient.invalidateQueries({ queryKey: ['queues'] })
            queryClient.invalidateQueries({ queryKey: ['companies'] })
            queryClient.invalidateQueries({ queryKey: ['dashboard'] })
            queryClient.invalidateQueries({ queryKey: ['opportunities'] })
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
        }

        const handleStatusChange = (data) => {
            // Invalidate profile queries
            queryClient.invalidateQueries({ queryKey: ['profile'] })
            queryClient.invalidateQueries({ queryKey: ['opportunities'] })
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
        }

        // Visibility change listener for auto-reconnect
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && !wsClient.isConnected()) {
                console.log('App visible, attempting WebSocket reconnection...')
                wsClient.reconnect()
            }
        }

        // Register listeners
        wsClient.on('connection', handleConnection)
        wsClient.on('notification', handleNotification)
        wsClient.on('urgent', handleUrgent)
        wsClient.on('can_start', handleUrgent)
        wsClient.on('queue_update', handleQueueUpdate)
        wsClient.on('status_change', handleStatusChange)
        wsClient.on('interview_started', handleQueueUpdate)
        wsClient.on('interview_completed', handleQueueUpdate)

        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            wsClient.off('connection', handleConnection)
            wsClient.off('notification', handleNotification)
            wsClient.off('urgent', handleUrgent)
            wsClient.off('can_start', handleUrgent)
            wsClient.off('queue_update', handleQueueUpdate)
            wsClient.off('status_change', handleStatusChange)
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [queryClient, showToast])

    // Manual connect for company token
    const connectWithCompanyToken = useCallback((companyToken) => {
        wsClient.connect(null, companyToken)
    }, [])

    const reconnect = useCallback(() => {
        wsClient.reconnect()
    }, [])

    const value = {
        connectionStatus,
        isConnected: connectionStatus === 'connected',
        lastNotification,
        connectWithCompanyToken,
        reconnect,
    }

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    )
}

export function useWebSocket() {
    const context = useContext(WebSocketContext)
    if (!context) {
        throw new Error('useWebSocket must be used within WebSocketProvider')
    }
    return context
}
