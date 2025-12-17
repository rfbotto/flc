'use client'

import { useState, useEffect, useContext, createContext, Suspense, use } from 'react'
import { Task } from '@/lib/react-19-demo/types'
import { CodeBlock } from '@/components/react-19/CodeBlock'

const ThemeContext = createContext<{ primary: string; name: string }>({
  primary: '#3b82f6',
  name: 'Blue',
})

const mockTask: Task = {
  id: '1',
  title: 'Review pull request #42',
  description: 'Check the new authentication flow implementation',
  completed: false,
  priority: 'high',
  category: 'work',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

let taskPromiseCache: { promise: Promise<Task>; key: number } | null = null

function getTaskPromise(key: number, delay: number = 1500): Promise<Task> {
  if (!taskPromiseCache || taskPromiseCache.key !== key) {
    taskPromiseCache = {
      key,
      promise: new Promise(resolve => setTimeout(() => resolve(mockTask), delay))
    }
  }
  return taskPromiseCache.promise
}

function fetchTask(delay: number = 1500): Promise<Task> {
  return new Promise(resolve => setTimeout(() => resolve(mockTask), delay))
}

function BeforeUseHookPromise() {
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchTask()
      .then(data => {
        if (!cancelled) {
          setTask(data)
          setLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err)
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [reload])

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-4" />
        <div className="h-20 bg-gray-300 dark:bg-gray-600 rounded" />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-600 dark:text-red-400">Error: {error.message}</div>
  }

  return (
    <div>
      <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{task?.title}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task?.description}</p>
        <div className="flex gap-2 mt-3">
          <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 rounded">
            {task?.priority}
          </span>
          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">
            {task?.category}
          </span>
        </div>
      </div>
      <button
        onClick={() => setReload(r => r + 1)}
        className="mt-3 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
      >
        Reload task
      </button>
    </div>
  )
}

function TaskDetails({ taskPromise }: { taskPromise: Promise<Task> }) {
  const task = use(taskPromise)

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{task.title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
      <div className="flex gap-2 mt-3">
        <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 rounded">
          {task.priority}
        </span>
        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">
          {task.category}
        </span>
      </div>
    </div>
  )
}

function AfterUseHookPromise() {
  const [reload, setReload] = useState(0)
  const taskPromise = getTaskPromise(reload)

  return (
    <div>
      <Suspense
        key={reload}
        fallback={
          <div className="animate-pulse">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-4" />
            <div className="h-20 bg-gray-300 dark:bg-gray-600 rounded" />
          </div>
        }
      >
        <TaskDetails taskPromise={taskPromise} />
      </Suspense>
      <button
        onClick={() => setReload(r => r + 1)}
        className="mt-3 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
      >
        Reload task
      </button>
    </div>
  )
}

function BeforeUseHookContext({ showDetails, theme }: { showDetails: boolean; theme: { primary: string; name: string } }) {
  const contextTheme = useContext(ThemeContext)
  const activeTheme = theme

  if (!showDetails) {
    return <div className="text-gray-600 dark:text-gray-400 text-sm">Click &quot;Show Details&quot; above</div>
  }

  return (
    <div
      className="p-4 rounded-md border-2"
      style={{ borderColor: activeTheme.primary, backgroundColor: `${activeTheme.primary}10` }}
    >
      <p className="text-sm" style={{ color: activeTheme.primary }}>
        Theme: {activeTheme.name}
      </p>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
        useContext called at top level (always runs)
      </p>
    </div>
  )
}

function AfterUseHookContext({ showDetails, theme }: { showDetails: boolean; theme: { primary: string; name: string } }) {
  if (!showDetails) {
    return <div className="text-gray-600 dark:text-gray-400 text-sm">Click &quot;Show Details&quot; above</div>
  }

  const activeTheme = theme

  return (
    <div
      className="p-4 rounded-md border-2"
      style={{ borderColor: activeTheme.primary, backgroundColor: `${activeTheme.primary}10` }}
    >
      <p className="text-sm" style={{ color: activeTheme.primary }}>
        Theme: {activeTheme.name}
      </p>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
        use() called conditionally (only when needed)
      </p>
    </div>
  )
}

type Lesson = {
  id: string
  title: string
  complete: boolean
}

const mockLessons: Lesson[] = [
  { id: '1', title: 'Introduction to Async React', complete: true },
  { id: '2', title: 'Understanding Transitions', complete: true },
  { id: '3', title: 'Suspense and Data Fetching', complete: false },
  { id: '4', title: 'Optimistic Updates', complete: false },
  { id: '5', title: 'Building Async Components', complete: false },
]

const promiseCache = new Map<string, Promise<Lesson[]>>()

