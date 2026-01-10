import React from 'react'

export default function LogoLoader({ className = "h-32 w-32" }) {
    return (
        <div className="flex items-center justify-center">
            <img
                src="/logo.png"
                alt="Loading..."
                className={`animate-pulse ${className} object-contain`}
            />
        </div>
    )
}
