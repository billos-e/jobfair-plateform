/**
 * Student Dashboard
 * Main view for students - opportunities, inscriptions, status
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentAPI, queueAPI } from '../../services/api'
import Card, { CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/Badge'
import { useToast } from '../../contexts/ToastContext'
import { Play, Pause, Clock, Building2, ChevronRight, Zap } from 'lucide-react'
import { useWebSocket } from '../../contexts/WebSocketContext'

export default function StudentDashboard() {
    const queryClient = useQueryClient()
    const { showToast } = useToast()
    const { isConnected } = useWebSocket()

    // Fetch student profile
    const { data: profile, isLoading: profileLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: () => studentAPI.getProfile().then(res => res.data),
    })

    // Fetch opportunities
    const { data: opportunities, isLoading: opportunitiesLoading } = useQuery({
        queryKey: ['opportunities'],
        queryFn: () => queueAPI.getOpportunities().then(res => res.data),
    })

    // Fetch queue entries
    const { data: queues } = useQuery({
        queryKey: ['queues'],
        queryFn: () => queueAPI.list().then(res => res.data),
    })

    // Status mutation
    const statusMutation = useMutation({
        mutationFn: (status) => studentAPI.updateStatus(status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] })
            queryClient.invalidateQueries({ queryKey: ['opportunities'] })
            // showToast('Statut mis à jour', 'success')
        },
        onError: (err) => {
            showToast(err.response?.data?.detail || 'Erreur', 'error')
        },
    })

    // Start interview mutation
    const startMutation = useMutation({
        mutationFn: (queueId) => queueAPI.startInterview(queueId),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['profile'] })
            queryClient.invalidateQueries({ queryKey: ['opportunities'] })
            queryClient.invalidateQueries({ queryKey: ['queues'] })
            showToast(res.data.message, 'success')
        },
        onError: (err) => {
            showToast(err.response?.data?.detail || 'Erreur', 'error')
        },
    })

    if (profileLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    const canStartOpportunities = opportunities?.opportunities?.filter(o => o.can_start) || []

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900">
                            Bonjour, {profile?.first_name} 👋
                        </h1>
                        <p className="text-neutral-500 mt-1">
                            Gérez vos entretiens et inscriptions
                        </p>
                    </div>
                    <div className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${isConnected ? 'bg-success-50 text-success-600 border border-success-100' : 'bg-neutral-50 text-neutral-400 border border-neutral-100'}`}>
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success-500 animate-pulse' : 'bg-neutral-300'}`} />
                        {isConnected ? 'Temps Réel' : 'Déconnecté'}
                    </div>
                </div>

                {/* Status control */}
                <Card className="flex items-center gap-4" padding="sm">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-neutral-600">Statut:</span>
                        <StatusBadge status={profile?.status} />
                    </div>
                    {profile?.status === 'paused' && (
                        <Button
                            variant="success"
                            size="sm"
                            icon={Play}
                            onClick={() => statusMutation.mutate('available')}
                            loading={statusMutation.isPending}
                        >
                            Disponible
                        </Button>
                    )}
                    {profile?.status === 'available' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            icon={Pause}
                            onClick={() => statusMutation.mutate('paused')}
                            loading={statusMutation.isPending}
                        >
                            Pause
                        </Button>
                    )}
                </Card>
            </div>

            {/* Urgent opportunities */}
            {canStartOpportunities.length > 0 && (
                <div className="notification-urgent">
                    <h2 className="text-xl font-bold mb-2">🎯 Tu peux passer maintenant !</h2>
                    {canStartOpportunities.map((opp) => (
                        <div key={opp.queue_id} className="flex items-center justify-between gap-4 mt-4">
                            <span className="font-medium">{opp.company_name}</span>
                            <Button
                                variant="success"
                                size="sm"
                                onClick={() => startMutation.mutate(opp.queue_id)}
                                loading={startMutation.isPending}
                            >
                                Commencer
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {/* In interview */}
            {profile?.status === 'in_interview' && profile?.current_company_name && (
                <Card className="bg-primary-50 border border-primary-200">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                            <Building2 className="text-primary-600" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-primary-600">En entretien chez</p>
                            <p className="text-lg font-semibold text-primary-900">
                                {profile.current_company_name}
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Queue entries */}
            <Card>
                <CardTitle className="flex items-center gap-2">
                    <Clock size={20} />
                    Mes inscriptions
                </CardTitle>

                {!queues?.length ? (
                    <p className="text-neutral-500 text-center py-8">
                        Aucune inscription. Explorez les entreprises pour vous inscrire !
                    </p>
                ) : (
                    <div className="mt-4 space-y-2">
                        {queues.map((queue) => (
                            <div
                                key={queue.id}
                                className={`flex items-center justify-between p-3 rounded-lg border
                          ${queue.is_completed
                                        ? 'bg-neutral-50 border-neutral-200'
                                        : 'bg-white border-neutral-200 hover:border-primary-300'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                                ${queue.is_completed
                                            ? 'bg-neutral-200 text-neutral-500'
                                            : 'bg-primary-100 text-primary-600'}`}>
                                        {queue.position}
                                    </div>
                                    <div>
                                        <p className="font-medium text-neutral-900">{queue.company_name}</p>
                                        <p className="text-sm text-neutral-500">
                                            {queue.is_completed
                                                ? 'Terminé'
                                                : `${queue.students_ahead} personne(s) avant toi`}
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight className="text-neutral-400" size={20} />
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    )
}
