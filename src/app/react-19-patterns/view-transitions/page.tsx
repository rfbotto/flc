'use client'

import { useState, useEffect } from 'react'
import { Task } from '@/lib/react-19-demo/types'
import { CodeBlock } from '@/components/react-19/CodeBlock'

const sampleTasks: Task[] = [
  { id: '1', title: 'Review pull request', description: 'Check the auth flow changes', completed: false, priority: 'high', category: 'work', createdAt: '', updatedAt: '' },
  { id: '2', title: 'Update documentation', description: 'Add API endpoints docs', completed: false, priority: 'medium', category: 'work', createdAt: '', updatedAt: '' },
  { id: '3', title: 'Fix navigation bug', description: 'Mobile menu not closing', completed: true, priority: 'high', category: 'work', createdAt: '', updatedAt: '' },
]

function BeforeViewTransitions() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const selectTask = (task: Task | null) => {
    setIsAnimating(true)
    setTimeout(() => {
      setSelectedTask(task)
      setTimeout(() => setIsAnimating(false), 300)
    }, 150)
  }

  return (
    <div className="relative min-h-[300px]">
      {!selectedTask ? (
        <div className={`space-y-2 transition-opacity duration-150 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Click a task to view details:</p>
          {sampleTasks.map(task => (
            <button
              key={task.id}
              onClick={() => selectTask(task)}
              className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-950 transition-colors bg-white dark:bg-gray-800"
            >
              <span className={task.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-gray-100'}>
                {task.title}
              </span>
              <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                task.priority === 'high' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {task.priority}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
          <button
            onClick={() => selectTask(null)}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-3"
          >
            &larr; Back to list
          </button>
          <div className="p-4 rounded-lg border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{selectedTask.title}</h4>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{selectedTask.description}</p>
            <div className="flex gap-2 mt-4">
              <span className={`text-xs px-2 py-1 rounded ${
                selectedTask.priority === 'high' ? 'bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}>
                {selectedTask.priority}
              </span>
              <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                {selectedTask.category}
              </span>
              <span className={`text-xs px-2 py-1 rounded ${
                selectedTask.completed ? 'bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-yellow-200 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
              }`}>
                {selectedTask.completed ? 'Completed' : 'Active'}
              </span>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        Uses CSS transitions + setTimeout for animations (manual orchestration)
      </p>
    </div>
  )
}

function AfterViewTransitions() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [supportsVT, setSupportsVT] = useState<boolean | null>(null)

  useEffect(() => {
    setSupportsVT('startViewTransition' in document)
  }, [])

  const selectTask = (task: Task | null) => {
    if (supportsVT) {
      (document as Document & { startViewTransition: (callback: () => void) => void }).startViewTransition(() => {
        setSelectedTask(task)
      })
    } else {
      setSelectedTask(task)
    }
  }

  return (
    <div className="relative min-h-[300px]">
      <style jsx global>{`
        ::view-transition-old(task-content),
        ::view-transition-new(task-content) {
          animation-duration: 0.25s;
        }

        ::view-transition-old(task-content) {
          animation: vt-fade-out 0.15s ease-out forwards;
        }

        ::view-transition-new(task-content) {
          animation: vt-fade-in 0.25s ease-out forwards;
        }

        @keyframes vt-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes vt-fade-out {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-8px); }
        }
      `}</style>

      <div style={{ viewTransitionName: 'task-content' }}>
        {!selectedTask ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Click a task to view details:</p>
            {sampleTasks.map(task => (
              <button
                key={task.id}
                onClick={() => selectTask(task)}
                className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50 dark:hover:bg-green-950 transition-colors bg-white dark:bg-gray-800"
              >
                <span className={task.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-gray-100'}>
                  {task.title}
                </span>
                <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                  task.priority === 'high' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {task.priority}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <button
              onClick={() => selectTask(null)}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-3"
            >
              &larr; Back to list
            </button>
            <div className="p-4 rounded-lg border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{selectedTask.title}</h4>
              <p className="text-gray-600 dark:text-gray-400 mt-2">{selectedTask.description}</p>
              <div className="flex gap-2 mt-4">
                <span className={`text-xs px-2 py-1 rounded ${
                  selectedTask.priority === 'high' ? 'bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}>
                  {selectedTask.priority}
                </span>
                <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                  {selectedTask.category}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  selectedTask.completed ? 'bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-yellow-200 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                }`}>
                  {selectedTask.completed ? 'Completed' : 'Active'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        Uses native View Transitions API {supportsVT ? '(supported)' : '(not supported - instant switch)'}
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

function ListMorphingDemo() {
  const [lessons, setLessons] = useState(mockLessons)
  const [filter, setFilter] = useState<'all' | 'complete' | 'incomplete'>('all')
  const [supportsVT, setSupportsVT] = useState<boolean | null>(null)

  useEffect(() => {
    setSupportsVT('startViewTransition' in document)
  }, [])

  const toggleComplete = (id: string) => {
    const update = () => {
      setLessons(prev => prev.map(l =>
        l.id === id ? { ...l, complete: !l.complete } : l
      ))
    }

    if (supportsVT) {
      (document as Document & { startViewTransition: (callback: () => void) => void }).startViewTransition(update)
    } else {
      update()
    }
  }

  const changeFilter = (newFilter: 'all' | 'complete' | 'incomplete') => {
    const update = () => setFilter(newFilter)

    if (supportsVT) {
      (document as Document & { startViewTransition: (callback: () => void) => void }).startViewTransition(update)
    } else {
      update()
    }
  }

  const filteredLessons = lessons.filter(l => {
    if (filter === 'complete') return l.complete
    if (filter === 'incomplete') return !l.complete
    return true
  })

  return (
    <div className="space-y-4">
      <style jsx global>{`
        ::view-transition-old(lesson-item),
        ::view-transition-new(lesson-item) {
          animation-duration: 0.3s;
        }

        ::view-transition-group(lesson-item) {
          animation-timing-function: ease-in-out;
        }

        ::view-transition-old(lesson-list),
        ::view-transition-new(lesson-list) {
          animation-duration: 0.2s;
        }
      `}</style>

      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {(['all', 'incomplete', 'complete'] as const).map(f => (
          <button
            key={f}
            onClick={() => changeFilter(f)}
            className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === f ? 'bg-white dark:bg-gray-700 text-teal-700 dark:text-teal-300 shadow-sm' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {f === 'all' ? 'All' : f === 'incomplete' ? 'In Progress' : 'Completed'}
          </button>
        ))}
      </div>

      <div className="space-y-2" style={{ viewTransitionName: 'lesson-list' }}>
        {filteredLessons.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">No lessons found</div>
        ) : (
          filteredLessons.map(lesson => (
            <div
              key={lesson.id}
              style={{ viewTransitionName: `lesson-${lesson.id}` }}
              className={`p-3 rounded-md border flex items-center gap-3 cursor-pointer transition-colors ${
                lesson.complete
                  ? 'bg-teal-50 dark:bg-teal-950 border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => toggleComplete(lesson.id)}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                lesson.complete ? 'border-teal-500 bg-teal-500' : 'border-gray-300 dark:border-gray-600'
              }`}>
                {lesson.complete && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className={lesson.complete ? 'text-teal-700 dark:text-teal-300' : 'text-gray-900 dark:text-gray-100'}>
                {lesson.title}
              </span>
            </div>
          ))
        )}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Click items to toggle completion. Each item has its own viewTransitionName for smooth morphing.
        {supportsVT === false && ' (View Transitions not supported in this browser)'}
      </p>
    </div>
  )
}

const beforeCode = `const [isAnimating, setIsAnimating] = useState(false)

const selectTask = (task) => {
  setIsAnimating(true)
  setTimeout(() => {
    setSelectedTask(task)
    setTimeout(() => setIsAnimating(false), 300)
  }, 150)
}

// Plus CSS classes for opacity/transform
<div className={\`\${isAnimating ? 'opacity-0' : ''}\`}>
  ...
</div>`

const afterCode = `const selectTask = (task) => {
  document.startViewTransition(() => {
    setSelectedTask(task)
  })
}

// CSS for view transitions:
::view-transition-old(task-content) {
  animation: fade-out 0.15s ease-out;
}
::view-transition-new(task-content) {
  animation: fade-in 0.25s ease-out;
}

// Single viewTransitionName on container:
<div style={{ viewTransitionName: 'task-content' }}>
  {selectedTask ? <Detail /> : <List />}
</div>`

const listMorphingCode = `// List morphing pattern from async-react
// Each item gets its own viewTransitionName

function LessonList({ lessons, completeAction }) {
  return (
    <ViewTransition key="results">
      <List>
        {lessons.map(item => (
          <ViewTransition key={item.id}>
            <div>
              <ViewTransition default="none">
                <Lesson item={item} action={completeAction} />
              </ViewTransition>
            </div>
          </ViewTransition>
        ))}
      </List>
    </ViewTransition>
  )
}

// Each lesson has a unique transition name
// When filtering/reordering, items morph smoothly
// instead of fading in/out

// CSS targeting individual items:
::view-transition-group(lesson-item) {
  animation-timing-function: ease-in-out;
}`

export default function ViewTransitionsPage() {
  const [supportsViewTransitions, setSupportsViewTransitions] = useState<boolean | null>(null)

  useEffect(() => {
    setSupportsViewTransitions('startViewTransition' in document)
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">ViewTransition</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        React 19 integrates with the browser&apos;s native View Transitions API for smooth,
        performant animations without JavaScript animation libraries.
      </p>

      {supportsViewTransitions === false && (
        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">Browser Support</h3>
          <p className="text-yellow-700 dark:text-yellow-300 text-sm">
            Your browser doesn&apos;t support the View Transitions API. The &quot;After&quot; demo will
            use instant transitions. Try Chrome 111+ or Safari 18+ to see the full effect.
          </p>
        </div>
      )}

      <div className="bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 rounded-lg p-4 mb-8">
        <h3 className="font-semibold text-teal-800 dark:text-teal-200 mb-2">Key Concepts</h3>
        <ul className="text-teal-700 dark:text-teal-300 text-sm space-y-1">
          <li>• <strong>document.startViewTransition()</strong>: Captures before/after DOM states</li>
          <li>• <strong>viewTransitionName</strong>: Names elements for cross-fade animations</li>
          <li>• <strong>::view-transition-*</strong>: CSS pseudo-elements for custom animations</li>
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="border-2 border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-950">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-4">Before React 19</h2>
          <CodeBlock code={beforeCode} className="mb-4 max-h-48" />
          <BeforeViewTransitions />
        </div>

        <div className="border-2 border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-950">
          <h2 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4">After React 19</h2>
          <CodeBlock code={afterCode} className="mb-4 max-h-48" />
          <AfterViewTransitions />
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">What Changed?</h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex gap-2">
            <span className="text-red-500">-</span>
            <span>Manual setTimeout orchestration for enter/exit timing</span>
          </li>
          <li className="flex gap-2">
            <span className="text-red-500">-</span>
            <span>Complex state management for animation phases</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-500">+</span>
            <span>Single <code className="bg-white dark:bg-gray-700 px-1 rounded">startViewTransition()</code> call handles everything</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-500">+</span>
            <span>Browser captures old/new states automatically</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-500">+</span>
            <span>CSS animations run on compositor thread (smoother)</span>
          </li>
        </ul>
      </div>

      <div className="border-2 border-indigo-200 dark:border-indigo-800 rounded-lg p-6 bg-indigo-50 dark:bg-indigo-950 mb-8">
        <h2 className="text-xl font-semibold text-indigo-900 dark:text-indigo-100 mb-3">The List Morphing Pattern</h2>
        <p className="text-indigo-800 dark:text-indigo-200 text-sm mb-4">
          In async-react, list items use <code className="bg-indigo-100 dark:bg-indigo-900 px-1 rounded">&lt;ViewTransition key=&#123;id&#125;&gt;</code> to
          enable smooth morphing when items move, appear, or disappear. Each item gets a unique transition name,
          so the browser can animate them individually rather than cross-fading the entire list.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-indigo-800 dark:text-indigo-200 mb-2 text-sm">Pattern</h3>
            <CodeBlock code={listMorphingCode} className="max-h-80" />
          </div>

          <div>
            <h3 className="font-medium text-indigo-800 dark:text-indigo-200 mb-2 text-sm">Live Demo</h3>
            <div className="bg-white dark:bg-gray-800 rounded-md p-4 border border-indigo-100 dark:border-indigo-900">
              <ListMorphingDemo />
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-indigo-100 dark:bg-indigo-900 rounded-md">
          <p className="text-indigo-900 dark:text-indigo-100 text-sm">
            <strong>Key insight:</strong> By giving each list item its own <code className="bg-indigo-200 dark:bg-indigo-800 px-1 rounded">viewTransitionName</code>,
            the browser can track and animate individual items. When you filter or toggle completion, items
            smoothly morph to their new positions instead of abruptly appearing/disappearing.
          </p>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Coordination with Transitions</h3>
        <p className="text-amber-700 dark:text-amber-300 text-sm">
          View Transitions work alongside React&apos;s <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">startTransition</code>.
          When both are used together, React updates state in a transition (non-blocking), while the browser
          handles the visual animation. This keeps the UI responsive even during complex animated state changes.
        </p>
      </div>
    </div>
  )
}
