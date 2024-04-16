import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "@ui/sonner";
// UTILS
import { TRPCReactProvider } from "@/trpc/react";
import { validateRequest } from "@/lib/auth";
// PROVIDERS
import SessionProvider from "@/providers/session-provider";
// TYPES
import type { Metadata } from "next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Team Sync",
  description: "Employee management application",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await validateRequest();

  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        <TRPCReactProvider>
          <SessionProvider user={user}>{children}</SessionProvider>
        </TRPCReactProvider>
        <Toaster richColors theme="light" />
      </body>
    </html>
  );
}
