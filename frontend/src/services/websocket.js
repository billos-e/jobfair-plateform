/**
 * WebSocket client for real-time notifications
 */

// Helper to determine WebSocket URL from API URL
const getWebSocketUrl = () => {
    // 1. Explicit WS URL
    if (import.meta.env.VITE_WS_URL) {
        return import.meta.env.VITE_WS_URL
    }

    // 2. Derive from API URL
    const apiUrl = import.meta.env.VITE_API_URL
    if (apiUrl) {
        const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws'
        // Remove protocol and /api suffix to get host
        const host = apiUrl.replace(/^https?:\/\//, '').replace(/\/api\/?$/, '')
        return `${wsProtocol}://${host}/ws/notifications/`
    }

    // 3. Fallback to localhost
    return 'ws://localhost:8000/ws/notifications/'
}

const WS_URL = getWebSocketUrl()

class WebSocketClient {
    constructor() {
        this.socket = null
        this.listeners = new Map()
        this.reconnectAttempts = 0
        this.maxReconnectAttempts = 5
        this.reconnectDelay = 1000
        this.isConnecting = false
        this.authToken = null
        this.companyToken = null
    }

    /**
     * Connect to WebSocket with authentication
     * @param {string} authToken - JWT token for student/admin
     * @param {string} companyToken - Company access token (optional)
     */
    connect(authToken = null, companyToken = null) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            console.log('WebSocket already connected')
            return
        }

        if (this.isConnecting) {
            console.log('WebSocket connection in progress')
            return
        }

        this.authToken = authToken
        this.companyToken = companyToken
        this.isConnecting = true

        // Build URL with auth params
        let url = WS_URL
        const params = []
        if (authToken) params.push(`token=${authToken}`)
        if (companyToken) params.push(`company_token=${companyToken}`)
        if (params.length > 0) {
            url += '?' + params.join('&')
        }

        try {
            this.socket = new WebSocket(url)

            this.socket.onopen = () => {
                console.log('WebSocket connected')
                this.isConnecting = false
                this.reconnectAttempts = 0
                this._emit('connection', { status: 'connected' })
            }

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)
                    this._handleMessage(data)
                } catch (error) {
                    console.error('WebSocket message parse error:', error)
                }
            }

            this.socket.onclose = (event) => {
                console.log('WebSocket closed:', event.code, event.reason)
                this.isConnecting = false
                this._emit('connection', { status: 'disconnected' })
                this._attemptReconnect()
            }

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error)
                this.isConnecting = false
                this._emit('error', { error })
            }
        } catch (error) {
            console.error('WebSocket connection error:', error)
            this.isConnecting = false
        }
    }

    /**
     * Disconnect WebSocket
     */
    disconnect() {
        if (this.socket) {
            this.socket.close()
            this.socket = null
        }
        this.reconnectAttempts = this.maxReconnectAttempts // Prevent reconnect
    }

    /**
     * Attempt to reconnect with exponential backoff
     */
    _attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Max reconnection attempts reached')
            this._emit('connection', { status: 'failed' })
            return
        }

        this.reconnectAttempts++
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
        console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)

        this.reconnectTimer = setTimeout(() => {
            this.connect(this.authToken, this.companyToken)
        }, delay)
    }

    /**
     * Manual reconnection trigger
     */
    reconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = null
        }
        this.reconnectAttempts = 0
        this.connect(this.authToken, this.companyToken)
    }

    /**
     * Handle incoming WebSocket message
     */
    _handleMessage(data) {
        const { type, ...payload } = data

        // Emit specific event type
        this._emit(type, payload)

        // Also emit generic 'message' event
        this._emit('message', data)

        // Special handling for urgent notifications
        if (type === 'can_start' || payload.urgent) {
            this._emit('urgent', payload)
        }
    }

    /**
     * Add event listener
     * @param {string} event - Event type
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, [])
        }
        this.listeners.get(event).push(callback)
    }

    /**
     * Remove event listener
     */
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event)
            const index = callbacks.indexOf(callback)
            if (index > -1) {
                callbacks.splice(index, 1)
            }
        }
    }

    /**
     * Emit event to listeners
     */
    _emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach((callback) => {
                try {
                    callback(data)
                } catch (error) {
                    console.error('WebSocket listener error:', error)
                }
            })
        }
    }

    /**
     * Send message to server
     */
    send(data) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data))
        } else {
            console.warn('WebSocket not connected, cannot send message')
        }
    }

    /**
     * Send ping to keep connection alive
     */
    ping() {
        this.send({ type: 'ping' })
    }

    /**
     * Check if connected
     */
    isConnected() {
        return this.socket?.readyState === WebSocket.OPEN
    }
}

// Export singleton instance
export const wsClient = new WebSocketClient()
export default wsClient
