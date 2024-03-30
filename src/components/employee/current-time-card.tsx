"use client";
import { getCurrentTimeWithPeriod } from "@/lib/utils";
import { Clock5 } from "lucide-react";
import React, { useState, useEffect } from "react";

export default function CurrentTimeCard() {
  const [time, setTime] = useState(getCurrentTimeWithPeriod());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(getCurrentTimeWithPeriod());
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
