import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import LogoLoader from './components/ui/LogoLoader'

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
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminManagement from './pages/admin/Management'
import AdminUsers from './pages/admin/Users'
import AdminCompanyDetail from './pages/admin/CompanyDetail'
import AdminStudentDetail from './pages/admin/StudentDetail'

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
                <LogoLoader />
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

/**
 * Public Only Route wrapper
 * Redirects to dashboard if already authenticated
 */
function PublicOnlyRoute({ children }) {
    const { user, isLoading } = useAuth()

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LogoLoader />
            </div>
        )
    }

    if (user) {
        if (user.role === 'admin') return <Navigate to="/admin" replace />
        return <Navigate to="/dashboard" replace />
    }

    return children
}

function App() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={
                <PublicOnlyRoute>
                    <Login />
                </PublicOnlyRoute>
            } />
            <Route path="/register" element={
                <PublicOnlyRoute>
                    <Register />
                </PublicOnlyRoute>
            } />

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
            <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout />
                </ProtectedRoute>
            }>
                <Route index element={<AdminDashboard />} />
                <Route path="management" element={<AdminManagement />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="companies/:id" element={<AdminCompanyDetail />} />
                <Route path="students/:id" element={<AdminStudentDetail />} />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}

export default App
