/**
 * Companies Page - Student view
 * List of recruiting companies with join queue option
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { companyAPI, queueAPI } from '../../services/api'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/Badge'
import { useToast } from '../../contexts/ToastContext'
import { useWebSocket } from '../../contexts/WebSocketContext'
import { Building2, Users, Clock, Plus, Check, Zap, MapPin } from 'lucide-react'

export default function StudentCompanies() {
    const queryClient = useQueryClient()
    const { showToast } = useToast()
    const { isConnected } = useWebSocket()

    // Fetch companies
    const { data: companies, isLoading } = useQuery({
        queryKey: ['companies'],
        queryFn: () => companyAPI.list().then(res => res.data),
    })

    // Fetch user's queues to check inscriptions
    const { data: queues } = useQuery({
        queryKey: ['queues'],
        queryFn: () => queueAPI.list().then(res => res.data),
    })

    // Join queue mutation
    const joinMutation = useMutation({
        mutationFn: (companyId) => queueAPI.join(companyId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['queues'] })
            queryClient.invalidateQueries({ queryKey: ['companies'] })
            queryClient.invalidateQueries({ queryKey: ['opportunities'] })
            showToast('Inscription réussie !', 'success')
        },
        onError: (err) => {
            showToast(err.response?.data?.detail || err.response?.data?.company?.[0] || 'Erreur', 'error')
        },
    })

    // Check if already inscribed
    const getQueue = (companyId) => {
        return queues?.find(q => q.company === companyId && !q.is_completed)
    }

    // Check if already passed interview
    const isPassed = (companyId) => {
        return queues?.some(q => q.company === companyId && q.is_completed)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    const registeredCompanies = companies?.filter(c => getQueue(c.id)) || []
    const availableCompanies = companies?.filter(c => !getQueue(c.id) && !isPassed(c.id)) || []
    const passedCompanies = companies?.filter(c => isPassed(c.id)) || []

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Entreprises</h1>
                    <p className="text-neutral-500 mt-1">
                        Découvrez les entreprises qui recrutent et inscrivez-vous
                    </p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${isConnected ? 'bg-success-50 text-success-600 border border-success-100' : 'bg-neutral-50 text-neutral-400 border border-neutral-100'}`}>
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success-500 animate-pulse' : 'bg-neutral-300'}`} />
                    {isConnected ? 'Direct' : 'Déconnecté'}
                </div>
            </div>

            {/* Mes Inscriptions */}
            {registeredCompanies.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-lg font-bold text-primary-900 flex items-center gap-2">
                        <Clock size={20} className="text-primary-500" />
                        Mes Inscriptions ({registeredCompanies.length})
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {registeredCompanies.map(company => {
                            const queue = getQueue(company.id)
                            return (
                                <Card key={company.id} className="border-primary-100 bg-primary-50/30">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                                            <Building2 size={20} />
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-primary-600 font-bold">POSITION</div>
                                            <div className="text-xl font-bold text-primary-900">#{queue.position}</div>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-neutral-900">{company.name}</h3>
                                    <p className="text-sm text-neutral-500 mt-1">
                                        {queue.students_ahead} personne(s) avant vous
                                    </p>
                                    <Button variant="ghost" className="w-full mt-4 bg-white/50" disabled>
                                        <Check size={18} className="mr-2" /> Inscrit
                                    </Button>
                                </Card>
                            )
                        })}
                    </div>
                </section>
            )}

            {/* Entreprises Disponibles */}
            <section className="space-y-4">
                <h2 className="text-lg font-bold text-neutral-800">
                    Entreprises Disponibles ({availableCompanies.length})
                </h2>
                {!availableCompanies.length ? (
                    <Card className="text-center py-8">
                        <p className="text-neutral-500">Aucune nouvelle entreprise disponible</p>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {availableCompanies.map((company) => (
                            <Card key={company.id} hover className="flex flex-col">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
                                        <Building2 className="text-neutral-600" size={24} />
                                    </div>
                                    <StatusBadge status="recruiting" />
                                </div>

                                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                                    {company.name}
                                </h3>

                                <div className="flex items-center gap-4 text-sm text-neutral-500 mb-4">
                                    <span className="flex items-center gap-1">
                                        <Users size={16} />
                                        {company.queue_length} en attente
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={16} />
                                        {company.available_slots} slot(s) dispo
                                    </span>
                                </div>

                                <Button
                                    variant="primary"
                                    className="w-full mt-auto"
                                    icon={Plus}
                                    onClick={() => joinMutation.mutate(company.id)}
                                    loading={joinMutation.isPending}
                                >
                                    S&apos;inscrire
                                </Button>
                            </Card>
                        ))}
                    </div>
                )}
            </section>

            {/* Entreprises Visitées */}
            {passedCompanies.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-lg font-bold text-neutral-500">
                        Entreprises Visitées ({passedCompanies.length})
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {passedCompanies.map(company => (
                            <Card key={company.id} className="opacity-75 grayscale-[0.5]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-success-50 rounded-lg flex items-center justify-center text-success-600">
                                        <Check size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-neutral-700">{company.name}</h3>
                                        <p className="text-xs text-success-600 uppercase font-bold mt-0.5">Entretien terminé</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}
