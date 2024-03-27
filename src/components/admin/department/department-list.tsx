"use client";
import { api } from "@/trpc/react";

export default function DepartmentList() {
  const { data: departmentList = [], isLoading } =
    api.departmentRouter.getAll.useQuery();

  if (isLoading) return <p>Loading...</p>;

  return (
    <>
      {departmentList.map((department) => (
        <p key={department.id}>{department.name}</p>
      ))}
    </>
  );
}
