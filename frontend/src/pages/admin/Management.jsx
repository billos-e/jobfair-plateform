/**
 * Admin Management Page
 * Matrix view of companies and their queues
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '../../services/api'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/Badge'
import { useToast } from '../../contexts/ToastContext'
import { ChevronDown, ChevronUp, Play, Pause, Users, Clock, Loader2, AlertCircle, Copy, Link as LinkIcon, ExternalLink, Zap } from 'lucide-react'
import { useWebSocket } from '../../contexts/WebSocketContext'

export default function AdminManagement() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { showToast } = useToast()
    const { isConnected } = useWebSocket()
    const [expandedCompany, setExpandedCompany] = useState(null)

    // Fetch companies list
    const { data: companies, isLoading } = useQuery({
        queryKey: ['admin-companies'],
        queryFn: () => adminAPI.listCompanies().then(res => res.data),
    })

    // Actions
    const pauseMutation = useMutation({
        mutationFn: (id) => adminAPI.pauseCompany(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-companies'] })
    })

    const resumeMutation = useMutation({
        mutationFn: (id) => adminAPI.resumeCompany(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-companies'] })
    })

    const toggleExpand = (id) => {
        setExpandedCompany(expandedCompany === id ? null : id)
    }

    const copyDashboardLink = (e, token) => {
        e.stopPropagation()
        const url = `${window.location.origin}/company/${token}`
        navigator.clipboard.writeText(url)
        showToast('Lien copié !', 'success')
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-primary-500" size={32} />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Gestion Live</h1>
                    <p className="text-neutral-500 mt-1">Pilotage des files d&apos;attente et statuts</p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-neutral-200 bg-white shadow-sm ml-auto sm:ml-0">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success-500 animate-pulse' : 'bg-neutral-300'}`} />
                        {isConnected ? (
                            <span className="text-success-600">Live</span>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-neutral-400">Hors-ligne</span>
                                <button
                                    onClick={() => import('../../services/websocket').then(m => m.wsClient.reconnect())}
                                    className="text-primary-600 hover:underline font-bold"
                                >
                                    Relancer
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-neutral-700 w-8"></th>
                                <th className="px-6 py-4 text-sm font-semibold text-neutral-700">Entreprise</th>
                                <th className="px-6 py-4 text-sm font-semibold text-neutral-700">Statut</th>
                                <th className="px-6 py-4 text-sm font-semibold text-neutral-700 text-center">En cours</th>
                                <th className="px-6 py-4 text-sm font-semibold text-neutral-700 text-center">Slots Dispo</th>
                                <th className="px-6 py-4 text-sm font-semibold text-neutral-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {companies?.map(company => (
                                <>
                                    <tr key={company.id} className="hover:bg-neutral-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleExpand(company.id)}
                                                className="text-neutral-400 hover:text-primary-600"
                                            >
                                                {expandedCompany === company.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-neutral-900">
                                            <span
                                                className="cursor-pointer hover:text-primary-600 hover:underline"
                                                onClick={() => navigate(`/admin/companies/${company.id}`)}
                                            >
                                                {company.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 group/status">
                                                <StatusBadge status={company.status} />
                                                {company.status === 'recruiting' ? (
                                                    <button
                                                        onClick={() => pauseMutation.mutate(company.id)}
                                                        className="p-1 text-neutral-400 hover:text-warning-600 hover:bg-warning-50 rounded transition-all opacity-0 group-hover:opacity-100"
                                                        title="Mettre en pause"
                                                    >
                                                        <Pause size={14} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => resumeMutation.mutate(company.id)}
                                                        className="p-1 text-neutral-400 hover:text-success-600 hover:bg-success-50 rounded transition-all opacity-0 group-hover:opacity-100"
                                                        title="Reprendre"
                                                    >
                                                        <Play size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center gap-1 font-medium text-primary-600">
                                                <Users size={16} />
                                                {company.current_interview_count}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center gap-1 font-medium text-success-600">
                                                {Math.max(0, company.max_concurrent_interviews - company.current_interview_count)}
                                            </span>
                                            <span className="text-xs text-neutral-400 ml-1">
                                                / {company.max_concurrent_interviews}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    icon={Copy}
                                                    onClick={(e) => copyDashboardLink(e, company.access_token)}
                                                    title="Copier le lien dashboard"
                                                />
                                                <Button variant="outline" size="sm" onClick={() => window.open(company.access_url, '_blank')}>
                                                    <ExternalLink size={14} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                    {/* Expanded Row Details */}
                                    {expandedCompany === company.id && (
                                        <tr className="bg-neutral-50/50">
                                            <td colSpan="6" className="px-6 py-4">
                                                <CompanyQueueDetails companyId={company.id} />
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}

// Subcomponent for fetching and displaying detailed queue
function CompanyQueueDetails({ companyId }) {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { showToast } = useToast()

    const { data, isLoading, error } = useQuery({
        queryKey: ['admin-company-queue', companyId],
        queryFn: () => adminAPI.getCompanyQueue(companyId).then(res => res.data),
    })

    const updateStatusMutation = useMutation({
        mutationFn: ({ studentId, status }) => adminAPI.updateStudent(studentId, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-company-queue', companyId] })
            showToast('Statut étudiant mis à jour', 'success')
        }
    })

    if (isLoading) return <div className="text-center py-4"><Loader2 className="animate-spin inline mr-2" /> Chargement...</div>
    if (error) return <div className="text-danger-500 py-4"><AlertCircle className="inline mr-2" /> Erreur chargement</div>

    const { in_interview, waiting } = data

    return (
        <div className="grid md:grid-cols-2 gap-4 pl-8">
            <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
                <h4 className="text-xs font-bold uppercase text-neutral-500 mb-3 flex items-center gap-2">
                    <Users size={14} /> En Entretien ({in_interview.length})
                </h4>
                {in_interview.length === 0 ? <p className="text-sm text-neutral-400">Aucun entretien</p> : (
                    <ul className="space-y-2">
                        {in_interview.map(student => (
                            <li key={student.student_id} className="text-sm flex justify-between items-center bg-primary-50 p-2 rounded">
                                <span
                                    className="font-medium cursor-pointer hover:text-primary-700 hover:underline"
                                    onClick={() => navigate(`/admin/students/${student.student_id}`)}
                                >
                                    {student.student_name}
                                </span>
                                <span className="text-xs bg-white px-2 py-0.5 rounded text-primary-700 border border-primary-200">En cours</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
                <h4 className="text-xs font-bold uppercase text-neutral-500 mb-3 flex items-center gap-2">
                    <Clock size={14} /> File d&apos;attente ({waiting.length})
                </h4>
                {waiting.length === 0 ? <p className="text-sm text-neutral-400">File vide</p> : (
                    <ul className="space-y-2">
                        {waiting.map(student => (
                            <li key={student.student_id} className="text-sm flex justify-between items-center group hover:bg-neutral-50 p-2 rounded transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="w-5 h-5 flex items-center justify-center bg-neutral-100 rounded-full text-xs font-mono text-neutral-500">
                                        {student.position}
                                    </span>
                                    <span
                                        className="cursor-pointer hover:text-primary-600 hover:underline"
                                        onClick={() => navigate(`/admin/students/${student.student_id}`)}
                                    >
                                        {student.student_name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-0.5 rounded border ${student.student_status === 'available' ? 'bg-success-50 text-success-700 border-success-200' : 'bg-neutral-100 text-neutral-500 border-neutral-200'}`}>
                                        {student.student_status}
                                    </span>
                                    {/* Action to toggle status */}
                                    <button
                                        className="text-neutral-300 hover:text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Changer statut"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            const newStatus = student.student_status === 'available' ? 'paused' : 'available'
                                            updateStatusMutation.mutate({ studentId: student.student_id, status: newStatus })
                                        }}
                                    >
                                        <Copy size={12} className="rotate-90" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
