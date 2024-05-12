"use client";
import { api } from "@/trpc/react";

export default function Attendance() {
  const attendance = api.statsRouter.attendance.useQuery();
  console.log(attendance.data);

  return <>attendance</>;
}
