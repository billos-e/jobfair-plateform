/**
 * Authentication Context
 * Manages user authentication state and JWT tokens
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI, setTokens, clearTokens, getAccessToken } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    // Check for existing session on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = getAccessToken()
            if (token) {
                try {
                    const response = await authAPI.me()
                    setUser(response.data)
                } catch (error) {
                    console.error('Auth check failed:', error)
                    clearTokens()
                }
            }
            setIsLoading(false)
        }
        checkAuth()
    }, [])

    // Login handler
    const login = useCallback(async (email, password) => {
        const response = await authAPI.login(email, password)
        const { access, refresh } = response.data
        setTokens(access, refresh)

        // Get user info
        const userResponse = await authAPI.me()
        setUser(userResponse.data)

        return userResponse.data
    }, [])

    // Register handler
    const register = useCallback(async (data) => {
        const response = await authAPI.register(data)
        return response.data
    }, [])

    // Logout handler
    const logout = useCallback(() => {
        clearTokens()
        setUser(null)
    }, [])

    const value = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}
