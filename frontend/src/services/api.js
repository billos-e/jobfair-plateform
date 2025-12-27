/**
 * API Client for JobFair Platform
 * Axios instance with JWT interceptors
 */
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Token management
const TOKEN_KEY = 'jobfair_access_token'
const REFRESH_KEY = 'jobfair_refresh_token'

export const getAccessToken = () => localStorage.getItem(TOKEN_KEY)
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY)

export const setTokens = (access, refresh) => {
    localStorage.setItem(TOKEN_KEY, access)
    localStorage.setItem(REFRESH_KEY, refresh)
}

export const clearTokens = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
}

// Request interceptor - add JWT token
api.interceptors.request.use(
    (config) => {
        const token = getAccessToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor - handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // If 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            const refreshToken = getRefreshToken()
            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_URL}/auth/refresh/`, {
                        refresh: refreshToken,
                    })

                    const { access } = response.data
                    localStorage.setItem(TOKEN_KEY, access)

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${access}`
                    return api(originalRequest)
                } catch (refreshError) {
                    // Refresh failed - clear tokens and redirect to login
                    clearTokens()
                    window.location.href = '/login'
                    return Promise.reject(refreshError)
                }
            }
        }

        return Promise.reject(error)
    }
)

// ==========================================
// Auth API
// ==========================================
export const authAPI = {
    register: (data) => api.post('/auth/register/', data),
    login: (email, password) => api.post('/auth/login/', { email, password }),
    refresh: (refreshToken) => api.post('/auth/refresh/', { refresh: refreshToken }),
    me: () => api.get('/auth/me/'),
}

// ==========================================
// Student API
// ==========================================
export const studentAPI = {
    getProfile: () => api.get('/students/me/'),
    updateProfile: (data) => api.patch('/students/me/', data),
    updateStatus: (status) => api.patch('/students/me/status/', { status }),
}

// ==========================================
// Company API (for students)
// ==========================================
export const companyAPI = {
    list: () => api.get('/companies/'),
}

// ==========================================
// Company Dashboard API (token-based)
// ==========================================
export const companyDashboardAPI = {
    getDashboard: (token) => api.get(`/companies/${token}/`),
    updateStatus: (token, status) => api.patch(`/companies/${token}/status/`, { status }),
    updateSettings: (token, data) => api.patch(`/companies/${token}/settings/`, data),
    getNextStudent: (token) => api.post(`/company/${token}/queues/next/`),
    completeInterview: (token, queueId) => api.post(`/company/${token}/queues/${queueId}/complete/`),
}

// ==========================================
// Queue API
// ==========================================
export const queueAPI = {
    list: () => api.get('/queues/'),
    join: (companyId) => api.post('/queues/', { company: companyId }),
    startInterview: (queueId) => api.post(`/queues/${queueId}/start/`),
    getOpportunities: () => api.get('/queues/opportunities/'),
}

// ==========================================
// Admin API
// ==========================================
export const adminAPI = {
    // Students
    listStudents: () => api.get('/students/admin/students/'),
    createStudent: (data) => api.post('/students/admin/students/', data),
    updateStudent: (id, data) => api.patch(`/students/admin/students/${id}/`, data),
    deleteStudent: (id) => api.delete(`/students/admin/students/${id}/`),

    // Companies
    listCompanies: () => api.get('/companies/admin/companies/'),
    createCompany: (data) => api.post('/companies/admin/companies/', data),
    updateCompany: (id, data) => api.patch(`/companies/admin/companies/${id}/`, data),
    deleteCompany: (id) => api.delete(`/companies/admin/companies/${id}/`),
    regenerateToken: (id) => api.post(`/companies/admin/companies/${id}/regenerate_token/`),
    pauseCompany: (id) => api.post(`/companies/admin/companies/${id}/pause/`),
    resumeCompany: (id) => api.post(`/companies/admin/companies/${id}/resume/`),

    // Dashboard
    getDashboard: () => api.get('/admin/dashboard/'),
}

export default api
