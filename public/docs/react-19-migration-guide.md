# React 19 Migration Evaluation & Planning Guide

This document provides instructions for AI coding agents to evaluate codebases for React 19 improvements and create comprehensive migration plans.

---

## Overview

React 19 introduces a fundamental shift in how async operations are handled. Instead of managing loading states manually, React 19 provides primitives that coordinate routing, data fetching, and UI components seamlessly. This guide helps identify migration opportunities and plan implementations.

---

## Phase 1: Codebase Analysis

### 1.1 Identify Manual Loading State Patterns

Search for patterns that React 19 can replace:

```typescript
// PATTERN: Manual loading state with useState
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState(null)

const handleSubmit = async () => {
  setIsLoading(true)
  try {
    await someAction()
  } catch (e) {
    setError(e)
  } finally {
    setIsLoading(false)
  }
}
```

**Search queries:**
- `setIsLoading` or `setLoading`
- `useState.*loading`
- `try.*catch.*finally` with state setters
- `isLoading && <Spinner` patterns

### 1.2 Identify Form Handling Patterns

Search for manual form submissions:

```typescript
// PATTERN: Manual form handling
const handleSubmit = (e) => {
  e.preventDefault()
  const formData = new FormData(e.target)
  // manual state management...
}

<form onSubmit={handleSubmit}>
```

**Search queries:**
- `onSubmit={` handlers
- `e.preventDefault()` in forms
- `FormData` with manual state updates
- Form validation with useState

### 1.3 Identify Optimistic Update Patterns

Search for manual rollback logic:

```typescript
// PATTERN: Manual optimistic updates
const previousValue = currentValue
setCurrentValue(newValue) // optimistic
try {
  await saveToServer(newValue)
} catch {
  setCurrentValue(previousValue) // rollback
}
```

**Search queries:**
- Variables named `previous*` or `*Backup`
- State setters followed by try/catch with reversions
- Comments mentioning "optimistic" or "rollback"

### 1.4 Identify Data Fetching Patterns

Search for useEffect-based fetching:

```typescript
// PATTERN: useEffect data fetching
useEffect(() => {
  const fetchData = async () => {
    setLoading(true)
    const data = await fetch('/api/...')
    setData(data)
    setLoading(false)
  }
  fetchData()
}, [dependency])
```

**Search queries:**
- `useEffect.*fetch`
- `useEffect.*async`
- Data loading with useState + useEffect pairs

### 1.5 Identify Debounce/Throttle Patterns

Search for input debouncing:

```typescript
// PATTERN: Manual debouncing
import { debounce } from 'lodash'
const debouncedSearch = useMemo(() => debounce(search, 300), [])
```

**Search queries:**
- `debounce` imports (lodash, custom utils)
- `setTimeout` for input delays
- `useMemo.*debounce`

### 1.6 Identify State Loss on Navigation

Search for conditional rendering that causes remounting:

```typescript
// PATTERN: State lost on tab switch
{activeTab === 'tab1' && <Component1 />}
{activeTab === 'tab2' && <Component2 />}
```

**Search queries:**
- Conditional rendering with `&&` operators
- Tab/panel switching logic
- Comments about "state persistence" or "remounting"

---

## Phase 2: React 19 Feature Mapping

### 2.1 useTransition - Replace Manual Loading States

**Before (React 18):**
```typescript
const [isLoading, setIsLoading] = useState(false)

const handleClick = async () => {
  setIsLoading(true)
  await performAction()
  setIsLoading(false)
}

return <Button disabled={isLoading}>{isLoading ? 'Loading...' : 'Submit'}</Button>
```

**After (React 19):**
```typescript
const [isPending, startTransition] = useTransition()

const handleClick = () => {
  startTransition(async () => {
    await performAction()
  })
}

return <Button disabled={isPending}>{isPending ? 'Loading...' : 'Submit'}</Button>
```

**Key benefits:**
- No manual state management
- Automatic pending state handling
- Per-component granularity
- Non-blocking async operations

### 2.2 useDeferredValue - Replace Debouncing

**Before (React 18):**
```typescript
import { debounce } from 'lodash'

const [searchTerm, setSearchTerm] = useState('')
const debouncedSearch = useMemo(() => debounce(setSearchTerm, 300), [])

// Input stays sluggish during expensive filtering
const filteredItems = expensiveFilter(items, searchTerm)
```

