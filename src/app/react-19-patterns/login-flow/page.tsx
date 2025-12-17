'use client'

import { useState, useTransition, Suspense, use } from 'react'
import { useRouter } from 'next/navigation'
import { simulateNetworkRequest } from '@/components/react-19/NetworkDebugger'
import { CodeBlock } from '@/components/react-19/CodeBlock'

interface UserData {
  user: {
    id: string
    username: string
    email: string
    displayName: string
  }
  recentTasks: { id: string; title: string; completed: boolean }[]
  stats: {
    totalTasks: number
    completedTasks: number
    activeTasks: number
  }
}

const userDataCache = new Map<string, Promise<UserData>>()

async function fetchUserData(userId: string, delay: number): Promise<UserData> {
  await simulateNetworkRequest('/api/user', delay)
  return {
    user: {
      id: userId,
      username: userId.replace('user-', ''),
      email: `${userId.replace('user-', '')}@example.com`,
      displayName: userId.replace('user-', '').charAt(0).toUpperCase() + userId.replace('user-', '').slice(1),
    },
    recentTasks: [
      { id: '1', title: 'Review pull request #42', completed: false },
      { id: '2', title: 'Update API documentation', completed: false },
      { id: '3', title: 'Fix mobile navigation bug', completed: true },
    ],
    stats: {
      totalTasks: 12,
      completedTasks: 5,
      activeTasks: 7,
    },
  }
}

function getUserData(userId: string, delay: number): Promise<UserData> {
  if (!userDataCache.has(userId)) {
    userDataCache.set(userId, fetchUserData(userId, delay))
  }
  return userDataCache.get(userId)!
}

function prefetchUserData(userId: string, delay: number, timeout: number): Promise<void> {
  const fetchPromise = getUserData(userId, delay)
  return Promise.race([
    fetchPromise.then(() => {}),
    new Promise<void>(resolve => setTimeout(resolve, timeout))
  ])
}

function revalidateUserData(): void {
  userDataCache.clear()
}

async function login(username: string, password: string, delay: number): Promise<{ success: boolean; userId?: string; error?: string }> {
  await simulateNetworkRequest('/api/auth/login', delay)

  if (!username || username.trim().length === 0) {
    return { success: false, error: 'Username is required' }
  }

  if (!password || password.length < 4) {
    return { success: false, error: 'Password must be at least 4 characters' }
  }

  if (password === 'wrong') {
    return { success: false, error: 'Invalid username or password' }
  }

  return { success: true, userId: `user-${username.toLowerCase()}` }
}

function DashboardContent({ userDataPromise }: { userDataPromise: Promise<UserData> }) {
  const data = use(userDataPromise)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
          {data.user.displayName.charAt(0)}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Welcome, {data.user.displayName}!
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{data.user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.stats.totalTasks}</div>
          <div className="text-sm text-blue-700 dark:text-blue-300">Total Tasks</div>
        </div>
        <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{data.stats.completedTasks}</div>
          <div className="text-sm text-green-700 dark:text-green-300">Completed</div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{data.stats.activeTasks}</div>
          <div className="text-sm text-orange-700 dark:text-orange-300">Active</div>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Recent Tasks</h4>
        <ul className="space-y-2">
          {data.recentTasks.map(task => (
            <li key={task.id} className="flex items-center gap-2 text-sm">
              <span className={`w-2 h-2 rounded-full ${task.completed ? 'bg-green-500' : 'bg-orange-500'}`} />
              <span className={task.completed ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'}>
                {task.title}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function DashboardFallback() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-2">
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
        ))}
      </div>
    </div>
  )
}

const beforeCode = `async function handleLogin(e) {
  e.preventDefault()
  setIsLoading(true)
  setError(null)

  try {
    // 1. Login
    const { userId } = await login(username, password)

    // 2. Fetch user data (blocking)
    const userData = await fetchUserData(userId)
    setUserData(userData)

    // 3. Navigate
    router.push('/dashboard')
  } catch (err) {
    setError(err.message)
  } finally {
    setIsLoading(false)
  }
}`

const afterCode = `async function submitAction() {
  // 1. Authenticate
  const { userId } = await login(username, password)

  // 2. Prefetch with timeout (non-blocking)
  await Promise.race([
    prefetchUserData(userId),
    new Promise(r => setTimeout(r, 1000))
  ])

  // 3. Navigate (Suspense handles loading)
  setLoggedInUserId(userId)
}

// Button uses action prop - owns its pending state
<Button action={submitAction}>Login</Button>

// Dashboard reads prefetched data via use()
<Suspense fallback={<Skeleton />}>
  <Dashboard userDataPromise={getUserData(userId)} />
</Suspense>`

