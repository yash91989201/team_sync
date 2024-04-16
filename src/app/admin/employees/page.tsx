// UTILS
import { authPage } from "@/server/helpers";
// CUSTOM COMPONENTS
import EmployeeList from "@/components/admin/employee/employee-list";

export default async function EmployeePage() {
  await authPage("ADMIN");
  return (
    <>
      <EmployeeList />
    </>
  );
}
