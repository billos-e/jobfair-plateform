/**
 * Toast Context
 * Manages toast notifications display
 */
import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const showToast = useCallback((message, type = 'info', duration = 5000) => {
        const id = Date.now()
        const toast = { id, message, type }

        setToasts((prev) => [...prev, toast])

        // Auto-remove after duration
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, duration)

        return id
    }, [])

    const hideToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    const value = { toasts, showToast, hideToast }

    return (
        <ToastContext.Provider value={value}>
            {children}
            {/* Toast container */}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`toast toast-${toast.type} cursor-pointer`}
                        onClick={() => hideToast(toast.id)}
                    >
                        {toast.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within ToastProvider')
    }
    return context
}
