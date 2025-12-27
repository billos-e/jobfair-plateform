import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

// Layouts
import MainLayout from './components/layout/MainLayout'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Student pages
import StudentDashboard from './pages/student/Dashboard'
import StudentCompanies from './pages/student/Companies'

// Company pages
import CompanyDashboard from './pages/company/Dashboard'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminStudents from './pages/admin/Students'
import AdminCompanies from './pages/admin/Companies'

/**
 * Protected Route wrapper
 * Redirects to login if not authenticated
 * Optionally checks for specific roles
 */
function ProtectedRoute({ children, allowedRoles }) {
    const { user, isLoading } = useAuth()

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        if (user.role === 'admin') return <Navigate to="/admin" replace />
        return <Navigate to="/dashboard" replace />
    }

    return children
}

/**
 * Company Route wrapper
 * For company token-based access (no user auth)
 */
function CompanyRoute({ children }) {
    // Company auth is handled by token in URL
    return children
}

function App() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Student routes */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['student']}>
                        <MainLayout>
                            <StudentDashboard />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/companies"
                element={
                    <ProtectedRoute allowedRoles={['student']}>
                        <MainLayout>
                            <StudentCompanies />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />

            {/* Company routes (token-based) */}
            <Route
                path="/company/:token"
                element={
                    <CompanyRoute>
                        <CompanyDashboard />
                    </CompanyRoute>
                }
            />

            {/* Admin routes */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <MainLayout>
                            <AdminDashboard />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/students"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <MainLayout>
                            <AdminStudents />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/companies"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <MainLayout>
                            <AdminCompanies />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}

export default App
