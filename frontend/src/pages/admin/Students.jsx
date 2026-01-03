/**
 * Admin Students Management
 * List, filter and edit students
 */
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '../../services/api'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { StatusBadge } from '../../components/ui/Badge'
import { useToast } from '../../contexts/ToastContext'
import { useWebSocket } from '../../contexts/WebSocketContext'
import { Search, Trash2, Edit2, Check, X } from 'lucide-react'

export default function AdminStudents() {
    const queryClient = useQueryClient()
    const { showToast } = useToast()
    const [search, setSearch] = useState('')
    const [editingId, setEditingId] = useState(null)

    // Fetch students
    const { data: students, isLoading } = useQuery({
        queryKey: ['admin-students'],
        queryFn: () => adminAPI.listStudents().then(res => res.data),
    })

    // Listen to WebSocket events
    const { isConnected } = useWebSocket()
    useEffect(() => {
        if (!isConnected) return

        const handleUpdate = () => {
            queryClient.invalidateQueries({ queryKey: ['admin-students'] })
        }

        import('../../services/websocket').then(({ wsClient }) => {
            wsClient.on('status_change', handleUpdate)
            wsClient.on('queue_update', handleUpdate)
        })

        return () => {
            import('../../services/websocket').then(({ wsClient }) => {
                wsClient.off('status_change', handleUpdate)
                wsClient.off('queue_update', handleUpdate)
            })
        }
    }, [queryClient, isConnected])

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => adminAPI.deleteStudent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-students'] })
            showToast('Étudiant supprimé', 'success')
        },
        onError: () => showToast('Erreur suppression', 'error')
    })

    // Update status mutation (simple toggle available/paused for now)
    const statusMutation = useMutation({
        mutationFn: ({ id, status }) => adminAPI.updateStudent(id, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-students'] })
            // showToast('Statut mis à jour', 'success')
            setEditingId(null)
        },
        onError: () => showToast('Erreur mise à jour', 'error')
    })

    const filteredStudents = students?.filter(s =>
        s.first_name.toLowerCase().includes(search.toLowerCase()) ||
        s.last_name.toLowerCase().includes(search.toLowerCase())
    )

    if (isLoading) {
        return <div className="p-8 text-center">Chargement...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-neutral-900">Gestion Étudiants</h1>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                    <Input
                        placeholder="Rechercher..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <Card padding="none" className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="px-6 py-4 font-medium text-neutral-500">Nom</th>
                                <th className="px-6 py-4 font-medium text-neutral-500">Email</th>
                                <th className="px-6 py-4 font-medium text-neutral-500">Statut</th>
                                <th className="px-6 py-4 font-medium text-neutral-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {filteredStudents?.map((student) => (
                                <tr key={student.id} className="hover:bg-neutral-50">
                                    <td className="px-6 py-4 font-medium">
                                        {student.first_name} {student.last_name}
                                    </td>
                                    <td className="px-6 py-4 text-neutral-500">
                                        {student.user?.email}
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingId === student.id ? (
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="success" onClick={() => statusMutation.mutate({ id: student.id, status: 'available' })}>Dispo</Button>
                                                <Button size="sm" variant="ghost" onClick={() => statusMutation.mutate({ id: student.id, status: 'paused' })}>Pause</Button>
                                                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}><X size={14} /></Button>
                                            </div>
                                        ) : (
                                            <StatusBadge status={student.status} />
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setEditingId(student.id)}
                                            >
                                                <Edit2 size={16} />
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => {
                                                    if (confirm('Supprimer cet étudiant ?')) deleteMutation.mutate(student.id)
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredStudents?.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-neutral-500">
                                        Aucun étudiant trouvé
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
