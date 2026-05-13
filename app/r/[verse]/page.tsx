import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight, ChevronLeft } from "lucide-react"
import { RABBANAS, getRabbanaByKey } from "@/lib/rabbanas"
import { fetchVerseByKey } from "@/lib/qf/content"
import { getValidSession } from "@/lib/qf/session"
import { listBookmarks, getCurrentStreak } from "@/lib/qf/user-api"
import { SiteHeader } from "@/components/site-header"
import { VerseActions } from "@/components/verse-actions"
import { AudioPlayer } from "@/components/audio-player"

export const revalidate = 3600

function parseSlug(slug: string): string | null {
  const m = slug.match(/^(\d+)-(\d+)$/)
  if (!m) return null
  return `${m[1]}:${m[2]}`
}

export async function generateStaticParams() {
  return RABBANAS.map((r) => ({ verse: r.verseKey.replace(":", "-") }))
}

export default async function RabbanaPage(props: { params: Promise<{ verse: string }> }) {
  const { verse: slug } = await props.params
  const verseKey = parseSlug(slug)
  if (!verseKey) notFound()
  const rabbana = getRabbanaByKey(verseKey)
  if (!rabbana) notFound()

  const session = await getValidSession()
  const [verseRes, bookmarksRes, streakRes] = await Promise.allSettled([
    fetchVerseByKey(verseKey),
    session ? listBookmarks() : Promise.resolve(null),
    session ? getCurrentStreak("UTC") : Promise.resolve(0),
  ])

  if (verseRes.status !== "fulfilled") {
    return (
      <div className="min-h-screen paper-grain">
        <SiteHeader signedIn={Boolean(session)} userName={session?.name ?? session?.email} streak={0} />
        <main className="mx-auto w-full max-w-2xl px-5 py-20 text-center">
          <p className="text-lg text-muted-foreground">
            We couldn&apos;t reach the Qur&apos;an Foundation API just now. Please try again shortly.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to the index
          </Link>
        </main>
      </div>
    )
  }

  const verse = verseRes.value
  const translation = verse.translations?.[0]?.text?.replace(/<[^>]+>/g, "") ?? ""
  const audioUrl = verse.audio?.url
    ? verse.audio.url.startsWith("http")
      ? verse.audio.url
      : `https://verses.quran.com/${verse.audio.url}`
    : null

  const isBookmarked = (() => {
    if (bookmarksRes.status !== "fulfilled" || !bookmarksRes.value) return false
    const [c, v] = verseKey.split(":").map((n) => Number.parseInt(n, 10))
    return Boolean(bookmarksRes.value.data?.some((b) => b.type === "ayah" && b.key === c && b.verseNumber === v))
  })()

  const streak = streakRes.status === "fulfilled" ? (streakRes.value ?? 0) : 0

  const prev = RABBANAS[rabbana.id - 2]
  const next = RABBANAS[rabbana.id]

  return (
    <div className="min-h-screen paper-grain">
      <SiteHeader signedIn={Boolean(session)} userName={session?.name ?? session?.email} streak={streak} />

      <main className="mx-auto w-full max-w-2xl px-5 pb-24 pt-8 sm:px-8 sm:pt-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
          The Forty
        </Link>

        <header className="mt-10 flex flex-col items-center text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent-foreground/70">
            No. {String(rabbana.id).padStart(2, "0")} of the Forty
          </p>
          <h1 className="mt-3 text-balance text-3xl font-medium leading-tight text-foreground sm:text-4xl">
            {rabbana.theme}
          </h1>
          <p className="mt-2 font-mono text-xs tracking-wider text-muted-foreground">
            Qur&apos;an {verseKey}
            {verse.juz_number ? ` · Juzʾ ${verse.juz_number}` : ""}
          </p>
        </header>

        <section className="mt-12 rounded-2xl border border-border bg-card px-6 py-10 sm:px-10 sm:py-14">
          <p
            lang="ar"
            dir="rtl"
            className="font-arabic text-[2rem] leading-[2.3] text-foreground text-balance sm:text-[2.5rem]"
          >
            {verse.text_uthmani}
          </p>
          <hr className="my-8 border-dashed border-border" />
          <p className="text-pretty text-lg leading-relaxed text-foreground/90 sm:text-xl">
            {translation}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            — {verse.translations?.[0]?.resource_name ?? "Saheeh International"}
          </p>
        </section>

        {audioUrl ? <AudioPlayer src={audioUrl} className="mt-8" /> : null}

        <VerseActions verseKey={verseKey} isBookmarked={isBookmarked} signedIn={Boolean(session)} className="mt-8" />

        <nav className="mt-14 flex items-center justify-between gap-3 border-t border-border pt-6">
          {prev ? (
            <Link
              href={`/r/${prev.verseKey.replace(":", "-")}`}
              className="group flex flex-col gap-1 rounded-lg px-2 py-1 text-left transition hover:text-primary"
            >
              <span className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                <ArrowLeft className="h-3 w-3" /> Previous
              </span>
              <span className="text-sm font-medium text-foreground group-hover:text-primary text-balance">
                {prev.theme}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/r/${next.verseKey.replace(":", "-")}`}
              className="group flex flex-col items-end gap-1 rounded-lg px-2 py-1 text-right transition hover:text-primary"
            >
              <span className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                Next <ArrowRight className="h-3 w-3" />
              </span>
              <span className="text-sm font-medium text-foreground group-hover:text-primary text-balance">
                {next.theme}
              </span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </main>
    </div>
  )
}
