'use client'

import { useState, useDeferredValue, useEffect, useRef, ReactNode } from 'react'
import { useDelayedPending } from '@/hooks/useDelayedPending'

interface SearchInputProps {
  value?: string
  onChange?: (value: string) => void
  action?: (value: string) => void
  placeholder?: string
  loadingDelay?: number
  className?: string
  showLoadingIndicator?: boolean
}

export function SearchInput({
  value: controlledValue,
  onChange,
  action,
  placeholder = 'Search...',
  loadingDelay = 1500,
  className = '',
  showLoadingIndicator = true,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(controlledValue ?? '')
  const value = controlledValue ?? internalValue
  const deferredValue = useDeferredValue(value)
  const isPending = value !== deferredValue
  const showPending = useDelayedPending(isPending, loadingDelay)
  const prevDeferredValue = useRef(deferredValue)

  useEffect(() => {
    if (deferredValue !== prevDeferredValue.current) {
      prevDeferredValue.current = deferredValue
      action?.(deferredValue)
    }
  }, [deferredValue, action])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (controlledValue === undefined) {
      setInternalValue(newValue)
    }
    onChange?.(newValue)
  }

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {showLoadingIndicator && showPending && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <svg className="animate-spin h-4 w-4 text-gray-400" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}
    </div>
  )
}

interface DeferredSearchContentProps<T> {
  searchValue: string
  children: (deferredValue: string, isPending: boolean) => ReactNode
}

export function DeferredSearchContent<T>({
  searchValue,
  children,
}: DeferredSearchContentProps<T>) {
  const deferredValue = useDeferredValue(searchValue)
  const isPending = searchValue !== deferredValue

  return <>{children(deferredValue, isPending)}</>
}

export default SearchInput
