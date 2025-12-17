import Link from "next/link";
import { CodeBlock } from '@/components/react-19/CodeBlock'

const features = [
  {
    title: "Transitions",
    href: "/react-19-patterns/transitions",
    description: "Non-blocking async operations with useTransition",
    before: "Manual isLoading state for each action",
    after: "Components own pending state via action props",
    coordination:
      "Routers wrap navigation in transitions automatically. Components use action props with useTransition for built-in pending states.",
    color: "blue",
  },
  {
    title: "Deferred Values",
    href: "/react-19-patterns/deferred-values",
    description: "Keep input responsive while re-rendering expensive UI",
    before: "Every keystroke blocks on expensive renders",
    after: "useDeferredValue defers non-urgent updates",
    coordination:
      "Input state updates immediately, derived state uses deferred value. React can interrupt deferred renders for new input.",
    color: "blue",
  },
  {
    title: "Form Actions",
    href: "/react-19-patterns/form-actions",
    description:
      "Declarative form handling with useActionState and useFormStatus",
    before: "onSubmit, e.preventDefault(), manual state",
    after: "action prop, automatic pending states",
    coordination:
      "Forms use the action prop pattern. Submit buttons read pending state via useFormStatus without prop drilling.",
    color: "blue",
  },
  {
    title: "Optimistic Updates",
    href: "/react-19-patterns/optimistic-updates",
    description: "Instant UI feedback with useOptimistic",
    before: "Manual state + rollback logic",
    after: "Built-in optimistic state with auto-revert",
    coordination:
      "Works inside startTransition to provide instant feedback while async operations complete. Auto-reverts on error.",
    color: "blue",
  },
  {
    title: "use() Hook",
    href: "/react-19-patterns/use-hook",
    description: "Read promises and context anywhere in render",
    before: "useEffect + useState, top-level useContext",
    after: "Direct promise reading, conditional context",
    coordination:
      "Data fetching layers return cached promises. Components read data with use() and Suspense handles loading.",
    color: "blue",
  },
  {
    title: "Activity",
    href: "/react-19-patterns/activity",
    description: "Preserve component state when hidden",
    before: "State lost on conditional render",
    after: "Activity keeps state alive when hidden",
    coordination:
      "Prefetch next pages while keeping current page warm. Instant back navigation without re-fetching.",
    color: "blue",
  },
  {
    title: "ViewTransition",
    href: "/react-19-patterns/view-transitions",
    description: "Browser-native animations with React integration",
    before: "JS animation libraries (Framer Motion)",
    after: "Native CSS view transitions",
    coordination:
      "Wrap state changes in startViewTransition. Add viewTransitionName to elements for cross-fade morphing.",
    color: "blue",
  },
  {
    title: "Login Flow",
    href: "/react-19-patterns/login-flow",
    description: "Auth → Prefetch → Navigate coordination pattern",
    before: "Sequential blocking: login, then fetch, then navigate",
    after: "Prefetch with timeout, Suspense handles the rest",
    coordination:
      "After auth, prefetch data with Promise.race timeout. Navigate immediately, Suspense shows fallbacks while data loads.",
    color: "blue",
  },
];

const colorClasses: Record<
  string,
  { border: string; bg: string; text: string; light: string }
> = {
  blue: {
    border: "border-blue-200 dark:border-blue-800",
    bg: "bg-blue-50 dark:bg-blue-950",
    text: "text-blue-700 dark:text-blue-300",
    light: "text-blue-600 dark:text-blue-400",
  },
  green: {
    border: "border-green-200 dark:border-green-800",
    bg: "bg-green-50 dark:bg-green-950",
    text: "text-green-700 dark:text-green-300",
    light: "text-green-600 dark:text-green-400",
  },
  purple: {
    border: "border-purple-200 dark:border-purple-800",
    bg: "bg-purple-50 dark:bg-purple-950",
    text: "text-purple-700 dark:text-purple-300",
    light: "text-purple-600 dark:text-purple-400",
  },
  orange: {
    border: "border-orange-200 dark:border-orange-800",
    bg: "bg-orange-50 dark:bg-orange-950",
    text: "text-orange-700 dark:text-orange-300",
    light: "text-orange-600 dark:text-orange-400",
  },
  pink: {
    border: "border-pink-200 dark:border-pink-800",
    bg: "bg-pink-50 dark:bg-pink-950",
    text: "text-pink-700 dark:text-pink-300",
    light: "text-pink-600 dark:text-pink-400",
  },
  teal: {
    border: "border-teal-200 dark:border-teal-800",
    bg: "bg-teal-50 dark:bg-teal-950",
    text: "text-teal-700 dark:text-teal-300",
    light: "text-teal-600 dark:text-teal-400",
  },
};

const actionPatternCode = `function Button({ children, action }) {
  const [isPending, transition] = useTransition()

  return (
    <button onClick={() => transition(action)}>
      {isPending ? <Spinner /> : children}
    </button>
  )
}`;

const optimisticTransitionCode = `const [optimisticTab, setOptimisticTab] = useOptimistic(activeTab)
const isPending = optimisticTab !== activeTab

function onTabClick(newValue) {
  startTransition(async () => {
    setOptimisticTab(newValue)  // Instant
    await changeAction(newValue) // Async
  })
}`;

