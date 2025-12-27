/**
 * Button Component
 * Design System - P2 Section 2
 */
import { forwardRef } from 'react'

const variants = {
    primary: 'btn-primary',
    success: 'btn-success',
    danger: 'btn-danger',
    ghost: 'btn-ghost',
    outline: 'btn-outline',
}

const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
}

const Button = forwardRef(({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    loading = false,
    icon: Icon,
    ...props
}, ref) => {
    return (
        <button
            ref={ref}
            className={`${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            ) : Icon ? (
                <Icon className="h-5 w-5" />
            ) : null}
            {children}
        </button>
    )
})

Button.displayName = 'Button'

export default Button
