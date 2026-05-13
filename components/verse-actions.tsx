"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Bookmark, Check, CircleCheck, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { toggleBookmarkAction, markRecitedAction } from "@/app/actions"

export function VerseActions({
  verseKey,
  isBookmarked,
  signedIn,
  className,
}: {
  verseKey: string
  isBookmarked: boolean
  signedIn: boolean
  className?: string
}) {
  const [bookmarked, setBookmarked] = useState(isBookmarked)
  const [recitedNow, setRecitedNow] = useState(false)
  const [pendingBookmark, startBookmark] = useTransition()
  const [pendingRecite, startRecite] = useTransition()

  if (!signedIn) {
    return (
      <div className={cn("flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center", className)}>
        <p className="text-sm text-muted-foreground">
          Sign in to bookmark this duʿā and track your daily recitation.
        </p>
        <Link
          href={`/api/auth/login?returnTo=${encodeURIComponent(`/r/${verseKey.replace(":", "-")}`)}`}
          className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          Sign in
        </Link>
      </div>
    )
  }

  function onToggleBookmark() {
    startBookmark(async () => {
      const next = !bookmarked
      setBookmarked(next) // optimistic
      const res = await toggleBookmarkAction(verseKey)
      if (!res.ok) {
        setBookmarked(!next)
        toast.error(res.error)
      } else {
        toast.success(next ? "Saved to your bookmarks" : "Removed from bookmarks")
      }
    })
  }

  function onMarkRecited() {
    startRecite(async () => {
      const tz =
        typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" : "UTC"
      const res = await markRecitedAction({ verseKey, timezone: tz, seconds: 10 })
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      setRecitedNow(true)
      toast.success("Recorded for today. May Allah accept.")
    })
  }

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:justify-center", className)}>
      <button
        type="button"
        onClick={onToggleBookmark}
        disabled={pendingBookmark}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition",
          bookmarked
            ? "border-accent/40 bg-accent/15 text-accent-foreground hover:bg-accent/25"
            : "border-border bg-card text-foreground hover:border-primary/40 hover:text-primary",
        )}
        aria-pressed={bookmarked}
      >
        {pendingBookmark ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Bookmark className={cn("h-4 w-4", bookmarked && "fill-accent text-accent")} aria-hidden />
        )}
        {bookmarked ? "Bookmarked" : "Bookmark"}
      </button>

      <button
        type="button"
        onClick={onMarkRecited}
        disabled={pendingRecite || recitedNow}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition",
          recitedNow
            ? "bg-primary/15 text-primary"
            : "bg-primary text-primary-foreground hover:bg-primary/90",
          (pendingRecite || recitedNow) && "cursor-default",
        )}
      >
        {pendingRecite ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : recitedNow ? (
          <CircleCheck className="h-4 w-4" aria-hidden />
        ) : (
          <Check className="h-4 w-4" aria-hidden />
        )}
        {recitedNow ? "Recited today" : "Mark recited today"}
      </button>
    </div>
  )
}
