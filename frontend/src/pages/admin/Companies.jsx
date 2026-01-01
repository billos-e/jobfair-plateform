/**
 * Admin Companies Management
 * CRUD companies + generate tokens
 */
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '../../services/api'
import { useWebSocket } from '../../contexts/WebSocketContext'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/Badge'
import { useToast } from '../../contexts/ToastContext'
import { RefreshCw, Play, Pause, Trash2, Copy, Check } from 'lucide-react'

export default function AdminCompanies() {
    const queryClient = useQueryClient()
    const { showToast } = useToast()
    const { isConnected } = useWebSocket()

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [newCompany, setNewCompany] = useState({
        name: '',
        max_concurrent_interviews: 1,
        max_queue_size: null
    })

    // Fetch companies
    const { data: companies, isLoading } = useQuery({
        queryKey: ['admin-companies'],
        queryFn: () => adminAPI.listCompanies().then(res => res.data),
    })

    // Listen for updates
    useEffect(() => {
        if (!isConnected) return

        const handleUpdate = () => {
            queryClient.invalidateQueries({ queryKey: ['admin-companies'] })
        }

        import('../../services/websocket').then(({ wsClient }) => {
            wsClient.on('company_status', handleUpdate)
            wsClient.on('queue_update', handleUpdate)
        })

        return () => {
            import('../../services/websocket').then(({ wsClient }) => {
                wsClient.off('company_status', handleUpdate)
                wsClient.off('queue_update', handleUpdate)
            })
        }
    }, [queryClient, isConnected])

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data) => adminAPI.createCompany(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-companies'] })
            showToast('Entreprise créée', 'success')
            setIsCreateModalOpen(false)
            setNewCompany({ name: '', max_concurrent_interviews: 1, max_queue_size: null })
        },
        onError: () => showToast('Erreur lors de la création', 'error')
    })

    const tokenMutation = useMutation({
        mutationFn: (id) => adminAPI.regenerateToken(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['admin-companies'] })
            showToast('Token régénéré', 'success')
            // Copy to clipboard
            navigator.clipboard.writeText(window.location.origin + data.data.access_url)
        },
        onError: () => showToast('Erreur lors de la régénération', 'error')
    })

    const pauseMutation = useMutation({
        mutationFn: (id) => adminAPI.pauseCompany(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-companies'] })
            showToast('Entreprise en pause', 'info')
        }
    })

    const resumeMutation = useMutation({
        mutationFn: (id) => adminAPI.resumeCompany(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-companies'] })
            showToast('Entreprise active', 'success')
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => adminAPI.deleteCompany(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-companies'] })
            showToast('Entreprise supprimée', 'success')
        }
    })

    const copyLink = (token) => {
        const url = `${window.location.origin}/company/${token}`
        navigator.clipboard.writeText(url)
        showToast('Lien copié !', 'success')
    }

    if (isLoading) {
        return <div className="p-8 text-center">Chargement...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-neutral-900">Gestion Entreprises</h1>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    Ajouter une entreprise
                </Button>
            </div>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Nouvelle Entreprise</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nom</label>
                                <input
                                    className="w-full p-2 border rounded"
                                    value={newCompany.name}
                                    onChange={e => setNewCompany({ ...newCompany, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Slots d'entretien simultanés</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full p-2 border rounded"
                                    value={newCompany.max_concurrent_interviews}
                                    onChange={e => setNewCompany({ ...newCompany, max_concurrent_interviews: parseInt(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Limite file d'attente (optionnel)</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full p-2 border rounded"
                                    value={newCompany.max_queue_size || ''}
                                    placeholder="Illimité"
                                    onChange={e => setNewCompany({
                                        ...newCompany,
                                        max_queue_size: e.target.value ? parseInt(e.target.value) : null
                                    })}
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Annuler</Button>
                                <Button onClick={() => createMutation.mutate(newCompany)}>Créer</Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            <div className="grid gap-4">
                {companies?.map((company) => (
                    <Card key={company.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold">{company.name}</h3>
                                <StatusBadge status={company.status} />
                            </div>
                            <p className="text-sm text-neutral-500 mt-1">
                                Slots: {company.current_interview_count} / {company.max_concurrent_interviews} | File: {company.queue_length} pers.
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                                <code className="text-xs bg-neutral-100 px-2 py-1 rounded text-neutral-600">
                                    {company.access_token}
                                </code>
                                <button
                                    onClick={() => copyLink(company.access_token)}
                                    className="text-primary-500 hover:text-primary-600"
                                    title="Copier le lien"
                                >
                                    <Copy size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                icon={RefreshCw}
                                onClick={() => {
                                    if (confirm('Régénérer le token invalidera l\'ancien lien. Continuer ?'))
                                        tokenMutation.mutate(company.id)
                                }}
                                loading={tokenMutation.isPending && tokenMutation.variables === company.id}
                            >
                                Token
                            </Button>

                            {company.status === 'recruiting' ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    icon={Pause}
                                    onClick={() => pauseMutation.mutate(company.id)}
                                >
                                    Pause
                                </Button>
                            ) : (
                                <Button
                                    variant="success"
                                    size="sm"
                                    icon={Play}
                                    onClick={() => resumeMutation.mutate(company.id)}
                                >
                                    Reprendre
                                </Button>
                            )}

                            <Button
                                variant="danger"
                                size="sm"
                                icon={Trash2}
                                onClick={() => {
                                    if (confirm('Supprimer cette entreprise ?')) deleteMutation.mutate(company.id)
                                }}
                            >
                                Supprimer
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
