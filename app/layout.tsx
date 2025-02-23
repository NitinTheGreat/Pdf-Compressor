import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PDF Compressor - Compress PDFs While Maintaining Quality",
  description:
    "Compress multiple PDFs simultaneously while maintaining quality. Set custom sizes, preview before downloading, and batch process up to 3 files at once.",
  keywords: ["PDF compression", "PDF tools", "file compression", "document tools", "PDF size reducer"],
  openGraph: {
    title: "PDF Compressor - Compress PDFs While Maintaining Quality",
    description:
      "Compress multiple PDFs simultaneously while maintaining quality. Set custom sizes, preview before downloading, and batch process up to 3 files at once.",
    type: "website",
    locale: "en_US",
    url: "https://pdf-compressor.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF Compressor - Compress PDFs While Maintaining Quality",
    description:
      "Compress multiple PDFs simultaneously while maintaining quality. Set custom sizes, preview before downloading, and batch process up to 3 files at once.",
  },
  authors: [{ name: "Your Name" }],
  creator: "Your Name",
  publisher: "Your Name",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}

