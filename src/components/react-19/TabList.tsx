'use client'

import { useTransition, useOptimistic, ReactNode } from 'react'

interface Tab {
  id: string
  label: string
}

interface TabListProps<T extends string = string> {
  tabs: Tab[]
  activeTab: T
  action: (tabId: T) => Promise<void>
  className?: string
  showShimmer?: boolean
}

export function TabList<T extends string = string>({
  tabs,
  activeTab,
  action,
  className = '',
  showShimmer = true,
}: TabListProps<T>) {
  const [isPending, startTransition] = useTransition()
  const [optimisticTab, setOptimisticTab] = useOptimistic(activeTab)
  const isSyncing = optimisticTab !== activeTab

  const handleTabClick = (tabId: T) => {
    startTransition(async () => {
      setOptimisticTab(tabId)
      await action(tabId)
    })
  }

  return (
    <div className={`flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg ${className}`}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.id as T)}
          disabled={isPending}
          className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors relative overflow-hidden ${
            optimisticTab === tab.id
              ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          } ${isPending ? 'cursor-not-allowed' : ''}`}
        >
          {tab.label}
          {showShimmer && isSyncing && optimisticTab === tab.id && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          )}
        </button>
      ))}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  )
}

interface TabPanelProps {
  isActive: boolean
  children: ReactNode
  preserveState?: boolean
}

export function TabPanel({ isActive, children, preserveState = false }: TabPanelProps) {
  if (preserveState) {
    return (
      <div className={isActive ? 'block' : 'hidden'}>
        {children}
      </div>
    )
  }

  return isActive ? <>{children}</> : null
}

export default TabList
