'use client'

import { useState, useEffect, Suspense, use, startTransition } from 'react'
import { CodeBlock } from '@/components/react-19/CodeBlock'

function TabContentWithState({ label, color }: { label: string; color: string }) {
  const [count, setCount] = useState(0)
  const [text, setText] = useState('')
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`p-4 rounded-lg border-2 ${color}`}>
      <h4 className="font-semibold mb-4">{label} Tab Content</h4>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Counter (click to increment):</p>
          <button
            onClick={() => setCount(c => c + 1)}
            className="px-4 py-2 bg-gray-800 text-white rounded-md text-sm"
          >
            Count: {count}
          </button>
        </div>

        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Form input (type something):</p>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type here..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Timer (seconds since mount):</p>
          <div className="text-2xl font-mono font-bold text-gray-800 dark:text-gray-200">
            {seconds}s
          </div>
        </div>
      </div>
    </div>
  )
}

function BeforeActivity() {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all')

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {(['all', 'active', 'completed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'all' && (
        <TabContentWithState label="All Tasks" color="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950" />
      )}
      {activeTab === 'active' && (
        <TabContentWithState label="Active Tasks" color="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950" />
      )}
      {activeTab === 'completed' && (
        <TabContentWithState label="Completed Tasks" color="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900" />
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        Switch tabs and notice: counter resets, input clears, timer restarts.
      </p>
    </div>
  )
}

function Activity({ mode, children }: { mode: 'visible' | 'hidden'; children: React.ReactNode }) {
  return (
    <div style={{ display: mode === 'hidden' ? 'none' : 'block' }}>
      {children}
    </div>
  )
}

function AfterActivity() {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all')

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {(['all', 'active', 'completed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <Activity mode={activeTab === 'all' ? 'visible' : 'hidden'}>
        <TabContentWithState label="All Tasks" color="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950" />
      </Activity>
      <Activity mode={activeTab === 'active' ? 'visible' : 'hidden'}>
        <TabContentWithState label="Active Tasks" color="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950" />
      </Activity>
      <Activity mode={activeTab === 'completed' ? 'visible' : 'hidden'}>
        <TabContentWithState label="Completed Tasks" color="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900" />
      </Activity>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        Switch tabs and notice: counter preserved, input retained, timer continues!
      </p>
    </div>
  )
}

type Page = 'home' | 'profile' | 'settings'

type PageData = {
  title: string
  content: string
  loadTime: number
}

const pageDataCache = new Map<Page, Promise<PageData>>()

function fetchPageData(page: Page, delay: number): Promise<PageData> {
  const key = `${page}-${delay}`
  if (!pageDataCache.has(page)) {
    pageDataCache.set(page, new Promise(resolve => {
      setTimeout(() => {
        resolve({
          title: page.charAt(0).toUpperCase() + page.slice(1),
          content: `This is the ${page} page content. It was loaded after ${delay}ms.`,
          loadTime: delay,
        })
      }, delay)
    }))
  }
  return pageDataCache.get(page)!
}

function prefetchPage(page: Page, delay: number) {
  fetchPageData(page, delay)
}

function clearPageCache() {
  pageDataCache.clear()
}

function PageContent({ page, delay }: { page: Page; delay: number }) {
  const data = use(fetchPageData(page, delay))

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
      <h3 className="font-semibold text-lg mb-2">{data.title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{data.content}</p>
    </div>
  )
}

function PrefetchingDemo() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [delay, setDelay] = useState(800)
  const [prefetchEnabled, setPrefetchEnabled] = useState(true)

  const pages: Page[] = ['home', 'profile', 'settings']

  const navigateTo = (page: Page) => {
    startTransition(() => {
      setCurrentPage(page)
    })
  }

  const handleHover = (page: Page) => {
    if (prefetchEnabled && page !== currentPage) {
      prefetchPage(page, delay)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">Load delay:</label>
          <input
            type="range"
            min={200}
            max={2000}
            value={delay}
            onChange={(e) => {
              setDelay(parseInt(e.target.value))
              clearPageCache()
            }}
            className="w-24"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400 w-16">{delay}ms</span>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <input
            type="checkbox"
            checked={prefetchEnabled}
            onChange={(e) => setPrefetchEnabled(e.target.checked)}
          />
          Prefetch on hover
        </label>

        <button
          onClick={() => clearPageCache()}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
        >
          Clear cache
        </button>
      </div>

      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {pages.map(page => (
          <button
            key={page}
            onClick={() => navigateTo(page)}
            onMouseEnter={() => handleHover(page)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentPage === page
                ? 'bg-white dark:bg-gray-800 text-pink-700 dark:text-pink-300 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            {page.charAt(0).toUpperCase() + page.slice(1)}
          </button>
        ))}
      </div>

      <Suspense
        fallback={
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-2" />
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3" />
          </div>
        }
      >
        <PageContent page={currentPage} delay={delay} />
      </Suspense>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        {prefetchEnabled
          ? 'Hover over a tab to prefetch its data before clicking'
          : 'Prefetching disabled - notice the loading state when switching'}
      </div>
    </div>
  )
}

const beforeCode = `function TabPanel() {
  const [activeTab, setActiveTab] = useState('all')

  return (
    <div>
      <TabButtons active={activeTab} onChange={setActiveTab} />

      {/* Conditional rendering = unmount/remount */}
      {activeTab === 'all' && <AllTasksView />}
      {activeTab === 'active' && <ActiveTasksView />}
      {activeTab === 'completed' && <CompletedTasksView />}
    </div>
  )
}

// Each view loses state when hidden:
// - Form inputs cleared
// - Scroll position lost
// - Timers restart
// - Effects re-run`

const afterCode = `// With React's Activity API
import { Activity } from 'react'

function TabPanel() {
  const [activeTab, setActiveTab] = useState('all')

  return (
    <div>
      <TabButtons active={activeTab} onChange={setActiveTab} />

      {/* Activity preserves state when hidden */}
      <Activity mode={activeTab === 'all' ? 'visible' : 'hidden'}>
        <AllTasksView />
      </Activity>
      <Activity mode={activeTab === 'active' ? 'visible' : 'hidden'}>
        <ActiveTasksView />
      </Activity>
      <Activity mode={activeTab === 'completed' ? 'visible' : 'hidden'}>
        <CompletedTasksView />
      </Activity>
    </div>
  )
}

// State preserved when hidden:
// - Form inputs retained
// - Scroll position kept
// - Timers continue (effects paused)
// - Instant switch back`

const prefetchPatternCode = `// Prefetching pattern from async-react
// Keep pages "warm" while user navigates

const pageCache = new Map()

function prefetchPage(page) {
  if (!pageCache.has(page)) {
    pageCache.set(page, fetchPageData(page))
  }
}

function PageContent({ page }) {
  const data = use(pageCache.get(page))
  return <div>{data.content}</div>
}

// Navigation with prefetch on hover
function NavLink({ page }) {
  return (
    <button
      onClick={() => navigate(page)}
      onMouseEnter={() => prefetchPage(page)}
    >
      {page}
    </button>
  )
}

// Combined with Activity for instant back-nav
<Activity mode={page === 'home' ? 'visible' : 'hidden'}>
  <Suspense fallback={<Loading />}>
    <PageContent page="home" />
  </Suspense>
</Activity>`

export default function ActivityPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Activity</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        React&apos;s <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">Activity</code> component keeps
        child components mounted but hidden, preserving their state.
      </p>

      <div className="bg-pink-50 dark:bg-pink-950 border border-pink-200 dark:border-pink-800 rounded-lg p-4 mb-8">
        <h3 className="font-semibold text-pink-800 dark:text-pink-300 mb-2">Try This</h3>
        <ol className="text-pink-700 dark:text-pink-300 text-sm space-y-1">
          <li>1. In both panels, click the counter a few times</li>
          <li>2. Type something in the input field</li>
          <li>3. Wait for the timer to count up</li>
          <li>4. Switch to another tab, then switch back</li>
          <li>5. Notice: &quot;Before&quot; loses all state, &quot;After&quot; preserves it</li>
        </ol>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="border-2 border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-950">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-4">Before React 19</h2>
          <CodeBlock code={beforeCode} className="mb-4 max-h-56" />
          <BeforeActivity />
        </div>

        <div className="border-2 border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-950">
          <h2 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4">After React 19</h2>
          <CodeBlock code={afterCode} className="mb-4 max-h-56" />
          <AfterActivity />
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">What Changed?</h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex gap-2">
            <span className="text-red-500">-</span>
            <span>Conditional rendering unmounts components, losing all state</span>
          </li>
          <li className="flex gap-2">
            <span className="text-red-500">-</span>
            <span>Effects re-run when switching back to a tab</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-500">+</span>
            <span><code className="bg-white dark:bg-gray-800 px-1 rounded">Activity</code> keeps components mounted but hidden</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-500">+</span>
            <span>State is preserved: form inputs, scroll position, timers</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-500">+</span>
            <span>Effects are paused when hidden (reduced resource usage)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-500">+</span>
            <span>Instant switch - no re-render cost when showing again</span>
          </li>
        </ul>
      </div>

      <div className="border-2 border-indigo-200 dark:border-indigo-800 rounded-lg p-6 bg-indigo-50 dark:bg-indigo-950 mb-8">
        <h2 className="text-xl font-semibold text-indigo-900 dark:text-indigo-300 mb-3">The Prefetching Pattern</h2>
        <p className="text-indigo-800 dark:text-indigo-300 text-sm mb-4">
          In async-react, Activity works with prefetching to enable instant navigation.
          Hover over a link to start loading its data. Combined with Activity, previously visited
          pages stay &quot;warm&quot; - going back is instant because the component is still mounted.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-indigo-800 dark:text-indigo-300 mb-2 text-sm">Pattern</h3>
            <CodeBlock code={prefetchPatternCode} className="max-h-80" />
          </div>

          <div>
            <h3 className="font-medium text-indigo-800 dark:text-indigo-300 mb-2 text-sm">Live Demo</h3>
            <div className="bg-white dark:bg-gray-800 rounded-md p-4 border border-indigo-100 dark:border-indigo-800">
              <PrefetchingDemo />
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-indigo-100 dark:bg-indigo-900 rounded-md">
          <p className="text-indigo-900 dark:text-indigo-100 text-sm">
            <strong>Key insight:</strong> Prefetching on hover starts loading data before the user clicks.
            With Activity keeping pages mounted, navigation feels instant in both directions - forward
            (prefetched) and backward (preserved state).
          </p>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">How It Works</h3>
        <p className="text-amber-700 dark:text-amber-300 text-sm">
          The <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">Activity</code> component keeps children mounted
          in the DOM but hidden when <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">mode=&quot;hidden&quot;</code>.
          Effects are paused when hidden, reducing resource usage while preserving all component state.
          Combined with data prefetching, this enables the smooth navigation experience demonstrated
          in async-react.
        </p>
      </div>
    </div>
  )
}
