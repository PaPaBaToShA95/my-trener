import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { Navigation } from "@/components/navigation";
import { NavigationVisibilityProvider } from "@/components/navigation-visibility";
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
  title: "My Trener",
  description: "Платформа для відстеження тренувань",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="uk">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-slate-50 font-sans antialiased`}
      >
        <NavigationVisibilityProvider>
          <div className="flex min-h-screen flex-col">
            <Navigation />
            <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
              {children}
            </main>
            <footer className="border-t border-slate-200 bg-white py-6">
              <p className="mx-auto max-w-5xl text-sm text-slate-500">
                © {new Date().getFullYear()} My Trener. Усі права захищено.
              </p>
            </footer>
          </div>
        </NavigationVisibilityProvider>
      </body>
    </html>
  );
}
