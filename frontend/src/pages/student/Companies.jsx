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
import { Building2, Users, Clock, Plus, Check } from 'lucide-react'

export default function StudentCompanies() {
    const queryClient = useQueryClient()
    const { showToast } = useToast()

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
    const isInscribed = (companyId) => {
        return queues?.some(q => q.company === companyId && !q.is_completed)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Entreprises</h1>
                <p className="text-neutral-500 mt-1">
                    Découvrez les entreprises qui recrutent et inscrivez-vous
                </p>
            </div>

            {/* Companies grid */}
            {!companies?.length ? (
                <Card className="text-center py-12">
                    <Building2 className="mx-auto text-neutral-400 mb-4" size={48} />
                    <p className="text-neutral-500">Aucune entreprise en recrutement</p>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {companies.map((company) => {
                        const inscribed = isInscribed(company.id)
                        return (
                            <Card key={company.id} hover className="flex flex-col">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                        <Building2 className="text-primary-600" size={24} />
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

                                <div className="mt-auto pt-4 border-t border-neutral-100">
                                    {inscribed ? (
                                        <Button variant="ghost" className="w-full" disabled>
                                            <Check size={18} />
                                            Inscrit
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="primary"
                                            className="w-full"
                                            icon={Plus}
                                            onClick={() => joinMutation.mutate(company.id)}
                                            loading={joinMutation.isPending}
                                        >
                                            S&apos;inscrire
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
