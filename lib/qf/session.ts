import { cookies } from "next/headers"
import { SignJWT, jwtVerify, decodeJwt } from "jose"
import { getQfConfig, getRedirectUri } from "./config"

/**
 * Session model — we keep refresh tokens in encrypted (signed) HTTP-only
 * cookies. Access tokens are short-lived (1 hour) so we also keep an
 * access-token cookie with the matching expiry; if it's missing or stale
 * we refresh on demand using the refresh token.
 */
export type QfSession = {
  sub: string
  name?: string
  email?: string
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: number // epoch ms
  scope?: string
}

const SESSION_COOKIE = "qf_session"
const PKCE_COOKIE = "qf_pkce"
const SESSION_TTL_DAYS = 30

function secret(): Uint8Array {
  const s = process.env.SESSION_SECRET
  if (!s) throw new Error("Missing SESSION_SECRET")
  return new TextEncoder().encode(s)
}

async function signPayload(payload: Record<string, unknown>): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_DAYS}d`)
    .sign(secret())
}

async function readSignedPayload<T = Record<string, unknown>>(jwt: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(jwt, secret())
    return payload as T
  } catch {
    return null
  }
}

export async function setPkceCookie(data: {
  state: string
  nonce: string
  codeVerifier: string
  redirectUri: string
  returnTo: string
}) {
  const token = await signPayload(data)
  const jar = await cookies()
  jar.set(PKCE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 min
  })
}

export async function readAndClearPkceCookie() {
  const jar = await cookies()
  const c = jar.get(PKCE_COOKIE)
  if (!c) return null
  jar.delete(PKCE_COOKIE)
  return await readSignedPayload<{
    state: string
    nonce: string
    codeVerifier: string
    redirectUri: string
    returnTo: string
  }>(c.value)
}

export async function writeSession(session: QfSession) {
  const token = await signPayload(session as unknown as Record<string, unknown>)
  const jar = await cookies()
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * SESSION_TTL_DAYS,
  })
}

export async function clearSession() {
  const jar = await cookies()
  jar.delete(SESSION_COOKIE)
}

export async function getRawSession(): Promise<QfSession | null> {
  const jar = await cookies()
  const c = jar.get(SESSION_COOKIE)
  if (!c) return null
  const payload = await readSignedPayload<QfSession & { exp?: number; iat?: number }>(c.value)
  if (!payload) return null
  // jose adds iat/exp on top — strip and return just our fields.
  return {
    sub: payload.sub,
    name: payload.name,
    email: payload.email,
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    accessTokenExpiresAt: payload.accessTokenExpiresAt,
    scope: payload.scope,
  }
}

async function refreshAccessToken(refreshToken: string) {
  const cfg = getQfConfig()
  const basic = Buffer.from(`${cfg.clientId}:${cfg.clientSecret}`).toString("base64")
  const body = new URLSearchParams()
  body.set("grant_type", "refresh_token")
  body.set("refresh_token", refreshToken)
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
    throw new Error(`Refresh failed: ${res.status} ${text.slice(0, 200)}`)
  }
  return (await res.json()) as {
    access_token: string
    refresh_token?: string
    expires_in: number
    id_token?: string
    scope?: string
  }
}

/**
 * Returns a valid session (refreshing the access token if needed) or null
 * when the user is not signed in / their refresh token is invalid.
 */
export async function getValidSession(): Promise<QfSession | null> {
  const s = await getRawSession()
  if (!s) return null
  if (s.accessTokenExpiresAt - 30_000 > Date.now()) {
    return s
  }
  try {
    const refreshed = await refreshAccessToken(s.refreshToken)
    const next: QfSession = {
      ...s,
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token ?? s.refreshToken,
      accessTokenExpiresAt: Date.now() + refreshed.expires_in * 1000,
      scope: refreshed.scope ?? s.scope,
    }
    await writeSession(next)
    return next
  } catch {
    await clearSession()
    return null
  }
}

/**
 * Exchange the authorization code received at the callback for tokens.
 * Confidential client: HTTP Basic with client_id:client_secret.
 */
export async function exchangeCodeForSession(opts: {
  code: string
  codeVerifier: string
  redirectUri?: string
}): Promise<QfSession> {
  const cfg = getQfConfig()
  const basic = Buffer.from(`${cfg.clientId}:${cfg.clientSecret}`).toString("base64")
  const body = new URLSearchParams()
  body.set("grant_type", "authorization_code")
  body.set("code", opts.code)
  body.set("redirect_uri", opts.redirectUri ?? getRedirectUri())
  body.set("code_verifier", opts.codeVerifier)

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
    throw new Error(`Token exchange failed: ${res.status} ${text.slice(0, 300)}`)
  }
  const data = (await res.json()) as {
    access_token: string
    refresh_token: string
    expires_in: number
    id_token?: string
    scope?: string
  }
  let sub = ""
  let name: string | undefined
  let email: string | undefined
  if (data.id_token) {
    try {
      const claims = decodeJwt(data.id_token) as {
        sub?: string
        email?: string
        first_name?: string
        last_name?: string
        name?: string
      }
      sub = claims.sub ?? ""
      email = claims.email
      const composed = [claims.first_name, claims.last_name].filter(Boolean).join(" ").trim()
      name = claims.name || composed || undefined
    } catch {
      // ignore malformed id_token
    }
  }
  return {
    sub,
    name,
    email,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    accessTokenExpiresAt: Date.now() + data.expires_in * 1000,
    scope: data.scope,
  }
}
