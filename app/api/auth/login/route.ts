import { NextResponse, type NextRequest } from "next/server"
import { getQfConfig, getRedirectUri } from "@/lib/qf/config"
import { generatePkcePair, randomString } from "@/lib/qf/pkce"
import { setPkceCookie } from "@/lib/qf/session"

/**
 * Kick off the OAuth2 Authorization Code + PKCE flow.
 * Scopes requested cover everything the app uses:
 *  - openid + offline_access  → identity + refresh tokens
 *  - bookmark.*               → favoriting rabbanas
 *  - activity_day.*           → "mark recited today"
 *  - streak.read              → reading the current streak
 */
export async function GET(req: NextRequest) {
  const cfg = getQfConfig()
  const url = new URL(req.url)
  const returnTo = url.searchParams.get("returnTo") ?? "/"

  const redirectUri = getRedirectUri()
  const { codeVerifier, codeChallenge } = generatePkcePair()
  const state = randomString(16)
  const nonce = randomString(16)

  await setPkceCookie({ state, nonce, codeVerifier, redirectUri, returnTo })

  const params = new URLSearchParams()
  params.set("response_type", "code")
  params.set("client_id", cfg.clientId)
  params.set("redirect_uri", redirectUri)
  params.set(
    "scope",
    [
      "openid",
      "offline_access",
      "bookmark",
      "bookmark.read",
      "bookmark.create",
      "bookmark.delete",
      "activity_day",
      "activity_day.read",
      "activity_day.create",
      "streak",
      "streak.read",
    ].join(" "),
  )
  params.set("state", state)
  params.set("nonce", nonce)
  params.set("code_challenge", codeChallenge)
  params.set("code_challenge_method", "S256")

  return NextResponse.redirect(`${cfg.authBaseUrl}/oauth2/auth?${params.toString()}`)
}
