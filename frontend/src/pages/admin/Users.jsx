/**
 * Admin Users Management
 * Unified view for handling Students and Companies CRUD
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '../../services/api'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { StatusBadge } from '../../components/ui/Badge'
import { useToast } from '../../contexts/ToastContext'
import { Search, Trash2, Plus, Users, Building2, ChevronRight, Copy, RefreshCw, Play, Pause } from 'lucide-react'

export default function AdminUsers() {
    const [activeTab, setActiveTab] = useState('students') // 'students' | 'companies'

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Utilisateurs</h1>
                    <p className="text-neutral-500 mt-1">Gestion des comptes et accès</p>
                </div>
                <div className="flex bg-neutral-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('students')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'students'
                            ? 'bg-white text-neutral-900 shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-900'
                            }`}
                    >
                        Étudiants
                    </button>
                    <button
                        onClick={() => setActiveTab('companies')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'companies'
                            ? 'bg-white text-neutral-900 shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-900'
                            }`}
                    >
                        Entreprises
                    </button>
                </div>
            </div>

            {activeTab === 'students' ? <StudentsList /> : <CompaniesList />}
        </div>
    )
}

function StudentsList() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { showToast } = useToast()
    const [search, setSearch] = useState('')

    const { data: students, isLoading } = useQuery({
        queryKey: ['admin-students'],
        queryFn: () => adminAPI.listStudents().then(res => res.data),
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => adminAPI.deleteStudent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-students'] })
            showToast('Étudiant supprimé', 'success')
        }
    })

    const filteredStudents = students?.filter(s =>
        s.first_name.toLowerCase().includes(search.toLowerCase()) ||
        s.last_name.toLowerCase().includes(search.toLowerCase())
    )

    if (isLoading) return <div className="text-center py-8">Chargement...</div>

    return (
        <div className="space-y-4">
            <div className="flex justify-between">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                    <Input
                        placeholder="Rechercher un étudiant..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <Card padding="none" className="overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                        <tr>
                            <th className="px-6 py-4 font-medium text-neutral-500">Nom</th>
                            <th className="px-6 py-4 font-medium text-neutral-500">Email</th>
                            <th className="px-6 py-4 font-medium text-neutral-500">Statut</th>
                            <th className="px-6 py-4 font-medium text-neutral-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {filteredStudents?.map((student) => (
                            <tr
                                key={student.id}
                                className="hover:bg-neutral-50 cursor-pointer group"
                                onClick={() => navigate(`/admin/students/${student.id}`)}
                            >
                                <td className="px-6 py-4 font-medium text-neutral-900 group-hover:text-primary-600 transition-colors">
                                    {student.first_name} {student.last_name}
                                </td>
                                <td className="px-6 py-4 text-neutral-500">
                                    {student.email}
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={student.status} />
                                </td>
                                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-danger-500 hover:text-danger-700 hover:bg-danger-50"
                                        onClick={() => {
                                            if (confirm('Supprimer cet étudiant ?')) deleteMutation.mutate(student.id)
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                    <ChevronRight size={16} className="inline-block ml-2 text-neutral-300" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    )
}

function CompaniesList() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { showToast } = useToast()
    const [search, setSearch] = useState('')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [newCompany, setNewCompany] = useState({ name: '', max_concurrent_interviews: 1, max_queue_size: null })

    const { data: companies, isLoading } = useQuery({
        queryKey: ['admin-companies'],
        queryFn: () => adminAPI.listCompanies().then(res => res.data),
    })

    const createMutation = useMutation({
        mutationFn: (data) => adminAPI.createCompany(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-companies'] })
            showToast('Entreprise créée', 'success')
            setIsCreateModalOpen(false)
            setNewCompany({ name: '', max_concurrent_interviews: 1, max_queue_size: null })
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => adminAPI.deleteCompany(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-companies'] })
            showToast('Entreprise supprimée', 'success')
        }
    })

    const filteredCompanies = companies?.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    )

    if (isLoading) return <div className="text-center py-8">Chargement...</div>

    return (
        <div className="space-y-4">
            <div className="flex justify-between">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                    <Input
                        placeholder="Rechercher une entreprise..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} icon={Plus}>Ajouter</Button>
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
                                <label className="block text-sm font-medium mb-1">Slots</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full p-2 border rounded"
                                    value={newCompany.max_concurrent_interviews}
                                    onChange={e => setNewCompany({ ...newCompany, max_concurrent_interviews: parseInt(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">File max (Optionnel)</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full p-2 border rounded"
                                    value={newCompany.max_queue_size || ''}
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

            <Card padding="none" className="overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                        <tr>
                            <th className="px-6 py-4 font-medium text-neutral-500">Nom</th>
                            <th className="px-6 py-4 font-medium text-neutral-500">Statut</th>
                            <th className="px-6 py-4 font-medium text-neutral-500 text-center">Interactions</th>
                            <th className="px-6 py-4 font-medium text-neutral-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {filteredCompanies?.map((company) => (
                            <tr
                                key={company.id}
                                className="hover:bg-neutral-50 cursor-pointer group"
                                onClick={() => navigate(`/admin/companies/${company.id}`)}
                            >
                                <td className="px-6 py-4 font-medium text-neutral-900 group-hover:text-primary-600 transition-colors">
                                    {company.name}
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={company.status} />
                                </td>
                                <td className="px-6 py-4 text-center text-sm text-neutral-500">
                                    {company.current_interview_count} actifs / {company.queue_length} file
                                </td>
                                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-danger-500 hover:text-danger-700 hover:bg-danger-50"
                                        onClick={() => {
                                            if (confirm('Supprimer cette entreprise ?')) deleteMutation.mutate(company.id)
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                    <ChevronRight size={16} className="inline-block ml-2 text-neutral-300" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    )
}
