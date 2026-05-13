"use client"

import { useEffect } from "react"
import { toast } from "sonner"

const MESSAGES: Record<string, string> = {
  invalid_state: "Your sign-in session expired. Please try again.",
  exchange_failed: "We couldn't complete sign-in. Please try again.",
  access_denied: "Sign-in was cancelled.",
}

export function AuthErrorToast({ error }: { error: string }) {
  useEffect(() => {
    toast.error(MESSAGES[error] ?? `Sign-in failed: ${error}`)
  }, [error])
  return null
}
