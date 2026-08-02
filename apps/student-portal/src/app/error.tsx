'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-rose-600 mb-4">Something went wrong</h1>
        <p className="text-slate-600 mb-6">An unexpected error occurred.</p>
        <button 
          onClick={reset}
          className="bg-brand-orange text-white px-4 py-2 rounded-lg font-semibold"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
