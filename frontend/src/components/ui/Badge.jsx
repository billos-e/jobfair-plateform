/**
 * Badge Component
 * Design System - Status indicators
 */

const variants = {
    available: 'badge-available',
    interview: 'badge-interview',
    paused: 'badge-paused',
    completed: 'badge-completed',
    recruiting: 'badge-recruiting',
    default: 'badge bg-neutral-100 text-neutral-600',
}

export default function Badge({ children, variant = 'default', className = '' }) {
    return (
        <span className={`${variants[variant]} ${className}`}>
            {children}
        </span>
    )
}

// Status badge with automatic variant detection
export function StatusBadge({ status }) {
    const labels = {
        available: 'Disponible',
        in_interview: 'En entretien',
        paused: 'En pause',
        completed: 'Passé',
        recruiting: 'Recrutement',
    }

    const variantMap = {
        available: 'available',
        in_interview: 'interview',
        paused: 'paused',
        completed: 'completed',
        recruiting: 'recruiting',
    }

    return (
        <Badge variant={variantMap[status] || 'default'}>
            {labels[status] || status}
        </Badge>
    )
}
