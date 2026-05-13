import { Bookmark } from "lucide-react"

export function BookmarkPill() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-medium text-accent-foreground"
      title="Bookmarked"
    >
      <Bookmark className="h-3 w-3 fill-accent text-accent" aria-hidden />
      Saved
    </span>
  )
}
