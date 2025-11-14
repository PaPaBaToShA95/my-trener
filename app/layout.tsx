import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { Navigation } from "@/components/navigation";
import { NavigationVisibilityProvider } from "@/components/navigation-visibility";
import "./globals.css";
import { UserProvider } from "@/lib/user/user-context";

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
          <UserProvider>
            <Navigation />
            <main className="min-h-screen bg-slate-50">
              {children}
            </main>
          </UserProvider>
        </NavigationVisibilityProvider>
      </body>
    </html>
  );
}
