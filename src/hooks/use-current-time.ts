"use client"
import { useEffect, useState } from "react";
// UTILS
import { formatTime } from "@/lib/date-time-utils";

export default function useCurrentTime(formatStr = "HH:mm a") {
  const [time, setTime] = useState(formatTime(undefined, formatStr));

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(formatTime(undefined, formatStr));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [formatStr]);

  return time
}