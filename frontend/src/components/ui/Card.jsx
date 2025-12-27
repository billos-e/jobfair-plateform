/**
 * Card Component
 * Design System - Container component
 */

export default function Card({
    children,
    className = '',
    hover = false,
    padding = 'md',
    ...props
}) {
    const paddingClasses = {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
    }

    return (
        <div
            className={`${hover ? 'card-hover' : 'card'} ${paddingClasses[padding]} ${className}`}
            {...props}
        >
            {children}
        </div>
    )
}

// Card Header subcomponent
export function CardHeader({ children, className = '' }) {
    return (
        <div className={`border-b border-neutral-100 pb-3 mb-4 ${className}`}>
            {children}
        </div>
    )
}

// Card Title subcomponent
export function CardTitle({ children, className = '' }) {
    return (
        <h3 className={`text-lg font-semibold text-neutral-900 ${className}`}>
            {children}
        </h3>
    )
}

// Card Content subcomponent
export function CardContent({ children, className = '' }) {
    return (
        <div className={className}>
            {children}
        </div>
    )
}

// Card Footer subcomponent
export function CardFooter({ children, className = '' }) {
    return (
        <div className={`border-t border-neutral-100 pt-3 mt-4 ${className}`}>
            {children}
        </div>
    )
}
