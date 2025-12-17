'use client'

import { useState, useActionState, useTransition, ReactNode } from 'react'
import { useFormStatus } from 'react-dom'
import { createTaskAction } from '@/lib/react-19-demo/actions'
import { FormState } from '@/lib/react-19-demo/types'
import { useDelayedPending } from '@/hooks/useDelayedPending'
import { CodeBlock } from '@/components/react-19/CodeBlock'

function BeforeFormActions() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [tasks, setTasks] = useState<{ id: string; title: string }[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (!title.trim()) {
        setError('Title is required')
        setIsSubmitting(false)
        return
      }

      if (title.length < 3) {
        setError('Title must be at least 3 characters')
        setIsSubmitting(false)
        return
      }

      setTasks(prev => [...prev, { id: Date.now().toString(), title }])
      setSuccess('Task created successfully!')
      setTitle('')
      setDescription('')
    } catch {
      setError('Failed to create task')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="Enter task title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="Enter description"
            rows={2}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create Task'}
        </button>
      </form>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-300">{error}</p>
      )}
      {success && (
        <p className="mt-2 text-sm text-green-600 dark:text-green-300">{success}</p>
      )}
      {tasks.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Created tasks:</p>
          <ul className="text-sm space-y-1">
            {tasks.map(task => (
              <li key={task.id} className="text-gray-700 dark:text-gray-300">• {task.title}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
    >
      {pending ? 'Creating...' : 'Create Task'}
    </button>
  )
}

function AfterFormActions() {
  const [tasks, setTasks] = useState<{ id: string; title: string }[]>([])
  const initialState: FormState = { success: false, message: '' }

  const [state, formAction] = useActionState(
    async (prevState: FormState, formData: FormData) => {
      const result = await createTaskAction(prevState, formData)
      if (result.success) {
        const title = formData.get('title') as string
        setTasks(prev => [...prev, { id: Date.now().toString(), title }])
      }
      return result
    },
    initialState
  )

  return (
    <div>
      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title
          </label>
          <input
            type="text"
            name="title"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="Enter task title"
          />
          {state.errors?.title && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-300">{state.errors.title}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            name="description"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="Enter description"
            rows={2}
          />
        </div>
        <input type="hidden" name="delay" value="1000" />
        <SubmitButton />
      </form>
      {state.message && !state.success && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-300">{state.message}</p>
      )}
      {state.message && state.success && (
        <p className="mt-2 text-sm text-green-600 dark:text-green-300">{state.message}</p>
      )}
      {tasks.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Created tasks:</p>
          <ul className="text-sm space-y-1">
            {tasks.map(task => (
              <li key={task.id} className="text-gray-700 dark:text-gray-300">• {task.title}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

function ActionButton({
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
      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-70 flex items-center gap-2 justify-center"
    >
      {showPending ? <Spinner /> : children}
    </button>
  )
}

function LoginFormDemo() {
  const [fields, setFields] = useState({ email: 'demo@example.com', password: 'password123' })
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [delay, setDelay] = useState(1000)

  const login = async () => {
    setStatus('idle')
    await new Promise(resolve => setTimeout(resolve, delay))

    if (fields.email && fields.password) {
      setStatus('success')
    } else {
      setStatus('error')
    }
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

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
        <input
          type="email"
          value={fields.email}
          onChange={(e) => setFields(f => ({ ...f, email: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
        <input
          type="password"
          value={fields.password}
          onChange={(e) => setFields(f => ({ ...f, password: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>

      <ActionButton action={login}>Login</ActionButton>

      {status === 'success' && (
        <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md text-green-800 dark:text-green-300 text-sm">
          Login successful! Navigating to home...
        </div>
      )}
      {status === 'error' && (
        <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md text-red-800 dark:text-red-300 text-sm">
          Please fill in all fields
        </div>
      )}
    </div>
  )
}

const beforeCode = `const [title, setTitle] = useState('')
const [isSubmitting, setIsSubmitting] = useState(false)
const [error, setError] = useState(null)

const handleSubmit = async (e) => {
  e.preventDefault()
  setIsSubmitting(true)
  setError(null)
  try {
    await createTask({ title })
    setTitle('')
  } catch (err) {
    setError(err.message)
  } finally {
    setIsSubmitting(false)
  }
}

<form onSubmit={handleSubmit}>
  <input value={title} onChange={...} />
  <button disabled={isSubmitting}>
    {isSubmitting ? 'Creating...' : 'Create'}
  </button>
</form>`

const afterCode = `// Server Action
async function createTaskAction(prevState, formData) {
  'use server'
  const title = formData.get('title')
  // Validation & DB operations
  return { success: true, message: 'Created!' }
}

// Component
const [state, formAction] = useActionState(
  createTaskAction,
  initialState
)

<form action={formAction}>
  <input name="title" />
  <SubmitButton /> {/* Uses useFormStatus */}
</form>

// SubmitButton.tsx
function SubmitButton() {
  const { pending } = useFormStatus()
  return <button>{pending ? '...' : 'Create'}</button>
}`

const loginPatternCode = `// Login pattern from async-react
function Login() {
  const router = useRouter()
  const [fields, setFields] = useState(initialFieldData)

  async function submitAction() {
    // We're in an Action, so we're in a transition
    // The pending state will be true until:
    // 1. The login POST completes
    // 2. The navigation after it completes
    await login(fields.username, fields.password)

    // Prefetch data before navigating
    await prefetchLessons()

    // Navigate to home
    router.navigate('/')
  }

  return (
    <LoginForm fields={fields} setFields={setFields}>
      <Button action={submitAction}>Login</Button>
    </LoginForm>
  )
}`

export default function FormActionsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Form Actions</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        React 19&apos;s form actions with <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">useActionState</code> and{' '}
        <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">useFormStatus</code> simplify form handling dramatically.
      </p>

      <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-8">
        <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">Key Concepts</h3>
        <ul className="text-green-700 dark:text-green-300 text-sm space-y-1">
          <li>• <strong>action prop</strong>: Forms can directly call server actions</li>
          <li>• <strong>useActionState</strong>: Manages form state and pending status</li>
          <li>• <strong>useFormStatus</strong>: Child components can read form&apos;s pending state</li>
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="border-2 border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-950">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-4">Before React 19</h2>
          <CodeBlock code={beforeCode} className="mb-4 max-h-64" />
          <BeforeFormActions />
        </div>

        <div className="border-2 border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-950">
          <h2 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4">After React 19</h2>
          <CodeBlock code={afterCode} className="mb-4 max-h-64" />
          <AfterFormActions />
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">What Changed?</h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex gap-2">
            <span className="text-red-500">-</span>
            <span>Manual <code className="bg-white dark:bg-gray-800 px-1 rounded">e.preventDefault()</code> and state management</span>
          </li>
          <li className="flex gap-2">
            <span className="text-red-500">-</span>
            <span>Controlled inputs with <code className="bg-white dark:bg-gray-800 px-1 rounded">value</code> and <code className="bg-white dark:bg-gray-800 px-1 rounded">onChange</code></span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-500">+</span>
            <span>Declarative <code className="bg-white dark:bg-gray-800 px-1 rounded">action</code> prop on form element</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-500">+</span>
            <span>Server actions handle validation on the server</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-500">+</span>
            <span><code className="bg-white dark:bg-gray-800 px-1 rounded">useFormStatus</code> enables pending UI in child components</span>
          </li>
        </ul>
      </div>

      <div className="border-2 border-indigo-200 dark:border-indigo-800 rounded-lg p-6 bg-indigo-50 dark:bg-indigo-950 mb-8">
        <h2 className="text-xl font-semibold text-indigo-900 dark:text-indigo-300 mb-3">The Login Pattern</h2>
        <p className="text-indigo-800 dark:text-indigo-300 text-sm mb-4">
          The async-react Login demonstrates how the action prop pattern combines with transitions for seamless
          form handling. The Button component wraps the action in a transition, so the pending state persists
          through login, data prefetch, and navigation.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-indigo-800 dark:text-indigo-300 mb-2 text-sm">Pattern</h3>
            <CodeBlock code={loginPatternCode} className="max-h-80" />
          </div>

          <div>
            <h3 className="font-medium text-indigo-800 dark:text-indigo-300 mb-2 text-sm">Live Demo</h3>
            <div className="bg-white dark:bg-gray-800 rounded-md p-4 border border-indigo-100 dark:border-indigo-800">
              <LoginFormDemo />
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-indigo-100 dark:bg-indigo-900 rounded-md">
          <p className="text-indigo-900 dark:text-indigo-300 text-sm">
            <strong>Key insight:</strong> Because the button wraps the action in a transition, the pending state
            covers the entire async flow (login + prefetch + navigate). The user sees one smooth loading state,
            not multiple discrete states.
          </p>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Network-Aware Form Handling</h3>
        <p className="text-amber-700 dark:text-amber-300 text-sm">
          With transitions wrapping form actions, the loading indicator only appears if the operation takes
          longer than ~150ms. Fast submissions feel instant, while slow ones get appropriate feedback.
          Combined with prefetching, users often see the next page immediately after login.
        </p>
      </div>
    </div>
  )
}