**After (React 19):**
```typescript
const [searchTerm, setSearchTerm] = useState('')
const deferredSearchTerm = useDeferredValue(searchTerm)

// Input stays responsive, filtering happens in background
const isStale = searchTerm !== deferredSearchTerm
const filteredItems = expensiveFilter(items, deferredSearchTerm)

return (
  <div style={{ opacity: isStale ? 0.7 : 1 }}>
    <FilteredList items={filteredItems} />
  </div>
)
```

**Key benefits:**
- No debounce library needed
- Input stays responsive
- Stale state detection for UI feedback
- Automatic scheduling by React

### 2.3 Form Actions - Replace Manual Form Handling

**Before (React 18):**
```typescript
const [error, setError] = useState(null)
const [isSubmitting, setIsSubmitting] = useState(false)

const handleSubmit = async (e) => {
  e.preventDefault()
  setIsSubmitting(true)
  setError(null)

  try {
    const formData = new FormData(e.target)
    await submitForm(formData)
  } catch (err) {
    setError(err.message)
  } finally {
    setIsSubmitting(false)
  }
}

return (
  <form onSubmit={handleSubmit}>
    <input name="email" />
    <button disabled={isSubmitting}>Submit</button>
    {error && <ErrorMessage>{error}</ErrorMessage>}
  </form>
)
```

**After (React 19):**
```typescript
// Server Action
async function submitFormAction(prevState, formData) {
  'use server'
  const email = formData.get('email')
  // validation and submission...
  return { success: true, message: 'Submitted!' }
}

// Client Component
function Form() {
  const [state, formAction] = useActionState(submitFormAction, { success: false })

  return (
    <form action={formAction}>
      <input name="email" />
      <SubmitButton />
      {state.message && <Message>{state.message}</Message>}
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return <button disabled={pending}>{pending ? 'Submitting...' : 'Submit'}</button>
}
```

**Key benefits:**
- Declarative form handling
- Automatic pending state via useFormStatus
- No preventDefault() needed
- Server-side validation support
- Child components access form state without prop drilling

### 2.4 useOptimistic - Replace Manual Rollback

**Before (React 18):**
```typescript
const [items, setItems] = useState(initialItems)

const toggleItem = async (id) => {
  const previousItems = [...items]

  // Optimistic update
  setItems(items.map(item =>
    item.id === id ? { ...item, completed: !item.completed } : item
  ))

  try {
    await updateItemOnServer(id)
  } catch {
    // Rollback on error
    setItems(previousItems)
    showErrorToast('Failed to update')
  }
}
```

**After (React 19):**
```typescript
const [items, setItems] = useState(initialItems)
const [optimisticItems, addOptimistic] = useOptimistic(items, (state, updatedItem) =>
  state.map(item => item.id === updatedItem.id ? updatedItem : item)
)

const toggleItem = (id) => {
  const item = items.find(i => i.id === id)
  const updatedItem = { ...item, completed: !item.completed }

  startTransition(async () => {
    addOptimistic(updatedItem) // Instant UI update
    await updateItemOnServer(id) // Auto-reverts on error
  })
}
```

**Key benefits:**
- Automatic rollback on error
- No manual backup/restore logic
- Clean separation of optimistic and actual state
- Works seamlessly with useTransition

### 2.5 use() Hook - Replace useEffect Data Fetching

**Before (React 18):**
```typescript
function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchUser() {
      setLoading(true)
      try {
        const data = await fetchUserData(userId)
        if (!cancelled) setUser(data)
      } catch (err) {
        if (!cancelled) setError(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchUser()
    return () => { cancelled = true }
  }, [userId])

  if (loading) return <Spinner />
  if (error) return <Error message={error.message} />
  return <Profile user={user} />
}
```

**After (React 19):**
```typescript
// Promise cache
const userCache = new Map()
function getUserPromise(userId) {
  if (!userCache.has(userId)) {
    userCache.set(userId, fetchUserData(userId))
  }
  return userCache.get(userId)
}

// Component
function UserProfile({ userId }) {
  const user = use(getUserPromise(userId))
  return <Profile user={user} />
}

// Parent with Suspense boundary
function UserProfilePage({ userId }) {
  return (
    <Suspense fallback={<Spinner />}>
      <ErrorBoundary fallback={<Error />}>
        <UserProfile userId={userId} />
      </ErrorBoundary>
    </Suspense>
  )
}
```

**Key benefits:**
- No useEffect boilerplate
- No race condition handling
- Suspense handles loading states
- ErrorBoundary handles errors
- Promise caching prevents duplicate fetches
- Conditional context reading now possible

### 2.6 Activity Component - Preserve Hidden State

