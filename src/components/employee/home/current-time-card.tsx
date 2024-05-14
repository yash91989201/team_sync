"use client";
// UTILS
import { renderOnClient } from "@/lib/utils";
// CUSTOM HOOKS
import useCurrentTime from "@/hooks/use-current-time";
// ICONS
import { Clock5 } from "lucide-react";

function CurrentTimeCard() {
  const time = useCurrentTime();

  return (
    <div className="flex h-fit w-fit items-center gap-6 rounded-lg border bg-white p-3 px-6">
      <div className="space-y-2">
        <p className="text-xs text-gray-500">Current time</p>
        <p className="text-2xl font-semibold">{time}</p>
      </div>
      <Clock5 />
    </div>
  );
}

export default renderOnClient(CurrentTimeCard, null);
