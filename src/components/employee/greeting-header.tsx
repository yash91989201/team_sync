"use client";
// CUSTOM HOOKS
import useGreeting from "@/hooks/use-greeting";
// CUSTOM COMPONENTS
import CurrentTimeCard from "@/components/employee/current-time-card"

export default function GreetingHeader() {
  const greeting = useGreeting();

  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-semibold">{greeting}</h2>
      <CurrentTimeCard />
    </div>
  );
}
