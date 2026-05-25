/**
 * Quran Foundation OAuth2 + API configuration.
 *
 * We default to the pre-production stack since most newly-issued Request
 * Access clients live there. Set QF_ENV=production to switch both the
 * auth and API base URLs together.
 */
export type QfEnv = "prelive" | "production"

export type QfConfig = {
  env: QfEnv
  clientId: string
  clientSecret: string
  authBaseUrl: string
  apiBaseUrl: string
  contentApiBaseUrl: string
  userApiBaseUrl: string
}

const ENV_BASES: Record<QfEnv, { auth: string; api: string }> = {
  prelive: {
    auth: "https://prelive-oauth2.quran.foundation",
    api: "https://apis-prelive.quran.foundation",
  },
  production: {
    auth: "https://oauth2.quran.foundation",
    api: "https://apis.quran.foundation",
  },
}

export function getQfConfig(): QfConfig {
  const clientId = process.env.QF_CLIENT_ID
  const clientSecret = process.env.QF_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing Quran Foundation API credentials. Request access: https://api-docs.quran.foundation/request-access",
    )
  }
  const envValue = (process.env.QF_ENV ?? "prelive").toLowerCase()
  const env: QfEnv = envValue === "production" ? "production" : "prelive"
  const bases = ENV_BASES[env]
  return {
    env,
    clientId,
    clientSecret,
    authBaseUrl: bases.auth,
    apiBaseUrl: bases.api,
    contentApiBaseUrl: `${bases.api}/content/api/v4`,
    userApiBaseUrl: `${bases.api}/auth/v1`,
  }
}

export function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3000"
}

export function getRedirectUri(): string {
  return `${getAppBaseUrl()}/api/auth/callback`
}
