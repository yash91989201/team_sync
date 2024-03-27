import CreateDepartmentForm from "@/components/admin/department/create-department-form";
import DepartmentList from "@/components/admin/department/department-list";

export default function DepartmentsPage() {
  return (
    <>
      departments page
      <CreateDepartmentForm />
      <DepartmentList />
    </>
  );
}
