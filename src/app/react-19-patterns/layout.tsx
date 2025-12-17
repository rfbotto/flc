'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NetworkDebuggerProvider } from '@/components/react-19/NetworkDebugger'

const navItems = [
  { href: '/react-19-patterns', label: 'Overview' },
  { href: '/react-19-patterns/transitions', label: 'Transitions' },
  { href: '/react-19-patterns/deferred-values', label: 'Deferred Values' },
  { href: '/react-19-patterns/form-actions', label: 'Form Actions' },
  { href: '/react-19-patterns/optimistic-updates', label: 'Optimistic Updates' },
  { href: '/react-19-patterns/use-hook', label: 'use() Hook' },
  { href: '/react-19-patterns/activity', label: 'Activity' },
  { href: '/react-19-patterns/view-transitions', label: 'ViewTransition' },
  { href: '/react-19-patterns/login-flow', label: 'Login Flow' },
  { href: '/react-19-patterns/combined', label: 'Combined Demo' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <NetworkDebuggerProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col">
          <Link href="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4">
            &larr; Back to experiments
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            React 19 Patterns
          </h1>
          <nav className="space-y-1 flex-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              React 19.2 + Next.js 16
            </p>
          </div>
        </aside>
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </NetworkDebuggerProvider>
  )
}
