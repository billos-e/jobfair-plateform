/**
 * Company Dashboard
 * Token-based access - Queue management interface
 */
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { companyDashboardAPI } from '../../services/api'
import { wsClient } from '../../services/websocket'
import Card, { CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/Badge'
import { Play, Pause, UserCheck, Clock, Users, Check } from 'lucide-react'

export default function CompanyDashboard() {
    const { token } = useParams()
    const queryClient = useQueryClient()
    const [wsConnected, setWsConnected] = useState(false)

    // Connect WebSocket with company token
    useEffect(() => {
        wsClient.connect(null, token)

        const handleConnection = (data) => {
            setWsConnected(data.status === 'connected')
        }

        const handleQueueUpdate = () => {
            queryClient.invalidateQueries({ queryKey: ['company-dashboard', token] })
        }

        wsClient.on('connection', handleConnection)
        wsClient.on('queue_update', handleQueueUpdate)

        return () => {
            wsClient.off('connection', handleConnection)
            wsClient.off('queue_update', handleQueueUpdate)
            wsClient.disconnect()
        }
    }, [token, queryClient])

    // Fetch dashboard data
    const { data, isLoading, error } = useQuery({
        queryKey: ['company-dashboard', token],
        queryFn: () => companyDashboardAPI.getDashboard(token).then(res => res.data),
        refetchInterval: 30000,
    })

    // Status mutation
    const statusMutation = useMutation({
        mutationFn: (status) => companyDashboardAPI.updateStatus(token, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['company-dashboard', token] })
        },
    })

    // Complete mutation
    const completeMutation = useMutation({
        mutationFn: (queueId) => companyDashboardAPI.completeInterview(token, queueId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['company-dashboard', token] })
        },
    })

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <Card className="text-center max-w-md">
                    <h2 className="text-xl font-semibold text-danger-500 mb-2">Erreur</h2>
                    <p className="text-neutral-600">
                        Lien invalide ou expiré. Veuillez contacter l&apos;organisateur.
                    </p>
                </Card>
            </div>
        )
    }

    const { company, in_interview, waiting, completed, stats } = data

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <header className="bg-white border-b border-neutral-200 px-4 py-4">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900">{company.name}</h1>
                        <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                            <StatusBadge status={company.status} />
                            <span className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-success-500' : 'bg-neutral-400'}`} />
                                {wsConnected ? 'Temps réel actif' : 'Connexion...'}
                            </span>
                        </div>
                    </div>

                    {/* Status controls */}
                    <div className="flex gap-2">
                        {company.status === 'recruiting' ? (
                            <Button
                                variant="ghost"
                                icon={Pause}
                                onClick={() => statusMutation.mutate('paused')}
                                loading={statusMutation.isPending}
                            >
                                Pause
                            </Button>
                        ) : (
                            <Button
                                variant="success"
                                icon={Play}
                                onClick={() => statusMutation.mutate('recruiting')}
                                loading={statusMutation.isPending}
                            >
                                Reprendre
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            {/* Stats */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <Card className="text-center">
                        <div className="text-3xl font-bold text-primary-500">{in_interview?.length || 0}</div>
                        <div className="text-sm text-neutral-500">En entretien</div>
                    </Card>
                    <Card className="text-center">
                        <div className="text-3xl font-bold text-warning-500">{stats?.total_waiting || 0}</div>
                        <div className="text-sm text-neutral-500">En attente</div>
                    </Card>
                    <Card className="text-center">
                        <div className="text-3xl font-bold text-success-500">{stats?.available_now || 0}</div>
                        <div className="text-sm text-neutral-500">Disponibles</div>
                    </Card>
                    <Card className="text-center">
                        <div className="text-3xl font-bold text-neutral-500">{completed?.length || 0}</div>
                        <div className="text-sm text-neutral-500">Passés</div>
                    </Card>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* In interview */}
                    <Card>
                        <CardTitle className="flex items-center gap-2">
                            <UserCheck size={20} className="text-primary-500" />
                            En entretien ({in_interview?.length || 0})
                        </CardTitle>
                        <div className="mt-4 space-y-2">
                            {in_interview?.map((entry) => (
                                <div key={entry.id} className="student-row-interview">
                                    <div className="flex-1">
                                        <p className="font-medium">{entry.student_name}</p>
                                        <p className="text-sm text-neutral-500">Position #{entry.position}</p>
                                    </div>
                                    <Button
                                        variant="success"
                                        size="sm"
                                        icon={Check}
                                        onClick={() => completeMutation.mutate(entry.id)}
                                        loading={completeMutation.isPending}
                                    >
                                        Passé
                                    </Button>
                                </div>
                            ))}
                            {!in_interview?.length && (
                                <p className="text-neutral-400 text-center py-4">Aucun entretien en cours</p>
                            )}
                        </div>
                    </Card>

                    {/* Waiting */}
                    <Card>
                        <CardTitle className="flex items-center gap-2">
                            <Clock size={20} className="text-warning-500" />
                            En attente ({waiting?.length || 0})
                        </CardTitle>
                        <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                            {waiting?.map((entry) => (
                                <div
                                    key={entry.id}
                                    className={entry.is_available ? 'student-row-available' : 'student-row-greyed'}
                                >
                                    <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center text-sm font-medium">
                                        {entry.position}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{entry.student_name}</p>
                                        <p className="text-xs text-neutral-500">
                                            {entry.is_available ? 'Disponible' : entry.student_status}
                                        </p>
                                    </div>
                                    {entry.is_available && (
                                        <div className="status-dot-available" />
                                    )}
                                </div>
                            ))}
                            {!waiting?.length && (
                                <p className="text-neutral-400 text-center py-4">Personne en attente</p>
                            )}
                        </div>
                    </Card>

                    {/* Completed */}
                    <Card>
                        <CardTitle className="flex items-center gap-2">
                            <Users size={20} className="text-neutral-500" />
                            Passés ({completed?.length || 0})
                        </CardTitle>
                        <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                            {completed?.map((entry) => (
                                <div key={entry.id} className="student-row bg-neutral-50">
                                    <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center text-sm font-medium text-neutral-500">
                                        ✓
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-neutral-600">{entry.student_name}</p>
                                    </div>
                                </div>
                            ))}
                            {!completed?.length && (
                                <p className="text-neutral-400 text-center py-4">Aucun étudiant passé</p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
