'use client'

import { useTransition, ReactNode } from 'react'
import { useDelayedPending } from '@/hooks/useDelayedPending'

interface ActionButtonProps {
  children: ReactNode
  action: () => Promise<void>
  loadingDelay?: number
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
}

function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg className={`animate-spin h-4 w-4 ${className}`} viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

const variantStyles = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400',
  ghost: 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
}

export function ActionButton({
  children,
  action,
  loadingDelay = 150,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
}: ActionButtonProps) {
  const [isPending, startTransition] = useTransition()
  const showPending = useDelayedPending(isPending, loadingDelay)

  const handleClick = () => {
    startTransition(async () => {
      await action()
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending || disabled}
      className={`rounded-md font-medium transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {showPending ? <Spinner /> : null}
      {showPending ? 'Loading...' : children}
    </button>
  )
}

export default ActionButton
