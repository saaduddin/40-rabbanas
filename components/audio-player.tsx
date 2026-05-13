"use client"

import { useEffect, useRef, useState } from "react"
import { Pause, Play, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Minimal audio player for a single ayah recitation.
 * Shows progress and a simple play/pause/restart control row.
 */
export function AudioPlayer({ src, className }: { src: string; className?: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const onTime = () => setProgress(a.currentTime)
    const onLoaded = () => setDuration(a.duration || 0)
    const onEnd = () => {
      setPlaying(false)
      setProgress(0)
    }
    a.addEventListener("timeupdate", onTime)
    a.addEventListener("loadedmetadata", onLoaded)
    a.addEventListener("ended", onEnd)
    return () => {
      a.removeEventListener("timeupdate", onTime)
      a.removeEventListener("loadedmetadata", onLoaded)
      a.removeEventListener("ended", onEnd)
    }
  }, [])

  function toggle() {
    const a = audioRef.current
    if (!a) return
    if (playing) {
      a.pause()
      setPlaying(false)
    } else {
      void a.play()
      setPlaying(true)
    }
  }

  function restart() {
    const a = audioRef.current
    if (!a) return
    a.currentTime = 0
    void a.play()
    setPlaying(true)
  }

  const pct = duration > 0 ? (progress / duration) * 100 : 0

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border border-border bg-card px-4 py-3",
        className,
      )}
    >
      <audio ref={audioRef} src={src} preload="metadata" />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause recitation" : "Play recitation"}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90"
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-medium text-foreground">Mishary Alafasy</span>
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
            {formatTime(progress)} / {formatTime(duration)}
          </span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-[width]"
            style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
          />
        </div>
      </div>
      <button
        type="button"
        onClick={restart}
        aria-label="Restart recitation"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-primary"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  )
}

function formatTime(secs: number) {
  if (!Number.isFinite(secs) || secs < 0) return "0:00"
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${String(s).padStart(2, "0")}`
}