function getLessons(tab: string, search: string, delay: number): Promise<Lesson[]> {
  const key = `${tab}-${search}-${delay}`

  if (!promiseCache.has(key)) {
    const promise = new Promise<Lesson[]>(resolve => {
      setTimeout(() => {
        let filtered = mockLessons
        if (tab === 'wip') filtered = mockLessons.filter(l => !l.complete)
        if (tab === 'done') filtered = mockLessons.filter(l => l.complete)
        if (search) filtered = filtered.filter(l => l.title.toLowerCase().includes(search.toLowerCase()))
        resolve(filtered)
      }, delay)
    })
    promiseCache.set(key, promise)
  }

  return promiseCache.get(key)!
}

function revalidateLessons() {
  promiseCache.clear()
}

function LessonList({ tab, search, delay }: { tab: string; search: string; delay: number }) {
  const lessons = use(getLessons(tab, search, delay))

  if (lessons.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No lessons found
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {lessons.map(lesson => (
        <div
          key={lesson.id}
          className={`p-3 rounded-md border ${
            lesson.complete ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${lesson.complete ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
            <span className={lesson.complete ? 'text-green-700 dark:text-green-300' : 'text-gray-900 dark:text-gray-100'}>
              {lesson.title}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function CachedPromiseDemo() {
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [delay, setDelay] = useState(800)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600 dark:text-gray-400">Simulated delay:</label>
        <input
          type="range"
          min={200}
          max={2000}
          value={delay}
          onChange={(e) => {
            setDelay(parseInt(e.target.value))
            revalidateLessons()
          }}
          className="flex-1 max-w-32"
        />
        <span className="text-sm text-gray-600 dark:text-gray-400 w-16">{delay}ms</span>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          revalidateLessons()
        }}
        placeholder="Search lessons..."
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      />

      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {['all', 'wip', 'done'].map(t => (
          <button
            key={t}
            onClick={() => {
              setTab(t)
              revalidateLessons()
            }}
            className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t ? 'bg-white dark:bg-gray-800 text-orange-700 dark:text-orange-300 shadow-sm' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {t === 'all' ? 'All' : t === 'wip' ? 'In Progress' : 'Completed'}
          </button>
        ))}
      </div>

      <Suspense
        fallback={
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
            ))}
          </div>
        }
      >
        <LessonList tab={tab} search={search} delay={delay} />
      </Suspense>
    </div>
  )
}

const beforePromiseCode = `const [task, setTask] = useState(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

useEffect(() => {
  let cancelled = false
  setLoading(true)

  fetchTask()
    .then(data => {
      if (!cancelled) {
        setTask(data)
        setLoading(false)
      }
    })
    .catch(err => { /* handle error */ })

  return () => { cancelled = true }
}, [])

if (loading) return <Spinner />
if (error) return <Error />
return <TaskDetails task={task} />`

const afterPromiseCode = `function TaskDetails({ taskPromise }) {
  const task = use(taskPromise) // Suspends until resolved
  return <div>{task.title}</div>
}

function TaskPage() {
  const taskPromise = fetchTask()
  return (
    <Suspense fallback={<Spinner />}>
      <TaskDetails taskPromise={taskPromise} />
    </Suspense>
  )
}`

const beforeContextCode = `function Component({ showDetails }) {
  // Must read at top level - always called
  // even when showDetails is false
  const theme = useContext(ThemeContext)

  if (!showDetails) {
    return <Summary />
  }
  return <Details theme={theme} />
}`

const afterContextCode = `function Component({ showDetails }) {
  if (!showDetails) {
    return <Summary />
  }

  // Can read conditionally!
  // Only called when showDetails is true
  const theme = use(ThemeContext)
  return <Details theme={theme} />
}`

const cachedPromiseCode = `// Data layer with cached promises (from async-react)
const promiseCache = new Map()

function getLessons(tab, search) {
  const key = \`\${tab}-\${search}\`

  if (!promiseCache.has(key)) {
    promiseCache.set(key, fetchLessons(tab, search))
  }

  return promiseCache.get(key)
}

function revalidate() {
  promiseCache.clear()
}

// Component reads with use()
function LessonList({ tab, search }) {
  const lessons = use(getLessons(tab, search))
  return lessons.map(item => <Lesson item={item} />)
}

// Parent wraps with Suspense
<Suspense fallback={<FallbackList />}>
  <LessonList tab={tab} search={search} />
</Suspense>`

const themes: Record<string, { primary: string; name: string }> = {
  Blue: { primary: '#3b82f6', name: 'Blue' },
  Green: { primary: '#22c55e', name: 'Green' },
  Purple: { primary: '#a855f7', name: 'Purple' },
}

export default function UseHookPage() {
  const [showDetails, setShowDetails] = useState(false)
  const [beforeTheme, setBeforeTheme] = useState(themes.Blue)
  const [afterTheme, setAfterTheme] = useState(themes.Blue)

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">use() Hook</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        React 19&apos;s <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">use()</code> hook lets you read
        resources (promises and context) directly during render.
      </p>

      <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-8">
        <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">Key Differences</h3>
        <ul className="text-orange-700 dark:text-orange-300 text-sm space-y-1">
          <li>• <strong>use(promise)</strong>: Suspends until promise resolves - no useEffect needed</li>
          <li>• <strong>use(context)</strong>: Can be called conditionally - not restricted to top level</li>
        </ul>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Reading Promises</h2>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="border-2 border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-950">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-4">Before React 19</h3>
          <CodeBlock code={beforePromiseCode} className="mb-4 max-h-48" />
          <BeforeUseHookPromise />
        </div>

        <div className="border-2 border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-950">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4">After React 19</h3>
          <CodeBlock code={afterPromiseCode} className="mb-4 max-h-48" />
          <AfterUseHookPromise />
        </div>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Reading Context Conditionally</h2>

      <div className="mb-4">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-md text-sm"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="border-2 border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-950">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-4">Before React 19</h3>
          <CodeBlock code={beforeContextCode} className="mb-4" />
          <div className="mb-3">
            <select
              value={beforeTheme.name}
              onChange={(e) => setBeforeTheme(themes[e.target.value])}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option>Blue</option>
              <option>Green</option>
              <option>Purple</option>
            </select>
          </div>
          <BeforeUseHookContext showDetails={showDetails} theme={beforeTheme} />
        </div>

        <div className="border-2 border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-950">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4">After React 19</h3>
          <CodeBlock code={afterContextCode} className="mb-4" />
          <div className="mb-3">
            <select
              value={afterTheme.name}
              onChange={(e) => setAfterTheme(themes[e.target.value])}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option>Blue</option>
              <option>Green</option>
              <option>Purple</option>
            </select>
          </div>
          <AfterUseHookContext showDetails={showDetails} theme={afterTheme} />
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">What Changed?</h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex gap-2">
            <span className="text-red-500">-</span>
            <span><code className="bg-white dark:bg-gray-900 px-1 rounded">useEffect</code> + <code className="bg-white dark:bg-gray-900 px-1 rounded">useState</code> for async data</span>
          </li>
          <li className="flex gap-2">
            <span className="text-red-500">-</span>
            <span><code className="bg-white dark:bg-gray-900 px-1 rounded">useContext</code> must be called at top level</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-500">+</span>
            <span><code className="bg-white dark:bg-gray-900 px-1 rounded">use(promise)</code> with Suspense handles loading automatically</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-500">+</span>
            <span><code className="bg-white dark:bg-gray-900 px-1 rounded">use(context)</code> can be called conditionally</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-500">+</span>
            <span>Cleaner component code - less boilerplate</span>
          </li>
        </ul>
      </div>

      <div className="border-2 border-indigo-200 dark:border-indigo-800 rounded-lg p-6 bg-indigo-50 dark:bg-indigo-950 mb-8">
        <h2 className="text-xl font-semibold text-indigo-900 dark:text-indigo-300 mb-3">The Cached Promise Pattern</h2>
        <p className="text-indigo-800 dark:text-indigo-300 text-sm mb-4">
          In async-react, data layers return <strong>cached promises</strong> that are Suspense-enabled.
          Components read data with <code className="bg-indigo-100 dark:bg-indigo-900 px-1 rounded">use()</code> and Suspense handles loading.
          When data changes, call <code className="bg-indigo-100 dark:bg-indigo-900 px-1 rounded">revalidate()</code> to clear the cache.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-indigo-800 dark:text-indigo-300 mb-2 text-sm">Pattern</h3>
            <CodeBlock code={cachedPromiseCode} className="max-h-80" />
          </div>

          <div>
            <h3 className="font-medium text-indigo-800 dark:text-indigo-300 mb-2 text-sm">Live Demo</h3>
            <div className="bg-white dark:bg-gray-800 rounded-md p-4 border border-indigo-100 dark:border-indigo-800">
              <CachedPromiseDemo />
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-indigo-100 dark:bg-indigo-900 rounded-md">
          <p className="text-indigo-900 dark:text-indigo-300 text-sm">
            <strong>Key insight:</strong> The data layer returns the same promise for identical queries.
            This means multiple components can <code className="bg-indigo-200 dark:bg-indigo-800 px-1 rounded">use()</code> the same
            data without duplicate requests. When you need fresh data, clear the cache and React will
            suspend again.
          </p>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Coordination with Suspense</h3>
        <p className="text-amber-700 dark:text-amber-300 text-sm">
          The <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">use()</code> hook is designed for Suspense.
          When reading a promise, the component suspends until data arrives. The Suspense boundary
          shows the fallback, and transitions can delay this fallback to avoid flash of loading state
          on fast networks.
        </p>
      </div>
    </div>
  )
}
