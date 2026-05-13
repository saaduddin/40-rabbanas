import { Flame } from "lucide-react"
import { cn } from "@/lib/utils"

export function StreakBadge({ days, className }: { days: number; className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-foreground",
        className,
      )}
      aria-label={`Current recitation streak: ${days} day${days === 1 ? "" : "s"}`}
    >
      <Flame className="h-4 w-4 text-accent" aria-hidden />
      <span className="font-mono tabular-nums text-base">{days}</span>
      <span className="text-muted-foreground">{days === 1 ? "day" : "days"} of recitation</span>
    </div>
  )
}
