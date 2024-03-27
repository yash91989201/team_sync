import EmployeeList from "@/components/admin/employee/employee-list";
import Link from "next/link";

export default function EmployeePage() {
  return (
    <>
      <Link href="/admin/employees/new-employee">New Employee</Link>
      <EmployeeList />
    </>
  );
}
