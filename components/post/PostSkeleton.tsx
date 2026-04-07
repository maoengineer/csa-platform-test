export default function PostSkeleton() {
  return (
    <div className="csa-card p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="skeleton w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-32 rounded-lg" />
          <div className="skeleton h-3 w-48 rounded-lg" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="skeleton h-4 rounded-lg" />
        <div className="skeleton h-4 rounded-lg w-5/6" />
        <div className="skeleton h-4 rounded-lg w-4/6" />
      </div>
      <div className="border-t border-slate-100 dark:border-slate-700/50 pt-3 flex gap-4">
        <div className="skeleton h-8 w-20 rounded-lg" />
        <div className="skeleton h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}
