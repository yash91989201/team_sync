import Link from "next/link";
// CUSTOM COMPONENTS
import EmployeeList from "@/components/admin/employee/employee-list";

export default function EmployeePage() {
  return (
    <>
      <Link href="/admin/employees/new-employee">New Employee</Link>
      <EmployeeList />
    </>
  );
}
