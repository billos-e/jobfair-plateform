import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Settings2, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminLayout() {
    const navigate = useNavigate()
    const location = useLocation()
    const { logout } = useAuth()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
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
                                            onClick={() => {
                                                navigate(tab.id)
                                                setIsMobileMenuOpen(false)
                                            }}
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
                                className="p-2 text-neutral-400 hover:text-neutral-500 hidden sm:block"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 text-neutral-400 hover:text-neutral-500 sm:hidden ml-4"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMobileMenuOpen && (
                    <div className="sm:hidden border-t border-neutral-200 bg-white">
                        <div className="pt-2 pb-3 space-y-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon
                                const isActive = location.pathname === tab.id ||
                                    (tab.id !== '/admin' && location.pathname.startsWith(tab.id))

                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            navigate(tab.id)
                                            setIsMobileMenuOpen(false)
                                        }}
                                        className={`
                                            w-full flex items-center px-4 py-3 text-base font-medium
                                            ${isActive
                                                ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500'
                                                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 border-l-4 border-transparent'}
                                        `}
                                    >
                                        <Icon className="mr-3 h-5 w-5" />
                                        {tab.label}
                                    </button>
                                )
                            })}
                            <button
                                onClick={() => {
                                    handleLogout()
                                    setIsMobileMenuOpen(false)
                                }}
                                className="w-full flex items-center px-4 py-3 text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 border-l-4 border-transparent"
                            >
                                <LogOut className="mr-3 h-5 w-5" />
                                Déconnexion
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    )
}
