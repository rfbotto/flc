import Link from 'next/link'

const projects = [
  {
    title: 'Loading Test',
    description: 'Demonstrates Next.js loading states, Suspense boundaries, and prefetching patterns',
    href: '/loading-test',
  },
  {
    title: 'Partial Rendering',
    description: 'Showcases progressive rendering with Suspense and delayed components',
    href: '/partial-rendering',
  },
  {
    title: 'Text Generation Playground',
    description: 'AI-powered email generation with advanced guardrails and moderation',
    href: '/text-generation-playground',
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Frontend Libraries Showcase
        </h1>
        <p className="text-gray-600 mb-8">
          Demo projects for testing Next.js features
        </p>

        <div className="space-y-4">
          {projects.map((project) => (
            <Link
              key={project.href}
              href={project.href}
              className="block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-200"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {project.title}
              </h2>
              <p className="text-gray-600 text-sm">
                {project.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
