export function Loading({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-honey-100" />
        <div className="absolute inset-0 rounded-full border-4 border-honey-500 border-t-transparent animate-spin" />
      </div>
      <p className="text-warm-600 text-sm font-medium">{message}</p>
    </div>
  );
}
