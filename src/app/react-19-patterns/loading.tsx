export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-64 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-96 mb-8" />
      <div className="grid grid-cols-2 gap-6">
        <div className="h-64 bg-gray-200 rounded" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    </div>
  )
}
