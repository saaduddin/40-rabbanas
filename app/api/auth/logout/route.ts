import { NextResponse } from "next/server"
import { clearSession } from "@/lib/qf/session"
import { getAppBaseUrl } from "@/lib/qf/config"

export async function POST() {
  await clearSession()
  return NextResponse.redirect(`${getAppBaseUrl()}/`, { status: 303 })
}

export async function GET() {
  await clearSession()
  return NextResponse.redirect(`${getAppBaseUrl()}/`, { status: 303 })
}
