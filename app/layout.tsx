import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vantra — Observability for AI Agents",
  description: "See exactly what your AI agents are doing in production. Traces, costs, errors, and anomaly alerts in 3 lines of code.",
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', sizes: '256x256', type: 'image/png' },
    ],
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'Vantra — Observability for AI Agents',
    description: 'See exactly what your AI agents are doing in production. Traces, costs, errors, and anomaly alerts in 3 lines of code.',
    url: 'https://vantra.dev',
    siteName: 'Vantra',
    images: [{ url: 'https://vantra.dev/og.png', width: 1920, height: 1080 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vantra — Observability for AI Agents',
    description: 'See exactly what your AI agents are doing in production. Traces, costs, errors, and anomaly alerts in 3 lines of code.',
    images: ['https://vantra.dev/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-white">
        {children}
      </body>
    </html>
  );
}
