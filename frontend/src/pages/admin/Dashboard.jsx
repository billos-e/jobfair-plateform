/**
 * Admin Dashboard
 * Global statistics and activity feed
 */
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '../../services/api'
import { useWebSocket } from '../../contexts/WebSocketContext'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card, { CardTitle } from '../../components/ui/Card'
import { Users, Building2, Clock, Activity, Loader2 } from 'lucide-react'

export default function AdminDashboard() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { isConnected } = useWebSocket()
    const [activityFeed, setActivityFeed] = useState([])

    // Fetch stats form API
    const { data: stats, isLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: () => adminAPI.getDashboard().then(res => res.data),
        refetchInterval: 60000,
    })

    // Listen to WebSocket events for real-time updates
    useEffect(() => {
        const handleUpdate = (event) => {
            // Invalidate stats to trigger refetch
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] })

            // Add to activity feed
            const newActivity = {
                id: Date.now(),
                type: event.type,
                message: event.data.message || 'Nouvelle activité',
                timestamp: new Date().toLocaleTimeString(),
            }
            setActivityFeed(prev => [newActivity, ...prev].slice(0, 10))
        }

        const ws = import('../../services/websocket').then(({ wsClient }) => {
            wsClient.on('queue_update', handleUpdate)
            wsClient.on('status_change', handleUpdate)
            wsClient.on('notification', handleUpdate)
        })

        return () => {
            import('../../services/websocket').then(({ wsClient }) => {
                wsClient.off('queue_update', handleUpdate)
                wsClient.off('status_change', handleUpdate)
                wsClient.off('notification', handleUpdate)
            })
        }
    }, [queryClient])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-primary-500" size={32} />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Administration</h1>
                    <p className="text-neutral-500 mt-1">Vue d&apos;ensemble du forum</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success-500' : 'bg-neutral-400'}`} />
                    {isConnected ? 'Connecté au live' : (
                        <div className="flex items-center gap-2">
                            <span>Déconnecté</span>
                            <button
                                onClick={() => import('../../services/websocket').then(m => m.wsClient.reconnect())}
                                className="text-primary-600 hover:text-primary-700 font-bold underline"
                            >
                                Reconnecter
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="text-center">
                    <Users className="mx-auto text-primary-500 mb-2" size={32} />
                    <div className="text-3xl font-bold text-neutral-900">{stats?.total_students || 0}</div>
                    <div className="text-sm text-neutral-500">Étudiants</div>
                </Card>
                <Card className="text-center">
                    <Building2 className="mx-auto text-success-500 mb-2" size={32} />
                    <div className="text-3xl font-bold text-neutral-900">{stats?.total_companies || 0}</div>
                    <div className="text-sm text-neutral-500">Entreprises</div>
                </Card>
                <Card className="text-center">
                    <Clock className="mx-auto text-warning-500 mb-2" size={32} />
                    <div className="text-3xl font-bold text-neutral-900">{stats?.waiting_count || 0}</div>
                    <div className="text-sm text-neutral-500">En attente</div>
                </Card>
                <Card className="text-center">
                    <Activity className="mx-auto text-danger-500 mb-2" size={32} />
                    <div className="text-3xl font-bold text-neutral-900">{stats?.current_interviews || stats?.total_interviews || 0}</div>
                    <div className="text-sm text-neutral-500">
                        {stats?.current_interviews !== undefined ? 'Actifs' : 'Total'}
                    </div>
                </Card>
            </div>

            {/* Activity feed and Idle Lists */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Activity Feed */}
                <Card className="h-full">
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="text-primary-500" size={20} />
                        Activité récente
                    </CardTitle>
                    <div className="mt-4 space-y-4 max-h-96 overflow-y-auto pr-2">
                        {activityFeed.length === 0 ? (
                            <p className="text-neutral-500 text-center py-4">
                                En attente d&apos;activité...
                            </p>
                        ) : (
                            activityFeed.map((activity) => (
                                <div key={activity.id} className="flex flex-col gap-1 text-sm border-b border-neutral-100 pb-2 last:border-0 hover:bg-neutral-50 p-2 rounded transition-colors">
                                    <span className="text-neutral-700 font-medium">{activity.message}</span>
                                    <span className="text-neutral-400 font-mono text-xs">{activity.timestamp}</span>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                {/* Idle Lists */}
                <div className="space-y-6">
                    {/* Idle Companies */}
                    <Card>
                        <CardTitle className="flex items-center gap-2 text-warning-600">
                            <Clock size={20} />
                            Entreprises sans activité ({stats?.idle_companies?.length || 0})
                        </CardTitle>
                        <div className="mt-4 max-h-48 overflow-y-auto">
                            {!stats?.idle_companies?.length ? (
                                <p className="text-neutral-400 text-sm">Toutes les entreprises sont actives</p>
                            ) : (
                                <ul className="space-y-2">
                                    {stats.idle_companies.map(c => (
                                        <li
                                            key={c.id}
                                            className="text-sm flex justify-between items-center bg-warning-50 p-2 rounded cursor-pointer hover:bg-warning-100 transition-colors"
                                            onClick={() => navigate(`/admin/companies/${c.id}`)}
                                        >
                                            <span className="font-medium text-neutral-900">{c.name}</span>
                                            <span className="text-xs text-warning-700 px-2 py-1 bg-white rounded-full border border-warning-200">
                                                0 entretien
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </Card>

                    {/* Idle Students */}
                    <Card>
                        <CardTitle className="flex items-center gap-2 text-neutral-500">
                            <Users size={20} />
                            Étudiants sans file d'attente ({stats?.idle_students?.length || 0})
                        </CardTitle>
                        <div className="mt-4 max-h-48 overflow-y-auto">
                            {!stats?.idle_students?.length ? (
                                <p className="text-neutral-400 text-sm">Tous les étudiants sont inscrits</p>
                            ) : (
                                <ul className="space-y-2">
                                    {stats.idle_students.map(s => (
                                        <li
                                            key={s.id}
                                            className="text-sm flex justify-between items-center bg-neutral-50 p-2 rounded cursor-pointer hover:bg-neutral-100 transition-colors"
                                            onClick={() => navigate(`/admin/students/${s.id}`)}
                                        >
                                            <span className="font-medium text-neutral-900">{s.first_name} {s.last_name}</span>
                                            <span className="text-xs text-neutral-500 px-2 py-1 bg-white rounded-full border border-neutral-200">
                                                {s.status}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
