'use client'

import { useState, useTransition, ReactNode } from 'react'
import { useDelayedPending } from '@/hooks/useDelayedPending'
import { CodeBlock } from '@/components/react-19/CodeBlock'

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

function BeforeTransition() {
  const [items, setItems] = useState<string[]>(['Item 1', 'Item 2', 'Item 3'])
  const [isLoading, setIsLoading] = useState(false)
  const [delay, setDelay] = useState(1000)

  const addItem = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, delay))
    setItems(prev => [...prev, `Item ${prev.length + 1}`])
    setIsLoading(false)
  }

  const clearItems = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, delay))
    setItems(['Item 1'])
    setIsLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm text-gray-600 dark:text-gray-400">Simulated delay:</label>
        <input
          type="range"
          min={200}
          max={3000}
          value={delay}
          onChange={(e) => setDelay(parseInt(e.target.value))}
          className="flex-1 max-w-32"
        />
        <span className="text-sm text-gray-600 dark:text-gray-400 w-16">{delay}ms</span>
      </div>

      <div className="flex gap-3">
        <button
          onClick={addItem}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-70 flex items-center gap-2 min-w-[120px] justify-center"
        >
          {isLoading ? <Spinner /> : 'Add Item'}
        </button>
        <button
          onClick={clearItems}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-70 flex items-center gap-2 min-w-[120px] justify-center"
        >
          {isLoading ? <Spinner /> : 'Reset'}
        </button>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Items ({items.length}):</p>
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <span key={i} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function ActionButton({ children, action }: { children: ReactNode; action: () => Promise<void> }) {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      await action()
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-70 flex items-center gap-2 min-w-[120px] justify-center"
    >
      {isPending ? <Spinner /> : children}
    </button>
  )
}

function DelayedActionButton({
  children,
  action,
  loadingDelay = 150
}: {
  children: ReactNode
  action: () => Promise<void>
  loadingDelay?: number
}) {
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
      disabled={isPending}
      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-70 flex items-center gap-2 min-w-[120px] justify-center"
    >
      {showPending ? <Spinner /> : children}
    </button>
  )
}

