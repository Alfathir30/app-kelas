import type React from "react"
import type { Metadata } from "next"
import "@/styles/globals.css" // Import globals.css here

export const metadata: Metadata = {
  title: "TKJ2 Class App",
  description: "Aplikasi Mobile untuk Manajemen Kelas XI TKJ2",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  )
}
