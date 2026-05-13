"use server"

import { revalidatePath } from "next/cache"
import { getValidSession } from "@/lib/qf/session"
import { addBookmark, deleteBookmark, listBookmarks, logActivityDay } from "@/lib/qf/user-api"

export type ActionResult = { ok: true } | { ok: false; error: string }

export async function toggleBookmarkAction(verseKey: string): Promise<ActionResult> {
  const session = await getValidSession()
  if (!session) return { ok: false, error: "Please sign in to bookmark verses." }
  try {
    const existing = await listBookmarks()
    const [chapter, verse] = verseKey.split(":").map((n) => Number.parseInt(n, 10))
    const found = existing.data?.find((b) => b.type === "ayah" && b.key === chapter && b.verseNumber === verse)
    if (found) {
      await deleteBookmark(found.id)
    } else {
      await addBookmark(verseKey)
    }
    revalidatePath("/")
    revalidatePath(`/r/${chapter}-${verse}`)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export async function markRecitedAction(input: {
  verseKey: string
  timezone: string
  seconds?: number
}): Promise<ActionResult> {
  const session = await getValidSession()
  if (!session) return { ok: false, error: "Please sign in to track your recitation." }
  try {
    await logActivityDay({
      verseKey: input.verseKey,
      timezone: input.timezone || "UTC",
      seconds: input.seconds ?? 8,
    })
    revalidatePath("/")
    revalidatePath(`/r/${input.verseKey.replace(":", "-")}`)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}
