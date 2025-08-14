export default function PostSkeleton() {
  return (
    <div className="w-full max-w-2xl bg-white border rounded-lg shadow-sm animate-pulse">
      <div className="flex items-center gap-3 p-4">
        <div className="w-10 h-10 rounded-full bg-gray-200" />
        <div className="flex-1">
          <div className="h-3 w-32 bg-gray-200 rounded mb-2" />
          <div className="h-2 w-24 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="px-4 pb-3">
        <div className="h-3 w-3/4 bg-gray-200 rounded mb-2" />
        <div className="h-3 w-2/3 bg-gray-200 rounded" />
      </div>
      <div className="mx-4 mb-2 h-64 bg-gray-200 rounded-lg" />
      <div className="px-4 py-3 flex items-center gap-6 border-t">
        <div className="h-4 w-16 bg-gray-200 rounded" />
        <div className="h-4 w-16 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
