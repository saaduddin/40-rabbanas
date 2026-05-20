import Link from "next/link"
import { Suspense } from "react"
import { ChevronRight } from "lucide-react"
import { RABBANAS } from "@/lib/rabbanas"
import { fetchVersesByKeys, type VerseDetail } from "@/lib/qf/content"
import { getValidSession } from "@/lib/qf/session"
import { listBookmarks, getCurrentStreak } from "@/lib/qf/user-api"
import { SiteHeader } from "@/components/site-header"
import { StreakBadge } from "@/components/streak-badge"
import { BookmarkPill } from "@/components/bookmark-pill"
import { AuthErrorToast } from "@/components/auth-error-toast"

export const revalidate = 3600

async function VerseSnippet({ verseKey }: { verseKey: string }) {
  let verse: VerseDetail | null = null
  try {
    const verses = await fetchVersesByKeys([verseKey])
    verse = verses[0] ?? null
  } catch {
    verse = null
  }
  if (!verse) {
    return (
      <p className="text-sm italic text-muted-foreground">Verse temporarily unavailable.</p>
    )
  }
  const translation = verse.translations?.[0]?.text?.replace(/<[^>]+>/g, "") ?? ""
  return (
    <>
      <p
        lang="ar"
        dir="rtl"
        className="font-arabic text-2xl leading-loose text-foreground/90 line-clamp-2"
      >
        {verse.text_uthmani}
      </p>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground line-clamp-2 text-pretty">
        {translation}
      </p>
    </>
  )
}

export default async function HomePage(props: {
  searchParams: Promise<{ auth_error?: string }>
}) {
  const { auth_error } = await props.searchParams
  const session = await getValidSession()

  // Best-effort user data — if any call fails we still render the page.
  const [bookmarksRes, streakRes] = await Promise.allSettled([
    session ? listBookmarks() : Promise.resolve(null),
    session ? getCurrentStreak("UTC") : Promise.resolve(0),
  ])

  const bookmarkedKeys = new Set<string>()
  if (bookmarksRes.status === "fulfilled" && bookmarksRes.value) {
    for (const b of bookmarksRes.value.data ?? []) {
      if (b.type === "ayah") bookmarkedKeys.add(`${b.key}:${b.verseNumber}`)
    }
  }
  const streak = streakRes.status === "fulfilled" ? (streakRes.value ?? 0) : 0

  return (
    <div className="min-h-screen paper-grain">
      <SiteHeader signedIn={Boolean(session)} userName={session?.name ?? session?.email} streak={streak} />
      {auth_error ? <AuthErrorToast error={auth_error} /> : null}

      <main className="mx-auto w-full max-w-3xl px-5 pb-24 pt-10 sm:px-8 sm:pt-14">
        <section className="mb-12 flex flex-col items-center text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent-foreground/70">
            Arbaʿīn Rabbanā · The Forty
          </p>
          <h1 className="mt-3 text-balance text-5xl font-medium leading-[1.05] text-foreground sm:text-6xl">
            Forty supplications that begin with{" "}
            <span className="font-serif text-primary">رَبَّنَا</span>
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            A quiet companion for reading, reciting, and returning &mdash; one duʿā a day,
            drawn directly from the Qur&apos;an.
          </p>
          {session ? (
            <StreakBadge days={streak} className="mt-6" />
          ) : (
            <Link
              href="/api/auth/login"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Sign in to bookmark and track your recitation
            </Link>
          )}
        </section>

        <ol className="flex flex-col gap-3">
          {RABBANAS.map((r) => {
            const slug = r.verseKey.replace(":", "-")
            const isBookmarked = bookmarkedKeys.has(r.verseKey)
            return (
              <li key={r.id}>
                <Link
                  href={`/r/${slug}`}
                  className="group flex flex-col gap-4 rounded-xl border border-border bg-card px-5 py-5 transition hover:border-primary/40 hover:bg-card/80 sm:px-7 sm:py-6"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="flex items-baseline gap-4">
                      <span className="font-mono text-xs tabular-nums text-accent-foreground/70">
                        {String(r.id).padStart(2, "0")}
                      </span>
                      <div className="flex flex-col">
                        <h2 className="text-lg font-medium leading-snug text-foreground text-balance sm:text-xl">
                          {r.theme}
                        </h2>
                        <span className="mt-0.5 font-mono text-[11px] tracking-wider text-muted-foreground">
                          {r.verseKey}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      {isBookmarked ? <BookmarkPill /> : null}
                      <ChevronRight
                        className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:text-primary"
                        aria-hidden
                      />
                    </div>
                  </div>
                  <div className="border-t border-dashed border-border pt-4">
                    <Suspense
                      fallback={
                        <div className="space-y-2">
                          <div className="h-6 w-3/4 rounded bg-muted/60" />
                          <div className="h-4 w-2/3 rounded bg-muted/50" />
                        </div>
                      }
                    >
                      <VerseSnippet verseKey={r.verseKey} />
                    </Suspense>
                  </div>
                </Link>
              </li>
            )
          })}
        </ol>

        <footer className="mt-16 flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
          <p>
            Text and audio courtesy of the{" "}
            <a
              href="https://api-docs.quran.foundation/"
              className="underline decoration-accent/60 underline-offset-4 hover:text-primary"
              target="_blank"
              rel="noreferrer"
            >
              Quran Foundation
            </a>
            . Translation by Saheeh International.
          </p>
        </footer>
      </main>
    </div>
  )
}
