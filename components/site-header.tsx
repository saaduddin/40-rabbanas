import Link from "next/link"
import { Flame, LogIn } from "lucide-react"

export function SiteHeader({
  signedIn,
  userName,
  streak,
}: {
  signedIn: boolean
  userName?: string | null
  streak: number
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent-foreground/70">
            Forty
          </span>
          <span className="text-xl font-medium tracking-tight text-primary">Rabbānāt</span>
        </Link>
        <div className="flex items-center gap-3">
          {signedIn ? (
            <>
              <span
                className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"
                title="Current recitation streak"
              >
                <Flame className="h-3.5 w-3.5 text-accent" aria-hidden />
                <span className="tabular-nums">{streak}</span>
                <span className="text-xs text-muted-foreground">{streak === 1 ? "day" : "days"}</span>
              </span>
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="text-sm text-muted-foreground transition hover:text-primary"
                  title={userName ?? "Sign out"}
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/api/auth/login"
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-card px-3.5 py-1.5 text-sm font-medium text-primary transition hover:bg-primary hover:text-primary-foreground"
            >
              <LogIn className="h-3.5 w-3.5" aria-hidden />
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