export default function LoginFlowPage() {
  const [view, setView] = useState<'login' | 'dashboard'>('login')
  const [username, setUsername] = useState('demo')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState<string | null>(null)
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [loginDelay, setLoginDelay] = useState(800)
  const [prefetchDelay, setPrefetchDelay] = useState(600)
  const [prefetchTimeout, setPrefetchTimeout] = useState(1000)

  const handleSubmit = async () => {
    setError(null)

    const result = await login(username, password, loginDelay)

    if (!result.success) {
      setError(result.error || 'Login failed')
      return
    }

    await prefetchUserData(result.userId!, prefetchDelay, prefetchTimeout)

    setLoggedInUserId(result.userId!)
    setView('dashboard')
  }

  const handleLogout = () => {
    revalidateUserData()
    setLoggedInUserId(null)
    setView('login')
    setError(null)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Login Flow</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Demonstrates the <strong>Auth → Prefetch → Navigate</strong> pattern where authentication,
        data prefetching, and navigation are coordinated within a single transition.
      </p>

      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 mb-3">
          The Prefetch with Timeout Pattern
        </h2>
        <p className="text-emerald-800 dark:text-emerald-200 text-sm mb-4">
          After authentication, we prefetch user data but <strong>don&apos;t wait forever</strong>.
          Using <code className="bg-emerald-100 dark:bg-emerald-900 px-1 rounded">Promise.race()</code> with a timeout
          ensures navigation proceeds even on slow networks. Suspense fallbacks display while data loads.
        </p>
        <CodeBlock code={`await Promise.race([
  prefetchUserData(userId),           // Start fetching
  new Promise(r => setTimeout(r, 1000)) // But don't wait >1s
])
// Navigation proceeds, Suspense handles the rest`} />
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {view === 'login' ? 'Login' : 'Dashboard'}
            </h3>
            {view === 'dashboard' && (
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Logout
              </button>
            )}
          </div>

          {view === 'login' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                startTransition(() => {
                  handleSubmit()
                })
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Use &quot;wrong&quot; to simulate auth error
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          ) : (
            <Suspense fallback={<DashboardFallback />}>
              {loggedInUserId && (
                <DashboardContent userDataPromise={getUserData(loggedInUserId, prefetchDelay)} />
              )}
            </Suspense>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Network Simulation</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Login API</span>
                  <span className="text-gray-500 dark:text-gray-400 font-mono">{loginDelay}ms</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={3000}
                  step={100}
                  value={loginDelay}
                  onChange={(e) => setLoginDelay(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">User Data API</span>
                  <span className="text-gray-500 dark:text-gray-400 font-mono">{prefetchDelay}ms</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={3000}
                  step={100}
                  value={prefetchDelay}
                  onChange={(e) => setPrefetchDelay(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Prefetch Timeout</span>
                  <span className="text-gray-500 dark:text-gray-400 font-mono">{prefetchTimeout}ms</span>
                </div>
                <input
                  type="range"
                  min={500}
                  max={3000}
                  step={100}
                  value={prefetchTimeout}
                  onChange={(e) => setPrefetchTimeout(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">Try These Scenarios</h4>
            <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 mt-1.5 rounded-full bg-green-500" />
                <span><strong>Fast:</strong> Login 500ms, User Data 400ms → Instant dashboard</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 mt-1.5 rounded-full bg-yellow-500" />
                <span><strong>Moderate:</strong> Login 800ms, User Data 800ms → Brief skeleton</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 mt-1.5 rounded-full bg-red-500" />
                <span><strong>Slow:</strong> Login 800ms, User Data 2500ms → Navigation proceeds, skeleton shows while data loads</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Before vs After</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-red-400 font-medium mb-2 text-sm">Before: Sequential Blocking</h4>
            <p className="text-gray-400 text-xs mb-3">
              Login blocks on data fetch. Users wait for everything to complete before seeing anything.
            </p>
            <CodeBlock code={beforeCode} />
          </div>
          <div>
            <h4 className="text-green-400 font-medium mb-2 text-sm">After: Prefetch with Timeout</h4>
            <p className="text-gray-400 text-xs mb-3">
              Prefetch starts but navigation proceeds after timeout. Suspense handles remaining load.
            </p>
            <CodeBlock code={afterCode} />
          </div>
        </div>
      </div>

      <div className="mt-8 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-3">
          Key Concepts
        </h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="bg-white dark:bg-gray-800 rounded-md p-3">
            <div className="font-medium text-indigo-900 dark:text-indigo-100 mb-1">Auth-Gated Resources</div>
            <p className="text-indigo-700 dark:text-indigo-300 text-xs">
              User data can only be fetched AFTER authentication succeeds. Prefetching happens post-login.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-md p-3">
            <div className="font-medium text-indigo-900 dark:text-indigo-100 mb-1">Graceful Degradation</div>
            <p className="text-indigo-700 dark:text-indigo-300 text-xs">
              If prefetch is slow, navigation proceeds anyway. Suspense fallbacks keep users informed.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-md p-3">
            <div className="font-medium text-indigo-900 dark:text-indigo-100 mb-1">Cached Promises</div>
            <p className="text-indigo-700 dark:text-indigo-300 text-xs">
              Data layer caches promises, not resolved values. Multiple components can read the same fetch.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
