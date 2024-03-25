// CUSTOM COMPONENTS
import LogInForm from "@/components/auth/log-in-form";

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <LogInForm role="EMPLOYEE" />
    </main>
  );
}
