/**
 * Admin Company Detail Page
 * Edit company info and manage queue
 */
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '../../services/api'
import Card, { CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/Badge'
import { useToast } from '../../contexts/ToastContext'
import { ArrowLeft, Save, RefreshCw, Trash2, Users, Clock, Play, Pause, ChevronUp, ChevronDown, CheckCircle } from 'lucide-react'

export default function AdminCompanyDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { showToast } = useToast()

    const [isEditing, setIsEditing] = useState(false)
    const [editForm, setEditForm] = useState({})

    // Fetch Company Info
    const { data: company, isLoading: isLoadingCompany } = useQuery({
        queryKey: ['admin-company', id],
        queryFn: () => adminAPI.getCompany(id).then(res => res.data),
    })

    // Fetch Queue
    const { data: queue, isLoading: isLoadingQueue } = useQuery({
        queryKey: ['admin-company-queue', id],
        queryFn: () => adminAPI.getCompanyQueue(id).then(res => res.data),
    })

    // Updates
    const updateMutation = useMutation({
        mutationFn: (data) => adminAPI.updateCompany(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-company', id] })
            showToast('Entreprise mise à jour', 'success')
            setIsEditing(false)
        },
        onError: () => showToast('Erreur mise à jour', 'error')
    })

    const tokenMutation = useMutation({
        mutationFn: () => adminAPI.regenerateToken(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-company', id] })
            showToast('Token régénéré', 'success')
        }
    })

    const pauseMutation = useMutation({
        mutationFn: () => adminAPI.pauseCompany(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-company', id] })
            showToast('Entreprise en pause', 'info')
        }
    })

    const resumeMutation = useMutation({
        mutationFn: () => adminAPI.resumeCompany(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-company', id] })
            showToast('Entreprise active', 'success')
        }
    })

    // Queue Actions
    const reorderMutation = useMutation({
        mutationFn: ({ queue_id, new_position }) =>
            adminAPI.reorderQueue(id, { queue_id, new_position }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-company-queue', id] })
            showToast('File réorganisée', 'success')
        }
    })

    if (isLoadingCompany || isLoadingQueue) return <div className="text-center py-8">Chargement...</div>
    if (!company) return <div className="text-center py-8">Entreprise introuvable</div>

    const startEditing = () => {
        setEditForm({
            name: company.name,
            max_concurrent_interviews: company.max_concurrent_interviews,
            max_queue_size: company.max_queue_size
        })
        setIsEditing(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate('/admin/users')}>
                    <ArrowLeft className="mr-2" size={20} /> Retour
                </Button>
                <h1 className="text-2xl font-bold text-neutral-900">{company.name}</h1>
                <StatusBadge status={company.status} />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column: Company Info */}
                <Card className="lg:col-span-1 h-fit">
                    <CardTitle className="mb-4 flex justify-between items-center">
                        Informations
                        {!isEditing && <Button size="sm" variant="ghost" onClick={startEditing}>Modifier</Button>}
                    </CardTitle>

                    {isEditing ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nom</label>
                                <input
                                    className="w-full p-2 border rounded"
                                    value={editForm.name}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Slots Simultanés</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded"
                                    value={editForm.max_concurrent_interviews}
                                    onChange={e => setEditForm({ ...editForm, max_concurrent_interviews: parseInt(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Limite File</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded"
                                    value={editForm.max_queue_size || ''}
                                    placeholder="Illimité"
                                    onChange={e => setEditForm({
                                        ...editForm,
                                        max_queue_size: e.target.value ? parseInt(e.target.value) : null
                                    })}
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button size="sm" onClick={() => updateMutation.mutate(editForm)} icon={Save}>Enregistrer</Button>
                                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Annuler</Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-neutral-500 uppercase font-bold">Slots Occupés</p>
                                <p className="text-lg">{company.current_interview_count} / {company.max_concurrent_interviews}</p>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500 uppercase font-bold">File d'attente</p>
                                <p className="text-lg">
                                    {company.queue_length} {company.max_queue_size ? `/ ${company.max_queue_size}` : '(Illimité)'}
                                </p>
                            </div>
                            <div className="pt-4 border-t border-neutral-100">
                                <p className="text-xs text-neutral-500 uppercase font-bold mb-2">Actions Rapides</p>
                                <div className="flex flex-col gap-2">
                                    {company.status === 'recruiting' ? (
                                        <Button size="sm" variant="outline" icon={Pause} onClick={() => pauseMutation.mutate()}>Mettre en pause</Button>
                                    ) : (
                                        <Button size="sm" variant="success" icon={Play} onClick={() => resumeMutation.mutate()}>Reprendre</Button>
                                    )}
                                    <Button size="sm" variant="outline" icon={RefreshCw} onClick={() => {
                                        if (confirm('Régénérer le token ?')) tokenMutation.mutate()
                                    }}>Régénérer Token</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Right Column: Queue Management */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Active Interviews */}
                    <Card>
                        <CardTitle className="text-primary-600 flex items-center gap-2">
                            <Users size={20} /> En Entretien ({queue?.in_interview.length})
                        </CardTitle>
                        <div className="mt-4">
                            {queue?.in_interview.length === 0 ? <p className="text-neutral-400">Aucun entretien en cours</p> : (
                                <ul className="space-y-2">
                                    {queue.in_interview.map(item => (
                                        <li key={item.student_id} className="p-3 bg-primary-50 rounded flex justify-between items-center">
                                            <span className="font-medium text-primary-900">{item.student_name}</span>
                                            <span className="text-xs bg-white text-primary-600 px-2 py-1 rounded border border-primary-200">En cours</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </Card>

                    {/* Waiting Queue */}
                    <Card>
                        <CardTitle className="text-warning-600 flex items-center gap-2">
                            <Clock size={20} /> File d'Attente ({queue?.waiting.length})
                        </CardTitle>
                        <div className="mt-4">
                            {queue?.waiting.length === 0 ? <p className="text-neutral-400">File vide</p> : (
                                <ul className="space-y-2">
                                    {queue.waiting.map((item, index) => (
                                        <li key={item.queue_id} className="p-3 bg-white border border-neutral-200 rounded flex justify-between items-center group hover:border-warning-300 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className="w-6 h-6 flex items-center justify-center bg-neutral-100 rounded-full font-mono text-sm font-bold text-neutral-600">
                                                    {item.position}
                                                </span>
                                                <div>
                                                    <p className="font-medium text-neutral-900">{item.student_name}</p>
                                                    <p className="text-xs text-neutral-500">Statut: {item.student_status}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => reorderMutation.mutate({ queue_id: item.queue_id, new_position: item.position - 1 })}
                                                    disabled={index === 0}
                                                    className="p-1 hover:bg-neutral-100 rounded disabled:opacity-30"
                                                >
                                                    <ChevronUp size={18} />
                                                </button>
                                                <button
                                                    onClick={() => reorderMutation.mutate({ queue_id: item.queue_id, new_position: item.position + 1 })}
                                                    disabled={index === queue.waiting.length - 1}
                                                    className="p-1 hover:bg-neutral-100 rounded disabled:opacity-30"
                                                >
                                                    <ChevronDown size={18} />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </Card>

                    {/* Completed History (Last 5) */}
                    <Card>
                        <CardTitle className="text-success-600 flex items-center gap-2">
                            <CheckCircle size={20} /> Historique (Terminés)
                        </CardTitle>
                        <div className="mt-4">
                            {queue?.completed.length === 0 ? <p className="text-neutral-400">Aucun historique</p> : (
                                <ul className="space-y-2 opacity-75">
                                    {queue.completed.slice(0, 5).map(item => (
                                        <li key={item.student_id} className="p-2 border-b border-neutral-100 flex justify-between items-center text-sm">
                                            <span className="text-neutral-600">{item.student_name}</span>
                                            <span className="text-xs text-neutral-400">Terminé</span>
                                        </li>
                                    ))}
                                    {queue.completed.length > 5 && (
                                        <p className="text-xs text-center text-neutral-400 pt-2">Et {queue.completed.length - 5} autres...</p>
                                    )}
                                </ul>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
