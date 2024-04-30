"use client";
import React, { useState, useEffect } from "react";
// UTILS
import { getCurrentTimeDate, renderOnClient } from "@/lib/utils";
// ICONS
import { Clock5 } from "lucide-react";

function CurrentTimeCard() {
  const [time, setTime] = useState(getCurrentTimeDate());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(getCurrentTimeDate());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

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

export default renderOnClient(CurrentTimeCard);
