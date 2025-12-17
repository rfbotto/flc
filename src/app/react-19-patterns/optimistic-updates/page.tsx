'use client'

import { useState, useOptimistic, useTransition, startTransition } from 'react'
import { Task } from '@/lib/react-19-demo/types'
import { CodeBlock } from '@/components/react-19/CodeBlock'

const initialTasks: Task[] = [
  { id: '1', title: 'Review pull request', description: '', completed: false, priority: 'high', category: 'work', createdAt: '', updatedAt: '' },
  { id: '2', title: 'Update documentation', description: '', completed: true, priority: 'medium', category: 'work', createdAt: '', updatedAt: '' },
  { id: '3', title: 'Fix navigation bug', description: '', completed: false, priority: 'high', category: 'work', createdAt: '', updatedAt: '' },
  { id: '4', title: 'Buy groceries', description: '', completed: false, priority: 'low', category: 'personal', createdAt: '', updatedAt: '' },
]

function BeforeOptimistic() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [delay, setDelay] = useState(1000)
  const [shouldFail, setShouldFail] = useState(false)

  const toggleTask = async (taskId: string) => {
    const originalTasks = [...tasks]
    const originalPending = new Set(pendingIds)

    setPendingIds(prev => new Set([...Array.from(prev), taskId]))
    setError(null)

    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ))

    try {
      await new Promise((resolve, reject) =>
        setTimeout(() => shouldFail ? reject(new Error('Server error')) : resolve(null), delay)
      )

      setPendingIds(prev => {
        const next = new Set(prev)
        next.delete(taskId)
        return next
      })
    } catch {
      setTasks(originalTasks)
      setPendingIds(originalPending)
      setError('Failed to update task. Changes reverted.')
    }
  }

  return (
    <div>
      <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">Delay:</label>
          <input
            type="range"
            min={500}
            max={3000}
            value={delay}
            onChange={(e) => setDelay(parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400 w-16">{delay}ms</span>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <input
            type="checkbox"
            checked={shouldFail}
            onChange={(e) => setShouldFail(e.target.checked)}
          />
          Simulate server error
        </label>
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-300 mb-2">{error}</p>
      )}
      <ul className="space-y-2">
        {tasks.map(task => (
          <li
            key={task.id}
            className={`flex items-center gap-3 p-2 rounded border ${
              pendingIds.has(task.id) ? 'border-yellow-300 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950' : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
              disabled={pendingIds.has(task.id)}
              className="h-4 w-4"
            />
            <span className={task.completed ? 'line-through text-gray-400' : ''}>
              {task.title}
            </span>
            {pendingIds.has(task.id) && (
              <span className="text-xs text-yellow-600 dark:text-yellow-300 ml-auto">saving...</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function AfterOptimistic() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [delay, setDelay] = useState(1000)
  const [shouldFail, setShouldFail] = useState(false)

  const [optimisticTasks, addOptimistic] = useOptimistic(
    tasks,
    (state, updatedTask: Task) =>
      state.map(t => t.id === updatedTask.id ? updatedTask : t)
  )

  const toggleTask = async (task: Task) => {
    setError(null)
    const optimisticTask = { ...task, completed: !task.completed }

    startTransition(async () => {
      addOptimistic(optimisticTask)

      try {
        await new Promise((resolve, reject) =>
          setTimeout(() => shouldFail ? reject(new Error('Server error')) : resolve(null), delay)
        )

        setTasks(prev => prev.map(t =>
          t.id === task.id ? { ...t, completed: !t.completed } : t
        ))
      } catch {
        setError('Failed to update task. Changes automatically reverted.')
      }
    })
  }

  return (
    <div>
      <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">Delay:</label>
          <input
            type="range"
            min={500}
            max={3000}
            value={delay}
            onChange={(e) => setDelay(parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400 w-16">{delay}ms</span>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <input
            type="checkbox"
            checked={shouldFail}
            onChange={(e) => setShouldFail(e.target.checked)}
          />
          Simulate server error
        </label>
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-300 mb-2">{error}</p>
      )}
      <ul className="space-y-2">
        {optimisticTasks.map(task => {
          const isOptimistic = task.completed !== tasks.find(t => t.id === task.id)?.completed
          return (
            <li
              key={task.id}
              className={`flex items-center gap-3 p-2 rounded border ${
                isOptimistic ? 'border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950' : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task)}
                className="h-4 w-4"
              />
              <span className={task.completed ? 'line-through text-gray-400' : ''}>
                {task.title}
              </span>
              {isOptimistic && (
                <span className="text-xs text-green-600 dark:text-green-300 ml-auto">optimistic</span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

type TabValue = 'all' | 'wip' | 'done'

function TabListDemo() {
  const [activeTab, setActiveTab] = useState<TabValue>('all')
  const [delay, setDelay] = useState(800)

  const [optimisticTab, setOptimisticTab] = useOptimistic(activeTab)
  const isPending = optimisticTab !== activeTab

  const changeTab = async (newTab: TabValue) => {
    await new Promise(resolve => setTimeout(resolve, delay))
    setActiveTab(newTab)
  }

  const onTabClick = (newValue: TabValue) => {
    startTransition(async () => {
      setOptimisticTab(newValue)
      await changeTab(newValue)
    })
  }

  const tabs: { value: TabValue; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'wip', label: 'In Progress' },
    { value: 'done', label: 'Completed' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm text-gray-600 dark:text-gray-400">Simulated delay:</label>
        <input
          type="range"
          min={200}
          max={2000}
          value={delay}
          onChange={(e) => setDelay(parseInt(e.target.value))}
          className="flex-1 max-w-32"
        />
        <span className="text-sm text-gray-600 dark:text-gray-400 w-16">{delay}ms</span>
      </div>

      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {tabs.map(tab => {
          const isActive = optimisticTab === tab.value
          const isShimmering = isPending && optimisticTab === tab.value
          return (
            <button
              key={tab.value}
              onClick={() => onTabClick(tab.value)}
              className={`relative flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors overflow-hidden ${
                isActive
                  ? 'bg-white dark:bg-gray-800 text-purple-700 dark:text-purple-300 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              {tab.label}
              {isShimmering && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-200 dark:via-purple-800 to-transparent animate-shimmer" />
              )}
            </button>
          )
        })}
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 min-h-[100px]">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Current tab:</span>
          <span className="font-medium">{optimisticTab}</span>
          {isPending && (
            <span className="text-xs text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded">
              syncing...
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Server confirmed: <span className="font-mono">{activeTab}</span>
        </p>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1s infinite;
        }
      `}</style>
    </div>
  )
}

const beforeCode = `const [tasks, setTasks] = useState(initialTasks)
const [pendingIds, setPendingIds] = useState(new Set())

const toggleTask = async (taskId) => {
  const originalTasks = [...tasks]

  // Manual optimistic update
  setPendingIds(prev => new Set([...prev, taskId]))
  setTasks(prev => prev.map(t =>
    t.id === taskId ? { ...t, completed: !t.completed } : t
  ))

  try {
    await updateOnServer(taskId)
    setPendingIds(prev => { /* remove id */ })
  } catch (error) {
    // Manual rollback
    setTasks(originalTasks)
    setPendingIds(originalPending)
  }
}`

const afterCode = `const [tasks, setTasks] = useState(initialTasks)
const [optimisticTasks, addOptimistic] = useOptimistic(
  tasks,
  (state, updatedTask) =>
    state.map(t => t.id === updatedTask.id ? updatedTask : t)
)

const toggleTask = async (task) => {
  const optimisticTask = { ...task, completed: !task.completed }

  startTransition(async () => {
    addOptimistic(optimisticTask) // Instant UI update

    try {
      await updateOnServer(task.id)
      setTasks(prev => /* update real state */)
    } catch {
      // Auto-reverts to 'tasks' on error!
    }
  })
}`

const tabListCode = `// TabList pattern from async-react
const [activeTab, setActiveTab] = useState('all')
const [optimisticTab, setOptimisticTab] = useOptimistic(activeTab)
const isPending = optimisticTab !== activeTab

function onTabClick(newValue) {
  startTransition(async () => {
    setOptimisticTab(newValue)  // Instant UI feedback
    await changeAction(newValue) // Server request
    setActiveTab(newValue)       // Confirm change
  })
}

// Tab shows shimmer when isPending && selected
<Tab active={optimisticTab === 'all'}>
  All
  {isPending && optimisticTab === 'all' && <Shimmer />}
</Tab>`

export default function OptimisticUpdatesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Optimistic Updates</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        React 19&apos;s <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">useOptimistic</code> hook provides instant
        UI feedback with automatic rollback on errors.
      </p>

      <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-8">
        <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Try This</h3>
        <p className="text-purple-700 dark:text-purple-300 text-sm">
          Enable &quot;Simulate server error&quot; and toggle a task. Watch how the &quot;Before&quot; approach
          requires manual rollback logic, while &quot;After&quot; automatically reverts to the previous state.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="border-2 border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-950">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-4">Before React 19</h2>
          <CodeBlock code={beforeCode} className="mb-4 max-h-56" />
          <BeforeOptimistic />
        </div>

        <div className="border-2 border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-950">
          <h2 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4">After React 19</h2>
          <CodeBlock code={afterCode} className="mb-4 max-h-56" />
          <AfterOptimistic />
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">What Changed?</h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex gap-2">
            <span className="text-red-500">-</span>
            <span>Manual tracking of <code className="bg-white dark:bg-gray-800 px-1 rounded">pendingIds</code> and original state</span>
          </li>
          <li className="flex gap-2">
            <span className="text-red-500">-</span>
            <span>Manual rollback in catch block</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-500">+</span>
            <span><code className="bg-white dark:bg-gray-800 px-1 rounded">useOptimistic</code> separates optimistic from actual state</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-500">+</span>
            <span>Automatic revert to base state when transition completes</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-500">+</span>
            <span>Cleaner mental model: optimistic state is &quot;temporary&quot;</span>
          </li>
        </ul>
      </div>

      <div className="border-2 border-indigo-200 dark:border-indigo-800 rounded-lg p-6 bg-indigo-50 dark:bg-indigo-950 mb-8">
        <h2 className="text-xl font-semibold text-indigo-900 dark:text-indigo-100 mb-3">The TabList Pattern</h2>
        <p className="text-indigo-800 dark:text-indigo-200 text-sm mb-4">
          The async-react TabList demonstrates combining <code className="bg-indigo-100 dark:bg-indigo-950 px-1 rounded">useOptimistic</code> with{' '}
          <code className="bg-indigo-100 dark:bg-indigo-950 px-1 rounded">startTransition</code> for instant tab switching. The selected tab
          updates immediately while a shimmer indicates the server sync is in progress.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-indigo-800 dark:text-indigo-200 mb-2 text-sm">Pattern</h3>
            <CodeBlock code={tabListCode} className="max-h-72" />
          </div>

          <div>
            <h3 className="font-medium text-indigo-800 dark:text-indigo-200 mb-2 text-sm">Live Demo</h3>
            <div className="bg-white dark:bg-gray-800 rounded-md p-4 border border-indigo-100 dark:border-indigo-900">
              <TabListDemo />
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-indigo-100 dark:bg-indigo-950 rounded-md">
          <p className="text-indigo-900 dark:text-indigo-100 text-sm">
            <strong>Key insight:</strong> By comparing <code className="bg-indigo-200 dark:bg-indigo-900 px-1 rounded">optimisticTab !== activeTab</code>,
            we know when an update is pending. This enables subtle UI feedback (shimmer) without blocking user interaction.
          </p>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Coordination with Transitions</h3>
        <p className="text-amber-700 dark:text-amber-300 text-sm">
          <code className="bg-amber-100 dark:bg-amber-950 px-1 rounded">useOptimistic</code> is designed to work inside{' '}
          <code className="bg-amber-100 dark:bg-amber-950 px-1 rounded">startTransition</code>. The optimistic state persists
          until the transition completes, then automatically reverts to the confirmed state. This means errors
          are handled gracefully without explicit rollback code.
        </p>
      </div>
    </div>
  )
}