function AfterTransition() {
  const [items, setItems] = useState<string[]>(['Item 1', 'Item 2', 'Item 3'])
  const [delay, setDelay] = useState(1000)

  const addItem = async () => {
    await new Promise(resolve => setTimeout(resolve, delay))
    setItems(prev => [...prev, `Item ${prev.length + 1}`])
  }

  const clearItems = async () => {
    await new Promise(resolve => setTimeout(resolve, delay))
    setItems(['Item 1'])
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm text-gray-600 dark:text-gray-400">Simulated delay:</label>
        <input
          type="range"
          min={200}
          max={3000}
          value={delay}
          onChange={(e) => setDelay(parseInt(e.target.value))}
          className="flex-1 max-w-32"
        />
        <span className="text-sm text-gray-600 dark:text-gray-400 w-16">{delay}ms</span>
      </div>

      <div className="flex gap-3">
        <ActionButton action={addItem}>Add Item</ActionButton>
        <ActionButton action={clearItems}>Reset</ActionButton>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Items ({items.length}):</p>
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <span key={i} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

const beforeCode = `const [isLoading, setIsLoading] = useState(false)

const addItem = async () => {
  setIsLoading(true)
  await saveToServer()
  setItems(prev => [...prev, newItem])
  setIsLoading(false)
}

// Manual loading state for each action
<button disabled={isLoading}>
  {isLoading ? <Spinner /> : 'Add Item'}
</button>`

const afterCode = `function ActionButton({ children, action }) {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      await action()
    })
  }

  return (
    <button disabled={isPending}>
      {isPending ? <Spinner /> : children}
    </button>
  )
}

// Component owns its pending state
<ActionButton action={addItem}>Add Item</ActionButton>`

const delayedLoadingCode = `function useDelayedPending(isPending, delay = 150) {
  const [showPending, setShowPending] = useState(false)

  useEffect(() => {
    if (isPending) {
      const timer = setTimeout(() => setShowPending(true), delay)
      return () => clearTimeout(timer)
    }
    setShowPending(false)
  }, [isPending, delay])

  return showPending
}

function DelayedActionButton({ children, action, delay = 150 }) {
  const [isPending, startTransition] = useTransition()
  const showPending = useDelayedPending(isPending, delay)

  return (
    <button onClick={() => startTransition(action)}>
      {showPending ? <Spinner /> : children}
    </button>
  )
}`

function DelayedLoadingDemo() {
  const [count, setCount] = useState(0)
  const [delay, setDelay] = useState(100)
  const [loadingThreshold, setLoadingThreshold] = useState(150)

  const increment = async () => {
    await new Promise(resolve => setTimeout(resolve, delay))
    setCount(c => c + 1)
  }

  return (
    <div className="border-2 border-purple-200 dark:border-purple-800 rounded-lg p-6 bg-purple-50 dark:bg-purple-950 mt-8">
      <h2 className="text-xl font-semibold text-purple-800 dark:text-purple-200 mb-3">Delayed Loading States</h2>
      <p className="text-purple-700 dark:text-purple-300 text-sm mb-4">
        The <strong>150ms delay pattern</strong> prevents &quot;flash of loading&quot; for fast operations.
        The spinner only appears if the operation takes longer than the threshold.
      </p>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <CodeBlock code={delayedLoadingCode} className="mb-4 max-h-64" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-purple-700 dark:text-purple-300 w-32">Operation delay:</label>
            <input
              type="range"
              min={50}
              max={500}
              value={delay}
              onChange={(e) => setDelay(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-purple-600 dark:text-purple-400 w-16">{delay}ms</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-purple-700 dark:text-purple-300 w-32">Loading threshold:</label>
            <input
              type="range"
              min={50}
              max={300}
              value={loadingThreshold}
              onChange={(e) => setLoadingThreshold(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-purple-600 dark:text-purple-400 w-16">{loadingThreshold}ms</span>
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 rounded-md border border-purple-200 dark:border-purple-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Count: <span className="font-bold text-purple-600 dark:text-purple-400">{count}</span>
            </p>
            <DelayedActionButton action={increment} loadingDelay={loadingThreshold}>
              Increment
            </DelayedActionButton>
          </div>

          <div className={`p-3 rounded-md text-sm ${
            delay < loadingThreshold
              ? 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'
              : 'bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
          }`}>
            {delay < loadingThreshold
              ? `Fast! No spinner shown (${delay}ms < ${loadingThreshold}ms threshold)`
              : `Slow. Spinner will appear (${delay}ms > ${loadingThreshold}ms threshold)`}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TransitionsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Transitions</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">useTransition</code> lets you update state
        without blocking the UI. In React 19, it supports async functions for handling loading states automatically.
      </p>

      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Try This</h3>
        <p className="text-blue-700 dark:text-blue-300 text-sm">
          Click the buttons in both demos. Notice how the left version requires manual <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">isLoading</code> state,
          while the right version handles pending states automatically per-button.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="border-2 border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-950">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-4">Manual Loading State</h2>
          <CodeBlock code={beforeCode} className="mb-4" />
          <BeforeTransition />
        </div>

        <div className="border-2 border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-950">
          <h2 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4">With useTransition</h2>
          <CodeBlock code={afterCode} className="mb-4" />
          <AfterTransition />
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">What Changed?</h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex gap-2">
            <span className="text-red-500">-</span>
            <span>Manual <code className="bg-white dark:bg-gray-700 px-1 rounded">isLoading</code> state shared across all buttons</span>
          </li>
          <li className="flex gap-2">
            <span className="text-red-500">-</span>
            <span>Must remember to set loading true/false around every async operation</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-500">+</span>
            <span><code className="bg-white dark:bg-gray-700 px-1 rounded">startTransition</code> accepts async functions in React 19</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-500">+</span>
            <span>Each button has independent pending state</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-500">+</span>
            <span>Component owns its loading UI - consumers just pass actions</span>
          </li>
        </ul>
      </div>

      <DelayedLoadingDemo />

      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-8">
        <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Network-Aware Behavior</h3>
        <p className="text-amber-700 dark:text-amber-300 text-sm">
          With the action prop pattern, loading states only appear when operations take longer than ~150ms.
          Fast operations feel instant, while slow ones show appropriate feedback - all without explicit timing logic.
        </p>
      </div>
    </div>
  )
}
