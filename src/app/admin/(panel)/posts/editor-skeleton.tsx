export function EditorSkeleton() {
  return (
    <div className="mx-auto grid max-w-7xl animate-pulse gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="grid content-start gap-6">
        <div className="bg-muted h-48 rounded-xl" />
        <div className="bg-muted h-[32rem] rounded-xl" />
      </div>
      <div className="grid content-start gap-6">
        <div className="bg-muted h-40 rounded-xl" />
        <div className="bg-muted h-56 rounded-xl" />
        <div className="bg-muted h-48 rounded-xl" />
      </div>
    </div>
  )
}
