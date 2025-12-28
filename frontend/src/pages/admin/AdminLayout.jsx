import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Settings2, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminLayout() {
    const navigate = useNavigate()
    const location = useLocation()
    const { logout } = useAuth()

    const tabs = [
        { id: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { id: '/admin/management', label: 'Gestion', icon: Settings2 },
        { id: '/admin/users', label: 'Utilisateurs', icon: Users },
    ]

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col">
            {/* Top Navigation Bar */}
            <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                                    JobFair Admin
                                </h1>
                            </div>
                            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon
                                    const isActive = location.pathname === tab.id ||
                                        (tab.id !== '/admin' && location.pathname.startsWith(tab.id))

                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => navigate(tab.id)}
                                            className={`
                                                inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium
                                                ${isActive
                                                    ? 'border-primary-500 text-neutral-900'
                                                    : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'}
                                            `}
                                        >
                                            <Icon className="mr-2 h-4 w-4" />
                                            {tab.label}
                                        </button>
                                    )
                                })}
                            </nav>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={handleLogout}
                                className="p-2 text-neutral-400 hover:text-neutral-500"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    )
}
