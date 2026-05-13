import { getQfConfig } from "./config"

/**
 * Server-side Content API client using OAuth2 Client Credentials.
 * Caches the app-level access token in-memory across requests with a small
 * safety buffer before expiry.
 */
type CachedToken = { token: string; expiresAt: number }
let cached: CachedToken | null = null

async function getContentAccessToken(): Promise<string> {
  const now = Date.now()
  if (cached && cached.expiresAt - 30_000 > now) {
    return cached.token
  }
  const cfg = getQfConfig()
  const basic = Buffer.from(`${cfg.clientId}:${cfg.clientSecret}`).toString("base64")
  const body = new URLSearchParams()
  body.set("grant_type", "client_credentials")
  body.set("scope", "content")

  const res = await fetch(`${cfg.authBaseUrl}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basic}`,
    },
    body: body.toString(),
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Content token request failed: ${res.status} ${text.slice(0, 200)}`)
  }
  const data = (await res.json()) as { access_token: string; expires_in: number }
  cached = {
    token: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  }
  return data.access_token
}

async function contentFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const cfg = getQfConfig()
  const token = await getContentAccessToken()
  const url = path.startsWith("http") ? path : `${cfg.contentApiBaseUrl}${path}`
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      "x-auth-token": token,
      "x-client-id": cfg.clientId,
      ...(init?.headers ?? {}),
    },
    next: { revalidate: 60 * 60 * 24 }, // verses don't change; cache a day
  })
  if (res.status === 401) {
    cached = null
    const retryToken = await getContentAccessToken()
    const retry = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        "x-auth-token": retryToken,
        "x-client-id": cfg.clientId,
        ...(init?.headers ?? {}),
      },
      next: { revalidate: 60 * 60 * 24 },
    })
    if (!retry.ok) {
      const text = await retry.text().catch(() => "")
      throw new Error(`Content API failed: ${retry.status} ${text.slice(0, 200)}`)
    }
    return (await retry.json()) as T
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Content API failed: ${res.status} ${text.slice(0, 200)}`)
  }
  return (await res.json()) as T
}

export type VerseDetail = {
  id: number
  verse_key: string
  verse_number: number
  text_uthmani: string
  juz_number?: number
  page_number?: number
  audio?: { url: string } | null
  translations?: { id: number; resource_id: number; text: string; resource_name?: string }[]
  words?: { id: number; text_uthmani: string; translation?: { text: string } }[]
}

/**
 * Fetch a single ayah with Uthmani script, Saheeh International translation
 * (resource_id 131), and Mishary Alafasy recitation audio (recitation_id 7).
 */
export async function fetchVerseByKey(verseKey: string): Promise<VerseDetail> {
  const params = new URLSearchParams()
  params.set("language", "en")
  params.set("translations", "131")
  params.set("audio", "7")
  params.set("fields", "text_uthmani,juz_number,page_number")
  params.set("translation_fields", "resource_name,language_id")
  const data = await contentFetch<{ verse: VerseDetail }>(
    `/verses/by_key/${encodeURIComponent(verseKey)}?${params.toString()}`,
  )
  return data.verse
}

/**
 * Fetch many verses in parallel. Used to prefetch each Rabbana's Arabic text
 * for the home index list.
 */
export async function fetchVersesByKeys(verseKeys: string[]): Promise<VerseDetail[]> {
  const results = await Promise.all(verseKeys.map((k) => fetchVerseByKey(k).catch(() => null)))
  return results.filter((v): v is VerseDetail => v !== null)
}
