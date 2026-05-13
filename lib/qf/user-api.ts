import { getQfConfig } from "./config"
import { getValidSession, type QfSession } from "./session"

async function userFetch<T>(
  path: string,
  init: RequestInit & { session?: QfSession; timezone?: string } = {},
): Promise<T> {
  const cfg = getQfConfig()
  const session = init.session ?? (await getValidSession())
  if (!session) throw new Error("Not authenticated")

  const url = `${cfg.userApiBaseUrl}${path}`
  const headers: Record<string, string> = {
    Accept: "application/json",
    "x-auth-token": session.accessToken,
    "x-client-id": cfg.clientId,
    ...(init.timezone ? { "x-timezone": init.timezone } : {}),
    ...((init.headers as Record<string, string>) ?? {}),
  }
  if (init.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json"

  const res = await fetch(url, { ...init, headers, cache: "no-store" })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`User API ${path} failed: ${res.status} ${text.slice(0, 300)}`)
  }
  // Some delete endpoints may return empty bodies.
  const text = await res.text()
  return (text ? JSON.parse(text) : ({} as T)) as T
}

// ---------- Bookmarks ----------

export type UserBookmark = {
  id: string
  createdAt: string
  type: "ayah" | string
  key: number // chapter number
  verseNumber: number
  group?: string
  isInDefaultCollection?: boolean
  isReading?: boolean
}

/**
 * Add (or update) a bookmark for an ayah.
 * Body shape per Quran Foundation User APIs.
 */
export async function addBookmark(verseKey: string) {
  const [chapter, verse] = verseKey.split(":").map((n) => Number.parseInt(n, 10))
  return userFetch<{ success: boolean; data: UserBookmark }>("/bookmarks", {
    method: "POST",
    body: JSON.stringify({
      type: "ayah",
      key: chapter,
      verseNumber: verse,
      mushafId: 4, // UthmaniHafs
    }),
  })
}

export async function deleteBookmark(id: string) {
  return userFetch<{ success: boolean }>(`/bookmarks/${encodeURIComponent(id)}`, {
    method: "DELETE",
  })
}

export async function listBookmarks() {
  return userFetch<{ success: boolean; data: UserBookmark[] }>("/bookmarks?type=ayah&first=200")
}

// ---------- Activity Days + Streak ----------

/**
 * Mark today as a "recited" day for the Qur'an activity stream. We log a
 * tiny amount of time (5 seconds) and the verse range of the rabbana the
 * user just recited. This contributes to their streak.
 */
export async function logActivityDay(opts: { verseKey: string; seconds?: number; timezone: string }) {
  const [chapter, verse] = opts.verseKey.split(":").map((n) => Number.parseInt(n, 10))
  const range = `${chapter}:${verse}-${chapter}:${verse}`
  return userFetch<{ success: boolean }>("/activity-days", {
    method: "POST",
    timezone: opts.timezone,
    body: JSON.stringify({
      type: "QURAN",
      seconds: Math.max(1, opts.seconds ?? 5),
      ranges: [range],
      mushafId: 4,
    }),
  })
}

export async function getCurrentStreak(timezone: string) {
  const data = await userFetch<{ success: boolean; data: { days: number }[] }>(
    `/streaks/current-streak-days?type=QURAN`,
    { timezone },
  )
  return data.data?.[0]?.days ?? 0
}
