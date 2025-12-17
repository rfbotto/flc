'use client'

import { useState, useTransition, useOptimistic, useActionState, useDeferredValue, Activity } from 'react'
import { useFormStatus } from 'react-dom'
import { Task, FormState } from '@/lib/react-19-demo/types'
import { simulateNetworkRequest } from '@/components/react-19/NetworkDebugger'
import { useDelayedPending } from '@/hooks/useDelayedPending'

const initialTasks: Task[] = [
  { id: '1', title: 'Review pull request #42', description: 'Check the authentication flow', completed: false, priority: 'high', category: 'work', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: '2', title: 'Update API documentation', description: 'Add new endpoints to docs', completed: false, priority: 'medium', category: 'work', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: '3', title: 'Fix mobile navigation bug', description: 'Menu not closing on iOS', completed: true, priority: 'high', category: 'work', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: '4', title: 'Buy groceries', description: 'Milk, eggs, bread', completed: false, priority: 'low', category: 'personal', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: '5', title: 'Schedule dentist appointment', description: 'Annual checkup', completed: false, priority: 'medium', category: 'health', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: '6', title: 'Plan weekend trip', description: 'Research hotels and activities', completed: false, priority: 'low', category: 'personal', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
]

function SubmitButton() {
  const { pending } = useFormStatus()
  const showPending = useDelayedPending(pending, 150)

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {showPending ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Adding...
        </>
      ) : (
        'Add Task'
      )}
    </button>
  )
}

