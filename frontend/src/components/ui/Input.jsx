/**
 * Input Component
 * Design System - Form inputs
 */
import { forwardRef } from 'react'

const Input = forwardRef(({
    label,
    error,
    className = '',
    type = 'text',
    ...props
}, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                type={type}
                className={`${error ? 'input-error' : 'input'} ${className}`}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-danger-500">{error}</p>
            )}
        </div>
    )
})

Input.displayName = 'Input'

export default Input

// Textarea variant
export const Textarea = forwardRef(({
    label,
    error,
    className = '',
    rows = 3,
    ...props
}, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    {label}
                </label>
            )}
            <textarea
                ref={ref}
                rows={rows}
                className={`${error ? 'input-error' : 'input'} resize-none ${className}`}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-danger-500">{error}</p>
            )}
        </div>
    )
})

Textarea.displayName = 'Textarea'
