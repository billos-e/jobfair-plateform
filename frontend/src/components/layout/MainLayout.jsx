/**
 * Main Layout Component
 * Header + Sidebar + Content area
 */
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useWebSocket } from '../../contexts/WebSocketContext'
import {
    Home,
    Building2,
    Users,
    LogOut,
    Menu,
    X,
    Wifi,
    WifiOff
} from 'lucide-react'
import { useState } from 'react'

export default function MainLayout({ children }) {
    const { user, logout } = useAuth()
    const { isConnected } = useWebSocket()
    const location = useLocation()
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    // Navigation items based on role
    const navItems = user?.role === 'admin'
        ? [
            { path: '/admin', icon: Home, label: 'Dashboard' },
            { path: '/admin/students', icon: Users, label: 'Étudiants' },
            { path: '/admin/companies', icon: Building2, label: 'Entreprises' },
        ]
        : [
            { path: '/dashboard', icon: Home, label: 'Mon espace' },
            { path: '/companies', icon: Building2, label: 'Entreprises' },
        ]

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-neutral-200 z-40">
                <div className="flex items-center justify-between h-full px-4">
                    {/* Mobile menu button */}
                    <button
                        className="lg:hidden p-2 text-neutral-600 hover:text-neutral-900"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
                        <span className="text-xl font-bold text-primary-500">JobFair</span>
                        <span className="text-sm text-neutral-500 hidden sm:block">Platform</span>
                    </Link>

                    {/* User info */}
                    <div className="flex items-center gap-4">
                        {/* Connection status */}
                        <div className="flex items-center gap-1">
                            {isConnected ? (
                                <Wifi size={16} className="text-success-500" />
                            ) : (
                                <WifiOff size={16} className="text-neutral-400" />
                            )}
                        </div>

                        {/* User name */}
                        <span className="text-sm text-neutral-600 hidden sm:block">
                            {user?.email}
                        </span>

                        {/* Logout button */}
                        <button
                            onClick={handleLogout}
                            className="p-2 text-neutral-600 hover:text-danger-500 transition-colors"
                            title="Déconnexion"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <aside
                className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-neutral-200 
                    transform transition-transform duration-200 z-30
                    lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <nav className="p-4">
                    <ul className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path
                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors
                              ${isActive
                                                ? 'bg-primary-50 text-primary-600'
                                                : 'text-neutral-600 hover:bg-neutral-100'}`}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <item.icon size={20} />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main content */}
            <main className="lg:ml-64 pt-16 min-h-screen">
                <div className="p-4 md:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