**Before (React 18):**
```typescript
// State lost when switching tabs
function TabbedView({ activeTab }) {
  return (
    <>
      {activeTab === 'editor' && <CodeEditor />}
      {activeTab === 'preview' && <Preview />}
    </>
  )
}
```

**After (React 19):**
```typescript
function TabbedView({ activeTab }) {
  return (
    <>
      <Activity mode={activeTab === 'editor' ? 'visible' : 'hidden'}>
        <CodeEditor />
      </Activity>
      <Activity mode={activeTab === 'preview' ? 'visible' : 'hidden'}>
        <Preview />
      </Activity>
    </>
  )
}
```

**Key benefits:**
- State preserved when hidden (form inputs, scroll position, etc.)
- Effects paused when hidden (saves resources)
- Instant back-navigation without re-fetching
- Better perceived performance

### 2.7 View Transitions - Replace Animation Libraries

**Before (React 18):**
```typescript
import { motion, AnimatePresence } from 'framer-motion'

function ListItem({ item, onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => onSelect(item)}
    >
      {item.name}
    </motion.div>
  )
}
```

**After (React 19):**
```typescript
function ListItem({ item, onSelect }) {
  const handleSelect = () => {
    document.startViewTransition(() => {
      onSelect(item)
    })
  }

  return (
    <div
      style={{ viewTransitionName: `item-${item.id}` }}
      onClick={handleSelect}
    >
      {item.name}
    </div>
  )
}

// CSS
::view-transition-old(item-*) {
  animation: fade-out 0.15s ease-out;
}
::view-transition-new(item-*) {
  animation: fade-in 0.25s ease-in;
}
```

**Key benefits:**
- Browser-native animations (compositor thread)
- Smaller bundle size (no animation library)
- Automatic list morphing with unique names
- Works with any state change

---

## Phase 3: Migration Planning

### 3.1 Priority Assessment

Evaluate each migration opportunity by:

1. **Impact**: How much code does this simplify?
2. **Risk**: How likely is this to introduce bugs?
3. **Effort**: How much refactoring is required?
4. **Dependencies**: What must be migrated first?

### 3.2 Recommended Migration Order

1. **useTransition** - Start here, lowest risk, immediate benefits
2. **useDeferredValue** - Replace debounce utilities, isolated changes
3. **Form Actions** - Migrate forms one at a time
4. **useOptimistic** - Add to forms/lists with optimistic patterns
5. **use() hook** - Requires Suspense boundaries, larger refactor
6. **Activity** - Requires component restructuring
7. **View Transitions** - CSS additions, optional enhancement

### 3.3 Migration Checklist

For each component being migrated:

- [ ] Identify current async patterns
- [ ] Map to React 19 equivalent
- [ ] Check for Suspense boundaries (if using use())
- [ ] Check for ErrorBoundary (if using use())
- [ ] Update tests to handle async behavior
- [ ] Remove unused loading state variables
- [ ] Remove debounce/throttle utilities if replaced
- [ ] Clean up try/catch blocks if using optimistic updates

---

## Phase 4: Best Practices & Patterns

### 4.1 Action Prop Pattern

Components should accept async actions as props and manage their own pending state:

```typescript
function ActionButton({ action, children }) {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      await action()
    })
  }

  return (
    <button onClick={handleClick} disabled={isPending}>
      {isPending ? 'Loading...' : children}
    </button>
  )
}

// Usage
<ActionButton action={() => saveData(id)}>Save</ActionButton>
```

### 4.2 Delayed Loading Pattern (150ms threshold)

Prevent flash of loading state on fast operations:

```typescript
function useDelayedPending(isPending, delay = 150) {
  const [showPending, setShowPending] = useState(false)

  useEffect(() => {
    if (isPending) {
      const timer = setTimeout(() => setShowPending(true), delay)
      return () => clearTimeout(timer)
    } else {
      setShowPending(false)
    }
  }, [isPending, delay])

  return showPending
}

// Usage
const [isPending, startTransition] = useTransition()
const showLoading = useDelayedPending(isPending)
```

### 4.3 Promise Cache Pattern

Cache promises for Suspense-compatible data fetching:

```typescript
const cache = new Map()

function getDataPromise(key, fetcher) {
  if (!cache.has(key)) {
    cache.set(key, fetcher())
  }
  return cache.get(key)
}

// Revalidation
function invalidateCache(key) {
  cache.delete(key)
}

// Usage in component
const data = use(getDataPromise(`user-${id}`, () => fetchUser(id)))
```

### 4.4 Prefetch with Timeout Pattern

