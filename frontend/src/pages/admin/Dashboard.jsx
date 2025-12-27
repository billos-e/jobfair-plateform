/**
 * Admin Dashboard
 * Global statistics and activity feed
 */
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '../../services/api'
import { useWebSocket } from '../../contexts/WebSocketContext'
import { useEffect, useState } from 'react'
import Card, { CardTitle } from '../../components/ui/Card'
import { Users, Building2, Clock, Activity, Loader2 } from 'lucide-react'

export default function AdminDashboard() {
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
                    {isConnected ? 'Connecté au live' : 'Déconnecté'}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

            {/* Activity feed */}
            <Card>
                <CardTitle>Activité récente</CardTitle>
                <div className="mt-4 space-y-4">
                    {activityFeed.length === 0 ? (
                        <p className="text-neutral-500 text-center py-4">
                            En attente d&apos;activité...
                        </p>
                    ) : (
                        activityFeed.map((activity) => (
                            <div key={activity.id} className="flex items-center gap-3 text-sm border-b border-neutral-100 pb-2 last:border-0">
                                <span className="text-neutral-400 font-mono text-xs">{activity.timestamp}</span>
                                <span className="text-neutral-700">{activity.message}</span>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    )
}
