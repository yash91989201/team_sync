"use client";
import { useState } from "react";
import { endOfMonth, format, startOfMonth, startOfToday } from "date-fns";

export default function GeneratePayslip() {
  const today = startOfToday();
  const [currentMonth, setCurrentMonth] = useState(format(today, "MMMM-yyyy"));
  const firstDayOfMonth = startOfMonth(today);
  const lastDayOfMonth = endOfMonth(today);

  return (
    <div>
      <div></div>
    </div>
  );
}