function FeatureBadge({ feature, active }: { feature: string; active?: boolean }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
      active
        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700'
        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
    }`}>
      {feature}
    </span>
  )
}

export default function CombinedPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [filter, setFilter] = useState('')
  const deferredFilter = useDeferredValue(filter)
  const isFilterStale = filter !== deferredFilter
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [networkDelay, setNetworkDelay] = useState(800)

  const [, startTaskTransition] = useTransition()

  const [optimisticTasks, addOptimistic] = useOptimistic(
    tasks,
    (state, action: { type: 'toggle' | 'add'; task: Task }) => {
      if (action.type === 'toggle') {
        return state.map(t => t.id === action.task.id ? action.task : t)
      }
      if (action.type === 'add') {
        return [action.task, ...state]
      }
      return state
    }
  )

  const [formState, formAction] = useActionState(
    async (prevState: FormState, formData: FormData): Promise<FormState> => {
      const title = formData.get('title') as string

      if (!title || title.trim().length < 3) {
        return { success: false, message: 'Title must be at least 3 characters', errors: { title: 'Too short' } }
      }

      const newTask: Task = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        title: title.trim(),
        description: '',
        completed: false,
        priority: 'medium',
        category: 'work',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      startTaskTransition(async () => {
        addOptimistic({ type: 'add', task: { ...newTask, id: `optimistic-${newTask.id}`, title: `${newTask.title} (saving...)` } })
        await simulateNetworkRequest('/api/tasks', networkDelay)
        setTasks(prev => [newTask, ...prev])
      })

      return { success: true, message: 'Task added!' }
    },
    { success: false, message: '' }
  )

  const filteredTasks = optimisticTasks.filter(task => {
    if (activeTab === 'active' && task.completed) return false
    if (activeTab === 'completed' && !task.completed) return false
    if (deferredFilter && !task.title.toLowerCase().includes(deferredFilter.toLowerCase())) return false
    return true
  })

  const toggleTask = async (task: Task) => {
    const optimisticTask = { ...task, completed: !task.completed }

    startTaskTransition(async () => {
      addOptimistic({ type: 'toggle', task: optimisticTask })

      await simulateNetworkRequest('/api/tasks', networkDelay)

      setTasks(prev => prev.map(t =>
        t.id === task.id ? { ...t, completed: !t.completed } : t
      ))
    })
  }

  const selectTask = (task: Task | null) => {
    const supportsViewTransitions = typeof document !== 'undefined' && 'startViewTransition' in document
    if (supportsViewTransitions) {
      (document as Document & { startViewTransition: (callback: () => void) => void }).startViewTransition(() => {
        setSelectedTask(task)
      })
    } else {
      setSelectedTask(task)
    }
  }

  const activeFeatures = {
    deferredValues: isFilterStale,
    transitions: optimisticTasks.some(t => t.title.includes('(saving...)')),
    formActions: true,
    optimistic: optimisticTasks.some(t => t.title.includes('(saving...)')),
    activity: true,
    viewTransition: selectedTask !== null,
    delayedLoading: true,
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Combined Demo</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          A complete Task Manager using all React 19 features working together.
          Use the <strong>Network Debugger</strong> (bottom-right button) to test with different latencies.
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <FeatureBadge feature="useDeferredValue" active={activeFeatures.deferredValues} />
          <FeatureBadge feature="useTransition" active={activeFeatures.transitions} />
          <FeatureBadge feature="Form Actions" active={activeFeatures.formActions} />
          <FeatureBadge feature="useOptimistic" active={activeFeatures.optimistic} />
          <FeatureBadge feature="Activity" active={activeFeatures.activity} />
          <FeatureBadge feature="ViewTransition" active={activeFeatures.viewTransition} />
          <FeatureBadge feature="Delayed Loading" active={activeFeatures.delayedLoading} />
        </div>

        <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <label className="text-sm text-gray-600 dark:text-gray-400">Network delay:</label>
          <input
            type="range"
            min={200}
            max={2000}
            value={networkDelay}
            onChange={(e) => setNetworkDelay(parseInt(e.target.value))}
            className="flex-1 max-w-[200px]"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400 w-16">{networkDelay}ms</span>
        </div>
      </div>

      {selectedTask ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6" style={{ viewTransitionName: 'task-panel' }}>
          <button
            onClick={() => selectTask(null)}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4"
          >
            &larr; Back to list
          </button>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedTask.title}</h2>
            <p className="text-gray-600 dark:text-gray-400">{selectedTask.description || 'No description'}</p>

            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-sm ${
                selectedTask.priority === 'high' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' :
                selectedTask.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' :
                'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}>
                {selectedTask.priority} priority
              </span>
              <span className="px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                {selectedTask.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                selectedTask.completed ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
              }`}>
                {selectedTask.completed ? 'Completed' : 'Active'}
              </span>
            </div>

            <button
              onClick={() => {
                toggleTask(selectedTask)
                selectTask({ ...selectedTask, completed: !selectedTask.completed })
              }}
              className="px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-md text-sm hover:bg-gray-900 dark:hover:bg-gray-600"
            >
              Mark as {selectedTask.completed ? 'Active' : 'Completed'}
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-6">
            ViewTransition active for smooth navigation
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6" style={{ viewTransitionName: 'task-panel' }}>
          <div className="col-span-2 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                Add Task
                <span className="text-xs text-blue-600 dark:text-blue-400 font-normal">(Form Actions + useActionState)</span>
              </h3>
              <form action={formAction} className="flex gap-2">
                <input
                  type="text"
                  name="title"
                  placeholder="Enter task title..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <SubmitButton />
              </form>
              {formState.message && (
                <p className={`text-sm mt-2 ${formState.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formState.message}
                </p>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                Filter Tasks
                <span className="text-xs text-purple-600 dark:text-purple-400 font-normal">(useDeferredValue)</span>
              </h3>
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search tasks..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              {isFilterStale && (
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Filtering...</p>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                Task Tabs
                <span className="text-xs text-blue-600 dark:text-blue-400 font-normal">(Activity)</span>
              </h3>

              <div className="flex gap-2 mb-4">
                {(['all', 'active', 'completed'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <Activity mode={activeTab === 'all' ? 'visible' : 'hidden'}>
                <TaskList
                  tasks={filteredTasks.filter(() => true)}
                  onToggle={toggleTask}
                  onSelect={selectTask}
                  label="All"
                />
              </Activity>
              <Activity mode={activeTab === 'active' ? 'visible' : 'hidden'}>
                <TaskList
                  tasks={filteredTasks.filter(t => !t.completed)}
                  onToggle={toggleTask}
                  onSelect={selectTask}
                  label="Active"
                />
              </Activity>
              <Activity mode={activeTab === 'completed' ? 'visible' : 'hidden'}>
                <TaskList
                  tasks={filteredTasks.filter(t => t.completed)}
                  onToggle={toggleTask}
                  onSelect={selectTask}
                  label="Completed"
                />
              </Activity>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 h-fit">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Features Used</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 mt-1.5 rounded-full bg-purple-500" />
                <div>
                  <strong className="text-gray-900 dark:text-gray-100">useDeferredValue</strong>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Responsive filter input</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 mt-1.5 rounded-full bg-blue-500" />
                <div>
                  <strong className="text-gray-900 dark:text-gray-100">useTransition</strong>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Async task operations</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 mt-1.5 rounded-full bg-green-500" />
                <div>
                  <strong className="text-gray-900 dark:text-gray-100">Form Actions</strong>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Declarative task creation</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 mt-1.5 rounded-full bg-orange-500" />
                <div>
                  <strong className="text-gray-900 dark:text-gray-100">useOptimistic</strong>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Instant UI for add/toggle</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 mt-1.5 rounded-full bg-pink-500" />
                <div>
                  <strong className="text-gray-900 dark:text-gray-100">Activity</strong>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Tab state preservation</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 mt-1.5 rounded-full bg-teal-500" />
                <div>
                  <strong className="text-gray-900 dark:text-gray-100">ViewTransition</strong>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Smooth task detail navigation</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

function TaskList({
  tasks,
  onToggle,
  onSelect,
  label,
}: {
  tasks: Task[]
  onToggle: (task: Task) => void
  onSelect: (task: Task) => void
  label: string
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        {label}: {tasks.length} tasks
      </p>
      {tasks.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">No tasks</p>
      ) : (
        tasks.map(task => {
          const isOptimistic = task.title.includes('(saving...)')
          return (
            <div
              key={task.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                isOptimistic ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950' : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={(e) => {
                  e.stopPropagation()
                  onToggle(task)
                }}
                className="h-4 w-4 rounded"
              />
              <div className="flex-1 min-w-0" onClick={() => onSelect(task)}>
                <span className={`block truncate ${task.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
                  {task.title}
                </span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${
                task.priority === 'high' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' :
                task.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' :
                'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {task.priority}
              </span>
              {isOptimistic && (
                <span className="text-xs text-green-600 dark:text-green-400">saving...</span>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
