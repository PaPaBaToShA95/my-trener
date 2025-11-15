import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

import { MobileAuthGate } from "@/components/auth/mobile-auth-gate";
import { AppHeader } from "@/components/app-header";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/lib/user/user-context";
import { cn } from "@/lib/utils";

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
    <html lang="uk" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased",
          geistSans.variable,
          geistMono.variable
        )}
      >
        <TooltipProvider delayDuration={150}>
          <UserProvider>
            <MobileAuthGate>
              <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-4 pb-10 pt-6 sm:max-w-2xl">
                <AppHeader />
                <main className="flex-1">{children}</main>
              </div>
            </MobileAuthGate>
          </UserProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
