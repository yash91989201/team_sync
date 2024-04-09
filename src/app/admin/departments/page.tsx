// UTILS
import { authPage } from "@/server/helpers";
// CUSTOM COMPONENTS
import DepartmentList from "@/components/admin/department/department-list";
import CreateDepartmentForm from "@/components/admin/department/create-department-form";

export default async function DepartmentsPage() {
  await authPage("ADMIN");

  return (
    <>
      departments page
      <CreateDepartmentForm />
      <DepartmentList />
    </>
  );
}
