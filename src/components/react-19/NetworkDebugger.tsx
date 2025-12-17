'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface EndpointConfig {
  name: string
  path: string
  delay: number
}

interface ActiveRequest {
  id: string
  endpoint: string
  startTime: number
  duration: number
}

const STORAGE_KEY = 'network-debugger-delays'

const defaultEndpoints: EndpointConfig[] = [
  { name: 'Tasks', path: '/api/tasks', delay: 500 },
  { name: 'Login', path: '/api/auth/login', delay: 800 },
  { name: 'User Data', path: '/api/user', delay: 600 },
]

export function useNetworkDelay(endpoint: string): number {
  const [delay, setDelay] = useState(500)

  useEffect(() => {
    const handleDelayChange = (e: CustomEvent<{ endpoint: string; delay: number }>) => {
      if (e.detail.endpoint === endpoint) {
        setDelay(e.detail.delay)
      }
    }

    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const delays = JSON.parse(stored)
        if (delays[endpoint] !== undefined) {
          setDelay(delays[endpoint])
        }
      } catch {}
    }

    window.addEventListener('network-delay-change' as keyof WindowEventMap, handleDelayChange as EventListener)
    return () => window.removeEventListener('network-delay-change' as keyof WindowEventMap, handleDelayChange as EventListener)
  }, [endpoint])

  return delay
}

export function simulateNetworkRequest(endpoint: string, delay: number): Promise<void> {
  const requestId = `${endpoint}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

  window.dispatchEvent(new CustomEvent('network-request-start', {
    detail: { id: requestId, endpoint, delay }
  }))

  return new Promise(resolve => {
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('network-request-end', {
        detail: { id: requestId, endpoint }
      }))
      resolve()
    }, delay)
  })
}

function ProgressBar({ request }: { request: ActiveRequest }) {
  const [progress, setProgress] = useState(0)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    const startTime = request.startTime
    const duration = request.duration

    const animate = () => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min((elapsed / duration) * 100, 100)
      setProgress(newProgress)

      if (newProgress < 100) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [request.startTime, request.duration])

  return (
    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
      <div
        className="h-full bg-green-500 transition-none"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

export function NetworkDebugger() {
  const [isOpen, setIsOpen] = useState(false)
  const [endpoints, setEndpoints] = useState<EndpointConfig[]>(defaultEndpoints)
  const [activeRequests, setActiveRequests] = useState<Map<string, ActiveRequest>>(new Map())

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const delays = JSON.parse(stored)
        setEndpoints(prev => prev.map(ep => ({
          ...ep,
          delay: delays[ep.path] ?? ep.delay
        })))
      } catch {}
    }
  }, [])

  const updateDelay = useCallback((path: string, delay: number) => {
    setEndpoints(prev => {
      const updated = prev.map(ep => ep.path === path ? { ...ep, delay } : ep)
      const delays: Record<string, number> = {}
      updated.forEach(ep => { delays[ep.path] = ep.delay })
      localStorage.setItem(STORAGE_KEY, JSON.stringify(delays))
      return updated
    })

    window.dispatchEvent(new CustomEvent('network-delay-change', {
      detail: { endpoint: path, delay }
    }))
  }, [])

  useEffect(() => {
    const handleStart = (e: CustomEvent<{ id: string; endpoint: string; delay: number }>) => {
      setActiveRequests(prev => {
        const next = new Map(prev)
        next.set(e.detail.id, {
          id: e.detail.id,
          endpoint: e.detail.endpoint,
          startTime: Date.now(),
          duration: e.detail.delay
        })
        return next
      })
    }

    const handleEnd = (e: CustomEvent<{ id: string; endpoint: string }>) => {
      setActiveRequests(prev => {
        const next = new Map(prev)
        next.delete(e.detail.id)
        return next
      })
    }

    window.addEventListener('network-request-start' as keyof WindowEventMap, handleStart as EventListener)
    window.addEventListener('network-request-end' as keyof WindowEventMap, handleEnd as EventListener)

    return () => {
      window.removeEventListener('network-request-start' as keyof WindowEventMap, handleStart as EventListener)
      window.removeEventListener('network-request-end' as keyof WindowEventMap, handleEnd as EventListener)
    }
  }, [])

  const requestsByEndpoint = new Map<string, ActiveRequest[]>()
  activeRequests.forEach(req => {
    const existing = requestsByEndpoint.get(req.endpoint) || []
    requestsByEndpoint.set(req.endpoint, [...existing, req])
  })

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 z-50 p-3 rounded-full shadow-lg transition-colors ${
          isOpen ? 'bg-gray-900 text-white' : 'bg-white text-gray-900 border border-gray-200'
        }`}
        title="Toggle Network Debugger"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.55a11 11 0 0 1 14.08 0" />
          <path d="M1.42 9a16 16 0 0 1 21.16 0" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <circle cx="12" cy="20" r="1" />
        </svg>
        {activeRequests.size > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
            {activeRequests.size}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-80 bg-gray-900 text-white rounded-lg shadow-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-sm">Network Debugger</h3>
            <span className="text-xs text-gray-400">Adjust latency per endpoint</span>
          </div>

          <div className="divide-y divide-gray-800">
            {endpoints.map(endpoint => {
              const requests = requestsByEndpoint.get(endpoint.path) || []
              return (
                <div key={endpoint.path} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{endpoint.name}</span>
                    <span className="text-xs text-gray-400 font-mono">{endpoint.delay}ms</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={3000}
                    step={50}
                    value={endpoint.delay}
                    onChange={(e) => updateDelay(endpoint.path, parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0ms</span>
                    <span>3000ms</span>
                  </div>

                  {requests.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {requests.map(req => (
                        <ProgressBar key={req.id} request={req} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="px-4 py-3 bg-gray-800 text-xs text-gray-400">
            <p>Delays persist in localStorage. Active requests show progress bars.</p>
          </div>
        </div>
      )}
    </>
  )
}

export function NetworkDebuggerProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <NetworkDebugger />
    </>
  )
}
