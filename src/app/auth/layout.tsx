// TYPES
import type { ReactNode } from "react";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="flex h-screen w-full items-center justify-center">
      {children}
    </main>
  );
}
