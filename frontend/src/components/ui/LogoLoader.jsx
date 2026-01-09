import React from 'react'

export default function LogoLoader({ className = "h-24 w-24" }) {
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