Don't block navigation waiting for data:

```typescript
async function navigateWithPrefetch(destination, prefetchFn) {
  await Promise.race([
    prefetchFn(),
    new Promise(resolve => setTimeout(resolve, 1000))
  ])
  navigate(destination)
}
```

### 4.5 Stale UI Detection

Show visual feedback when data is stale:

```typescript
const deferredValue = useDeferredValue(value)
const isStale = value !== deferredValue

return (
  <div style={{ opacity: isStale ? 0.7 : 1, transition: 'opacity 0.2s' }}>
    <ExpensiveList data={deferredValue} />
  </div>
)
```

### 4.6 Network-Aware UI Behavior

Adapt UI based on network conditions:

- **Fast (<150ms)**: No loading indicator, instant feedback
- **Moderate (150ms-1s)**: Show loading indicator, maintain interactivity
- **Slow (>1s)**: Show skeleton/placeholder, consider prefetching

---

## Phase 5: Testing Considerations

### 5.1 Async Testing Updates

React 19 async patterns require updated testing approaches:

```typescript
// Before: Waiting for loading state
await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument())

// After: Wait for actual content
await waitFor(() => expect(screen.getByText('User Name')).toBeInTheDocument())
```

### 5.2 Suspense Testing

Wrap components in Suspense for testing:

```typescript
render(
  <Suspense fallback={<div>Loading...</div>}>
    <ComponentUsingUse />
  </Suspense>
)
```

### 5.3 Transition Testing

Test transition behavior:

```typescript
const { result } = renderHook(() => useTransition())
const [isPending, startTransition] = result.current

act(() => {
  startTransition(async () => {
    await someAsyncOperation()
  })
})

expect(result.current[0]).toBe(true) // isPending during transition
```

---

## Phase 6: Next.js Specific Guidance

### 6.1 Server Components vs Client Components

React 19 features have different applicability based on component type:

| Feature | Server Components | Client Components |
|---------|-------------------|-------------------|
| `useTransition` | Not available | Full support |
| `useDeferredValue` | Not available | Full support |
| `useActionState` | Not available | Full support |
| `useOptimistic` | Not available | Full support |
| `useFormStatus` | Not available | Full support |
| `use()` | For context only | Full support |
| Server Actions | Define here | Import and use |
| Suspense | Works for streaming | Works for client data |

### 6.2 Server Actions in Next.js App Router

Server Actions are the recommended approach for mutations in Next.js:

```typescript
// app/actions.ts
'use server'

import { revalidatePath } from 'next/cache'

export async function createItemAction(prevState: FormState, formData: FormData) {
  const title = formData.get('title') as string

  // Validation
  if (!title || title.length < 3) {
    return { success: false, message: 'Title must be at least 3 characters' }
  }

  // Database operation
  await db.items.create({ data: { title } })

  // Revalidate cached data
  revalidatePath('/items')

  return { success: true, message: 'Item created!' }
}
```

```typescript
// app/items/new/page.tsx
'use client'

import { useActionState } from 'react'
import { createItemAction } from '@/app/actions'

export default function NewItemForm() {
  const [state, formAction] = useActionState(createItemAction, { success: false })

  return (
    <form action={formAction}>
      <input name="title" />
      <SubmitButton />
      {state.message && <p>{state.message}</p>}
    </form>
  )
}
```

### 6.3 Data Fetching Patterns

**Server Components (Recommended for initial data):**
```typescript
// app/items/page.tsx (Server Component - no 'use client')
async function ItemsPage() {
  const items = await db.items.findMany() // Direct database access

  return (
    <div>
      <h1>Items</h1>
      <ItemList items={items} />
    </div>
  )
}
```

**Client Components with use() (For dynamic/interactive data):**
```typescript
// components/ItemDetail.tsx
'use client'

import { use, Suspense } from 'react'

const itemCache = new Map()
function getItemPromise(id: string) {
  if (!itemCache.has(id)) {
    itemCache.set(id, fetch(`/api/items/${id}`).then(r => r.json()))
  }
  return itemCache.get(id)
}

function ItemDetail({ id }: { id: string }) {
  const item = use(getItemPromise(id))
  return <div>{item.title}</div>
}

// Usage with Suspense
function ItemPage({ id }: { id: string }) {
  return (
    <Suspense fallback={<ItemSkeleton />}>
      <ItemDetail id={id} />
    </Suspense>
  )
}
```

### 6.4 Streaming with Suspense

