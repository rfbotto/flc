'use client'

import { useState, useDeferredValue, memo } from 'react'
import { generateTasks } from '@/lib/react-19-demo/mock-data'
import { Task } from '@/lib/react-19-demo/types'
import { CodeBlock } from '@/components/react-19/CodeBlock'

const allTasks = generateTasks(10000)

function filterTasks(tasks: Task[], query: string): Task[] {
  if (!query.trim()) return tasks.slice(0, 200)
  const lowerQuery = query.toLowerCase()
  return tasks.filter(task => task.title.toLowerCase().includes(lowerQuery)).slice(0, 200)
}

const SlowTaskItem = memo(function SlowTaskItem({ task }: { task: Task }) {
  const start = performance.now()
  while (performance.now() - start < 3) {}
  return (
    <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100">
      <span className={task.completed ? 'line-through text-gray-400' : ''}>
        {task.title}
      </span>
    </div>
  )
})

function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <>
      {tasks.map(task => (
        <SlowTaskItem key={task.id} task={task} />
      ))}
    </>
  )
}

function BeforeDeferredValue() {
  const [filter, setFilter] = useState('')
  const filteredTasks = filterTasks(allTasks, filter)

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Search tasks
        </label>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Type quickly to see lag..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">Input lags while rendering list</p>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        Showing {filteredTasks.length} tasks
      </div>
      <div className="h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800">
        <TaskList tasks={filteredTasks} />
      </div>
    </div>
  )
}

function AfterDeferredValue() {
  const [filter, setFilter] = useState('')
  const deferredFilter = useDeferredValue(filter)
  const isStale = filter !== deferredFilter
  const filteredTasks = filterTasks(allTasks, deferredFilter)

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Search tasks
        </label>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Type quickly - stays responsive!"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
        {isStale ? (
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">Updating list in background...</p>
        ) : (
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">Input stays responsive</p>
        )}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        Showing {filteredTasks.length} tasks
        {isStale && <span className="ml-2 text-green-600 dark:text-green-400">(updating...)</span>}
      </div>
      <div className={`h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 transition-opacity ${isStale ? 'opacity-70' : ''}`}>
        <TaskList tasks={filteredTasks} />
      </div>
    </div>
  )
}

const beforeCode = `const [filter, setFilter] = useState('')
// Filter runs on every keystroke, blocking input
const filteredTasks = filterTasks(tasks, filter)

// Each keystroke triggers a full re-render
<input onChange={(e) => setFilter(e.target.value)} />
<TaskList tasks={filteredTasks} />`

const afterCode = `const [filter, setFilter] = useState('')
// Deferred value lags behind, keeping input responsive
const deferredFilter = useDeferredValue(filter)
const isStale = filter !== deferredFilter
const filteredTasks = filterTasks(tasks, deferredFilter)

// Input updates immediately, list updates when idle
<input onChange={(e) => setFilter(e.target.value)} />
<TaskList tasks={filteredTasks} style={isStale && 'opacity: 0.7'} />`

export default function DeferredValuesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Deferred Values</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">useDeferredValue</code> lets you defer
        re-rendering a non-urgent part of the UI, keeping high-priority updates (like typing) responsive.
      </p>

      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Try This</h3>
        <p className="text-blue-700 dark:text-blue-300 text-sm">
          Type quickly in both inputs (e.g., &quot;review&quot;). The left input will lag as each keystroke
          blocks on rendering. The right input stays responsive - the list updates when you pause typing.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="border-2 border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-950">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-4">Without useDeferredValue</h2>
          <CodeBlock code={beforeCode} className="mb-4" />
          <BeforeDeferredValue />
        </div>

        <div className="border-2 border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-950">
          <h2 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4">With useDeferredValue</h2>
          <CodeBlock code={afterCode} className="mb-4" />
          <AfterDeferredValue />
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">What Changed?</h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex gap-2">
            <span className="text-red-500">-</span>
            <span>Every keystroke re-renders the expensive list synchronously</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-500">+</span>
            <span><code className="bg-white dark:bg-gray-700 px-1 rounded">useDeferredValue</code> creates a &quot;lagging&quot; version of the filter</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-500">+</span>
            <span>Input value updates instantly (urgent), list uses deferred value (non-urgent)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-500">+</span>
            <span>React can interrupt the deferred render when new input arrives</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-500">+</span>
            <span>Compare <code className="bg-white dark:bg-gray-700 px-1 rounded">filter !== deferredFilter</code> to detect stale UI</span>
          </li>
        </ul>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">When to Use</h3>
        <p className="text-amber-700 dark:text-amber-300 text-sm">
          Use <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">useDeferredValue</code> when you have
          an expensive render that depends on a frequently-changing value (search inputs, sliders, filters).
          For async operations like data fetching, use <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">useTransition</code> instead.
        </p>
      </div>
    </div>
  )
}
