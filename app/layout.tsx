import type { Metadata, Viewport } from "next"
import { Cormorant_Garamond, Amiri } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import "./globals.css"

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
})

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Forty Rabbanas — A Quiet Practice",
  description:
    "Read, recite, and reflect on the forty Rabbana supplications from the Qur'an. Bookmark verses, track your daily recitation streak, and listen to recitations.",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#f4ecd8",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${amiri.variable} bg-background`}>
      <body className="font-serif antialiased text-foreground">
        {children}
        <Toaster position="top-center" theme="light" toastOptions={{ style: { fontFamily: "var(--font-cormorant)" } }} />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
