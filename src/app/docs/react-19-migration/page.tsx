'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { markdownContent } from './content'

interface TocItem {
  id: string
  text: string
  level: number
}

function extractToc(markdown: string): TocItem[] {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm
  const toc: TocItem[] = []
  let match

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length
    const text = match[2].replace(/`/g, '')
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
    toc.push({ id, text, level })
  }

  return toc
}

function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function React19MigrationGuidePage() {
  const [activeSection, setActiveSection] = useState('')
  const [tocOpen, setTocOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const toc = useMemo(() => extractToc(markdownContent), [])

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash) {
      setActiveSection(hash)
    }

    const handleHashChange = () => {
      const newHash = window.location.hash.slice(1)
      if (newHash) {
        setActiveSection(newHash)
      }
      setTocOpen(false)
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting)
        if (visibleEntries.length > 0) {
          const topEntry = visibleEntries.reduce((prev, curr) => {
            return prev.boundingClientRect.top < curr.boundingClientRect.top ? prev : curr
          })
          const id = topEntry.target.id
          setActiveSection(id)
          window.history.replaceState(null, '', `${pathname}#${id}`)
        }
      },
      {
        rootMargin: '-100px 0px -70% 0px',
        threshold: 0,
      }
    )

    const headings = contentRef.current?.querySelectorAll('h1, h2, h3')
    headings?.forEach((heading) => observer.observe(heading))

    return () => observer.disconnect()
  }, [pathname])


  return (
    <div className="doc-page min-h-screen bg-[#0a0a0b]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0a0a0b]/80 border-b border-[#1f1f23]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 text-[#a1a1aa] hover:text-[#fafafa] transition-colors font-[family-name:var(--font-display)]"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 10H5M5 10L10 5M5 10L10 15" />
            </svg>
            <span className="text-sm font-medium">Back to Experiments</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-xs px-3 py-1.5 rounded-full bg-[rgba(245,158,11,0.1)] text-[#f59e0b] font-[family-name:var(--font-mono)]">
              v1.0
            </span>
            <button
              onClick={() => setTocOpen(!tocOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-[#18181b] transition-colors text-[#a1a1aa]"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 5H17M3 10H17M3 15H17" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto pt-16">
        {/* Table of Contents - Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-72
            overflow-y-auto overflow-x-hidden
            transition-transform duration-300 ease-out z-40
            lg:translate-x-0 lg:block
            bg-[#0a0a0b] border-r border-[#1f1f23]
            ${tocOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="p-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider mb-4 text-[#71717a] font-[family-name:var(--font-display)]">
              On this page
            </h2>
            <nav className="space-y-1">
              {toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`
                    toc-item block w-full text-left relative font-[family-name:var(--font-display)]
                    ${item.level === 1 ? 'font-medium text-sm py-2' : ''}
                    ${item.level === 2 ? 'text-sm py-1.5 pl-3' : ''}
                    ${item.level === 3 ? 'text-xs py-1 pl-6' : ''}
                    ${activeSection === item.id ? 'active text-[#f59e0b]' : 'text-[#a1a1aa]'}
                  `}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {tocOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setTocOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="px-6 lg:px-12 py-12 max-w-4xl" ref={contentRef}>
            <div className="doc-content animate-fade-in font-[family-name:var(--font-body)]">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => {
                    const text = String(children)
                    const id = generateHeadingId(text)
                    return <h1 id={id} className="font-[family-name:var(--font-display)]">{children}</h1>
                  },
                  h2: ({ children }) => {
                    const text = String(children)
                    const id = generateHeadingId(text)
                    return <h2 id={id} className="font-[family-name:var(--font-display)]">{children}</h2>
                  },
                  h3: ({ children }) => {
                    const text = String(children)
                    const id = generateHeadingId(text)
                    return <h3 id={id} className="font-[family-name:var(--font-display)]">{children}</h3>
                  },
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '')
                    const isInline = !match

                    return isInline ? (
                      <code className={`${className} font-[family-name:var(--font-mono)]`} {...props}>
                        {children}
                      </code>
                    ) : (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          padding: '1.25rem',
                          fontSize: '0.875rem',
                          lineHeight: '1.6',
                          background: '#111113',
                          fontFamily: 'var(--font-mono)',
                        }}
                        codeTagProps={{
                          style: {
                            fontFamily: 'var(--font-mono)',
                          }
                        }}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    )
                  },
                  table: ({ children }) => (
                    <div className="overflow-x-auto">
                      <table className="font-[family-name:var(--font-body)]">{children}</table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="font-[family-name:var(--font-display)]">{children}</th>
                  ),
                }}
              >
                {markdownContent}
              </ReactMarkdown>
            </div>

            {/* Footer */}
            <footer className="mt-16 pt-8 border-t border-[#1f1f23]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="text-sm text-[#71717a] font-[family-name:var(--font-body)]">
                  React 19 Migration Guide &bull; Generated from codebase learnings
                </p>
                <a
                  href="/docs/react-19-migration-guide.md"
                  target="_blank"
                  className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-colors bg-[#18181b] text-[#a1a1aa] hover:text-[#fafafa] font-[family-name:var(--font-display)]"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 2V11M8 11L4 7M8 11L12 7M2 14H14" />
                  </svg>
                  Download .md
                </a>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}
