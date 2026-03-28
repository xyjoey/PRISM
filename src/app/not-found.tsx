import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center px-6 py-16 overflow-hidden bg-gradient-to-b from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute left-1/2 top-10 h-64 w-64 -translate-x-1/2 rounded-full bg-accent/25 blur-3xl opacity-70 dark:opacity-50" />
        <div className="absolute -left-16 bottom-8 h-72 w-72 rounded-full bg-primary/20 blur-3xl opacity-40 dark:opacity-30" />
      </div>

      <div className="relative max-w-2xl w-full">
        <div className="glass-card shadow-xl border border-white/40 dark:border-white/10">
          <div className="flex items-center gap-3 text-accent">
            <Compass className="h-10 w-10" strokeWidth={1.5} />
            <span className="text-sm uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">
              404
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <h1 className="text-3xl font-serif font-bold text-primary">Page not found</h1>
            <p className="text-neutral-700 dark:text-neutral-200 leading-relaxed">
              This route is outside the site map. Use the navigation or head back to keep exploring.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-accent text-accent hover:bg-accent hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
                Go home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
