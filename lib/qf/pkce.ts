import { randomBytes, createHash } from "node:crypto"

function base64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

export function generatePkcePair() {
  const codeVerifier = base64url(randomBytes(32))
  const codeChallenge = base64url(createHash("sha256").update(codeVerifier).digest())
  return { codeVerifier, codeChallenge }
}

export function randomString(bytes = 16) {
  return randomBytes(bytes).toString("hex")
}
