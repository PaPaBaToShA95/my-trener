import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

import { Navigation } from "@/components/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NavigationVisibilityProvider } from "@/components/navigation-visibility";
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
          <NavigationVisibilityProvider>
            <UserProvider>
              <Navigation />
              <main className="min-h-screen bg-background px-4 pb-12 pt-6 md:px-10">
                {children}
              </main>
            </UserProvider>
          </NavigationVisibilityProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
