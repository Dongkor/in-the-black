import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "In the Black — Cash Flow for Trades",
  description: "Simple single-handed cash-flow tracking.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#080c14] text-slate-100 relative overflow-x-hidden">
        {/* 100% FIXED, STATIC ambient background gradient across the entire app */}
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            background: `
              radial-gradient(circle 420px at 90% 0%, rgba(0, 255, 102, 0.2), transparent 70%),
              radial-gradient(circle 420px at 40% 50%, rgba(0, 255, 102, 0.1), transparent 70%),
              radial-gradient(circle 380px at 10% 100%, rgba(0, 255, 102, 0.15), transparent 70%),
              #080c14
            `,
          }}
        />
        <div className="relative z-10 flex min-h-screen flex-col w-full">
          {children}
        </div>
      </body>
    </html>
  );
}
