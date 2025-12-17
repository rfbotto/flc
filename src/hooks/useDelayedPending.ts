import { useState, useEffect, useRef } from 'react'

export function useDelayedPending(isPending: boolean, delay: number = 150): boolean {
  const [showPending, setShowPending] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isPending) {
      timeoutRef.current = setTimeout(() => {
        setShowPending(true)
      }, delay)
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      setShowPending(false)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isPending, delay])

  return showPending
}

export function useDelayedValue<T>(value: T, delay: number = 150): T {
  const [delayedValue, setDelayedValue] = useState(value)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setDelayedValue(value)
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, delay])

  return delayedValue
}
