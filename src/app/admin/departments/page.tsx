// CUSTOM COMPONENTS
import DepartmentList from "@/components/admin/department/department-list";
import CreateDepartmentForm from "@/components/admin/department/create-department-form";

export default function DepartmentsPage() {
  return (
    <>
      departments page
      <CreateDepartmentForm />
      <DepartmentList />
    </>
  );
}
