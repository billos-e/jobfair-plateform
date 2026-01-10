/**
 * Admin Student Detail Page
 * Edit student info and manage inscriptions
 */
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '../../services/api'
import Card, { CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/Badge'
import { useToast } from '../../contexts/ToastContext'
import LogoLoader from '../../components/ui/LogoLoader'
import { ArrowLeft, User, Mail, Trash2, Save, X, Hash, Play, Pause, ChevronUp, ChevronDown } from 'lucide-react'

export default function AdminStudentDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { showToast } = useToast()


    // Fetch Student Info
    const { data: student, isLoading } = useQuery({
        queryKey: ['admin-student', id],
        queryFn: () => adminAPI.getStudent(id).then(res => res.data),
    })

    // Mutations
    const updateStatusMutation = useMutation({
        mutationFn: (status) => adminAPI.updateStudent(id, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-student', id] })
            // showToast('Statut mis à jour', 'success')
        },
        onError: () => showToast('Erreur mise à jour', 'error')
    })

    const deleteQueueMutation = useMutation({
        mutationFn: (queueId) => adminAPI.deleteQueueEntry(queueId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-student', id] })
            showToast('Inscription annulée', 'success')
        },
        onError: () => showToast('Erreur annulation', 'error')
    })

    const deleteStudentMutation = useMutation({
        mutationFn: () => adminAPI.deleteStudent(id),
        onSuccess: () => {
            showToast('Étudiant supprimé', 'success')
            navigate('/admin/users')
        },
        onError: () => showToast('Erreur lors de la suppression', 'error')
    })

    // Mutation to change position directly from here
    const reorderMutation = useMutation({
        mutationFn: ({ companyId, queueId, position }) =>
            adminAPI.reorderQueue(companyId, { queue_id: queueId, new_position: parseInt(position) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-student', id] })
            showToast('Position mise à jour', 'success')
        },
        onError: () => showToast('Erreur position', 'error')
    })

    if (isLoading) return <div className="text-center py-12"><LogoLoader /></div>
    if (!student) return <div className="text-center py-8">Étudiant introuvable</div>

    // Helper to change position locally before saving (optional, but let's do direct prompt or input)
    const handlePositionChange = (entry, newPos) => {
        if (!newPos || isNaN(newPos) || newPos < 1) return
        reorderMutation.mutate({
            companyId: entry.company_id,
            queueId: entry.id,
            position: newPos
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/admin/users')}>
                        <ArrowLeft className="mr-2" size={20} /> Retour
                    </Button>
                    <h1 className="text-2xl font-bold text-neutral-900">{student.first_name} {student.last_name}</h1>
                    <StatusBadge status={student.status} />
                </div>
                <Button
                    variant="danger"
                    icon={Trash2}
                    loading={deleteStudentMutation.isPending}
                    onClick={() => {
                        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ? Cette action est irréversible.')) {
                            deleteStudentMutation.mutate()
                        }
                    }}
                >
                    Supprimer
                </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column: Profile */}
                <Card className="lg:col-span-1 h-fit">
                    <CardTitle className="mb-4">Profil</CardTitle>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-neutral-600">
                            <Mail size={18} />
                            <span>{student.email}</span>
                        </div>

                        <div className="pt-4 border-t border-neutral-100">
                            <p className="text-xs text-neutral-500 uppercase font-bold mb-2">Statut</p>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <StatusBadge status={student.status} />
                                    {student.status === 'available' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            icon={Pause}
                                            onClick={() => updateStatusMutation.mutate('paused')}
                                            loading={updateStatusMutation.isPending}
                                        >
                                            Mettre en pause
                                        </Button>
                                    )}
                                    {student.status === 'paused' && (
                                        <Button
                                            size="sm"
                                            variant="success"
                                            icon={Play}
                                            onClick={() => updateStatusMutation.mutate('available')}
                                            loading={updateStatusMutation.isPending}
                                        >
                                            Passer Disponible
                                        </Button>
                                    )}
                                </div>
                                {student.status === 'in_interview' && (
                                    <p className="text-xs text-primary-600">
                                        En entretien chez <strong>{student.current_company_name}</strong>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Right Column: Inscriptions */}
                <Card className="lg:col-span-2">
                    <CardTitle className="mb-4 flex items-center justify-between">
                        <span>Inscriptions & Historique</span>
                        <span className="text-sm font-normal text-neutral-500">
                            {student.queue_entries?.length} entrée(s)
                        </span>
                    </CardTitle>

                    {student.queue_entries?.length === 0 ? (
                        <p className="text-neutral-400 py-4 text-center">Aucune inscription</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-neutral-50 border-b border-neutral-200">
                                    <tr>
                                        <th className="px-4 py-3 text-sm font-medium text-neutral-500">Entreprise</th>
                                        <th className="px-4 py-3 text-sm font-medium text-neutral-500">État</th>
                                        <th className="px-4 py-3 text-sm font-medium text-neutral-500">Position</th>
                                        <th className="px-4 py-3 text-sm font-medium text-neutral-500 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {student.queue_entries?.map((entry) => (
                                        <tr key={entry.id} className="hover:bg-neutral-50">
                                            <td className="px-4 py-3 font-medium text-neutral-900">
                                                <span
                                                    className="cursor-pointer hover:text-primary-600 hover:underline"
                                                    onClick={() => navigate(`/admin/companies/${entry.company_id}`)}
                                                >
                                                    {entry.company_name}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {entry.status === 'completed' && <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded">Passé</span>}
                                                {entry.status === 'in_interview' && <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">En cours</span>}
                                                {entry.status === 'waiting' && <span className="text-xs bg-warning-100 text-warning-700 px-2 py-1 rounded">En attente</span>}
                                            </td>
                                            <td className="px-4 py-3">
                                                {entry.status === 'waiting' ? (
                                                    <div className="flex items-center gap-2">
                                                        <Hash size={14} className="text-neutral-400" />
                                                        <input
                                                            key={`${entry.id}-${entry.position}`}
                                                            type="number"
                                                            className="w-12 p-1 text-sm border rounded text-center"
                                                            defaultValue={entry.position}
                                                            onBlur={(e) => {
                                                                if (parseInt(e.target.value) !== entry.position) {
                                                                    handlePositionChange(entry, e.target.value)
                                                                }
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handlePositionChange(entry, e.currentTarget.value)
                                                            }}
                                                        />
                                                        <div className="flex flex-col -gap-1">
                                                            <button
                                                                onClick={() => handlePositionChange(entry, entry.position - 1)}
                                                                disabled={entry.position <= 1}
                                                                className="text-neutral-400 hover:text-primary-600 disabled:opacity-30"
                                                            >
                                                                <ChevronUp size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handlePositionChange(entry, entry.position + 1)}
                                                                className="text-neutral-400 hover:text-primary-600"
                                                            >
                                                                <ChevronDown size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-neutral-400 text-sm">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {entry.status === 'waiting' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-danger-500 hover:bg-danger-50"
                                                        onClick={() => {
                                                            if (confirm(`Désinscrire ${student.first_name} de ${entry.company_name} ?`)) {
                                                                deleteQueueMutation.mutate(entry.id)
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}