Next.js App Router supports streaming Server Components with Suspense:

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react'

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* Streams immediately */}
      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection />
      </Suspense>

      {/* Streams when ready */}
      <Suspense fallback={<ChartSkeleton />}>
        <AnalyticsChart />
      </Suspense>
    </div>
  )
}

// Each component fetches independently
async function StatsSection() {
  const stats = await fetchStats() // Can be slow
  return <Stats data={stats} />
}

async function AnalyticsChart() {
  const data = await fetchAnalytics() // Can be slow
  return <Chart data={data} />
}
```

### 6.5 Revalidation Patterns

**Path-based revalidation:**
```typescript
'use server'

import { revalidatePath } from 'next/cache'

export async function updateItemAction(id: string, data: FormData) {
  await db.items.update({ where: { id }, data: { ... } })

  revalidatePath('/items')        // Revalidate list page
  revalidatePath(`/items/${id}`)  // Revalidate detail page
}
```

**Tag-based revalidation:**
```typescript
// Fetching with tags
async function getItems() {
  const res = await fetch('/api/items', { next: { tags: ['items'] } })
  return res.json()
}

// Revalidating by tag
'use server'
import { revalidateTag } from 'next/cache'

export async function createItemAction() {
  await db.items.create({ ... })
  revalidateTag('items') // Invalidates all fetches tagged 'items'
}
```

### 6.6 Loading UI and Error Handling

**File-based loading states:**
```
app/
  items/
    page.tsx        // Main content
    loading.tsx     // Automatic Suspense fallback
    error.tsx       // Automatic error boundary
    not-found.tsx   // 404 handling
```

```typescript
// app/items/loading.tsx
export default function Loading() {
  return <ItemListSkeleton />
}

// app/items/error.tsx
'use client'

export default function Error({
  error,
  reset
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

### 6.7 Parallel Routes for Activity-like Behavior

Use parallel routes to keep multiple views mounted:

```
app/
  @sidebar/
    default.tsx
    page.tsx
  @main/
    default.tsx
    page.tsx
  layout.tsx
```

```typescript
// app/layout.tsx
export default function Layout({
  sidebar,
  main,
}: {
  sidebar: React.ReactNode
  main: React.ReactNode
}) {
  return (
    <div className="flex">
      <aside>{sidebar}</aside>
      <main>{main}</main>
    </div>
  )
}
```

### 6.8 Route Handlers vs Server Actions

**Use Server Actions for:**
- Form submissions
- Mutations triggered by user interactions
- Operations that need to revalidate cached data

**Use Route Handlers for:**
- Third-party webhook endpoints
- APIs consumed by external clients
- Operations requiring specific HTTP methods/headers

```typescript
// app/api/webhooks/stripe/route.ts
export async function POST(request: Request) {
  const payload = await request.text()
  const sig = request.headers.get('stripe-signature')

  // Verify and process webhook
  const event = stripe.webhooks.constructEvent(payload, sig, secret)
  await handleStripeEvent(event)

  return new Response('OK', { status: 200 })
}
```

### 6.9 Migration Search Patterns for Next.js

**Find API routes that could become Server Actions:**
- `app/api/**/route.ts` with simple POST handlers
- `pages/api/**/*.ts` (Pages Router migration)

**Find client-side fetching that could move to Server Components:**
- `useEffect.*fetch` in files without `'use server'` or `'use client'`
- `useState` + `useEffect` pairs for initial data

**Find components that need 'use client' directive:**
- Components using hooks (`useState`, `useEffect`, `useTransition`, etc.)
- Components using browser APIs
- Components with event handlers

---

## Appendix: Migration Quick Reference

| React 18 Pattern | React 19 Replacement | Search Terms |
|-----------------|---------------------|--------------|
| `useState(false)` for loading | `useTransition` | `setIsLoading`, `setLoading` |
| `debounce()` utilities | `useDeferredValue` | `debounce`, `throttle`, `lodash` |
| `onSubmit` + `preventDefault` | Form Actions | `onSubmit={`, `preventDefault()` |
| Manual rollback logic | `useOptimistic` | `previous`, `backup`, `rollback` |
| `useEffect` + `useState` fetch | `use()` + Suspense | `useEffect.*fetch`, `useEffect.*async` |
| Conditional render `{show && <C/>}` | `<Activity mode={}>` | `&&` with state-dependent JSX |
| Framer Motion / animation libs | View Transitions | `framer-motion`, `@react-spring` |

---

## Document Version

- **Version**: 1.0
- **Based on**: React 19.2, Next.js 16
- **Last Updated**: December 2024
