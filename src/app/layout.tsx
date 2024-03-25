import "@/styles/globals.css";

import { Inter } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/react";
import NextUIProviderWrapper from "@/providers/next-ui-provider-wrapper";
import SessionProvider from "@/providers/session-provider";
import { validateRequest } from "@/lib/auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
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
          <NextUIProviderWrapper>
            <SessionProvider user={user}>{children}</SessionProvider>
          </NextUIProviderWrapper>
        </TRPCReactProvider>
        <Toaster richColors theme="light" />
      </body>
    </html>
  );
}
