import { NextResponse, type NextRequest } from "next/server"
import { exchangeCodeForSession, readAndClearPkceCookie, writeSession } from "@/lib/qf/session"
import { getAppBaseUrl } from "@/lib/qf/config"

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const error = url.searchParams.get("error")
  const base = getAppBaseUrl()

  const pkce = await readAndClearPkceCookie()
  if (error) {
    return NextResponse.redirect(`${base}/?auth_error=${encodeURIComponent(error)}`)
  }
  if (!code || !state || !pkce || pkce.state !== state) {
    return NextResponse.redirect(`${base}/?auth_error=invalid_state`)
  }
  try {
    const session = await exchangeCodeForSession({
      code,
      codeVerifier: pkce.codeVerifier,
      redirectUri: pkce.redirectUri,
    })
    await writeSession(session)
    const dest = pkce.returnTo && pkce.returnTo.startsWith("/") ? pkce.returnTo : "/"
    return NextResponse.redirect(`${base}${dest}`)
  } catch {
    return NextResponse.redirect(`${base}/?auth_error=exchange_failed`)
  }
}