const suspenseDataCode = `function LessonList({ tab, search }) {
  const lessons = use(data.getLessons(tab, search))
  return lessons.map(item => <Lesson item={item} />)
}

<Suspense fallback={<FallbackList />}>
  <LessonList tab={tab} search={search} />
</Suspense>`;

export default function Page() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        React 19 Async Features
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl">
        Explore how React 19 changes the way we write React code. Each section
        shows the &quot;before&quot; pattern alongside the new React 19
        approach, helping you shift your mental model for modern React
        development.
      </p>

      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6 mb-10">
        <h2 className="text-xl font-semibold text-indigo-900 dark:text-indigo-100 mb-3">
          The Async React Vision
        </h2>
        <p className="text-indigo-800 dark:text-indigo-200 mb-4">
          React 19 introduces a <strong>coordination model</strong> where
          routing, data fetching, and UI components work together seamlessly.
          Based on patterns demonstrated in Rick Hanlon&apos;s React Conf 2025
          presentation, this approach eliminates most manual state management
          for async operations.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-md p-3">
            <div className="font-medium text-indigo-900 dark:text-indigo-100 mb-1">
              Routing
            </div>
            <p className="text-indigo-700 dark:text-indigo-300">
              Routers use transitions by default, so navigation is non-blocking
            </p>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-md p-3">
            <div className="font-medium text-indigo-900 dark:text-indigo-100 mb-1">
              Data Fetching
            </div>
            <p className="text-indigo-700 dark:text-indigo-300">
              Data layers use Suspense, so loading states are automatic
            </p>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-md p-3">
            <div className="font-medium text-indigo-900 dark:text-indigo-100 mb-1">
              Components
            </div>
            <p className="text-indigo-700 dark:text-indigo-300">
              Design components expose action props with built-in optimistic
              updates
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Features
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {features.map((feature) => {
          const colors = colorClasses[feature.color];
          return (
            <Link
              key={feature.href}
              href={feature.href}
              className={`block p-6 rounded-lg border-2 ${colors.border} hover:shadow-md transition-shadow`}
            >
              <h3 className={`text-xl font-semibold ${colors.text} mb-2`}>
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                {feature.description}
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                <div className="bg-red-50 dark:bg-red-950 p-2 rounded border border-red-100 dark:border-red-900">
                  <span className="font-medium text-red-700 dark:text-red-300">
                    Before:
                  </span>
                  <p className="text-red-600 dark:text-red-400 mt-1">
                    {feature.before}
                  </p>
                </div>
                <div
                  className={`${colors.bg} p-2 rounded border ${colors.border}`}
                >
                  <span className={`font-medium ${colors.text}`}>After:</span>
                  <p className={colors.light} style={{ marginTop: "0.25rem" }}>
                    {feature.after}
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-2">
                <span className="font-medium">Coordination:</span>{" "}
                {feature.coordination}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="bg-gray-900 rounded-lg p-6 mb-10">
        <h2 className="text-xl font-semibold text-white mb-4">
          How Features Work Together
        </h2>
        <p className="text-gray-300 mb-6 text-sm">
          The real power of React 19&apos;s async features comes from how they
          combine. Here are three patterns from the async-react repository that
          demonstrate this coordination.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-green-400 font-medium mb-2 text-sm">
              1. Action Prop Pattern
            </h3>
            <p className="text-gray-400 text-xs mb-3">
              Components accept async actions and handle pending states
              internally using useTransition.
            </p>
            <CodeBlock code={actionPatternCode} />
          </div>

          <div>
            <h3 className="text-purple-400 font-medium mb-2 text-sm">
              2. Optimistic + Transition
            </h3>
            <p className="text-gray-400 text-xs mb-3">
              useOptimistic inside startTransition gives instant feedback with
              automatic rollback.
            </p>
            <CodeBlock code={optimisticTransitionCode} />
          </div>

          <div>
            <h3 className="text-orange-400 font-medium mb-2 text-sm">
              3. Suspense + use()
            </h3>
            <p className="text-gray-400 text-xs mb-3">
              Data layers return cached promises. Components read with use() and
              Suspense handles loading.
            </p>
            <CodeBlock code={suspenseDataCode} />
          </div>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-6 mb-10">
        <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100 mb-3">
          Network-Aware UI Behavior
        </h2>
        <p className="text-amber-800 dark:text-amber-200 text-sm mb-4">
          When these features work together, the UI automatically adapts to
          network conditions without explicit code:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-md p-4 border border-amber-100 dark:border-amber-900">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="font-medium text-gray-900 dark:text-gray-100">
                Fast (&lt;150ms)
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              No loading states shown. Navigation feels instant. User sees
              content immediately.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-md p-4 border border-amber-100 dark:border-amber-900">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="font-medium text-gray-900 dark:text-gray-100">
                Moderate (150ms-1s)
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Prefetching completes before animation ends. Transitions feel
              smooth and natural.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-md p-4 border border-amber-100 dark:border-amber-900">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="font-medium text-gray-900 dark:text-gray-100">
                Slow (&gt;1s)
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Fallback states display appropriately. Loading indicators appear
              only when needed.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-xl font-semibold mb-2">Combined Demo</h2>
        <p className="text-blue-100 mb-4">
          See all features working together in a complete Task Manager
          application.
        </p>
        <Link
          href="/react-19-patterns/combined"
          className="inline-block bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors"
        >
          View Combined Demo &rarr;
        </Link>
      </div>
    </div>
  );
}
