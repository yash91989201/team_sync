"use client";
import { api } from "@/trpc/react";

export default function DesignationList() {
  const { data: designationList = [], isLoading } =
    api.designationRouter.getAll.useQuery();

  if (isLoading) return <p>Loading...</p>;

  return (
    <>
      {designationList.map((designation) => (
        <p key={designation.id}>{designation.name}</p>
      ))}
    </>
  );
}
