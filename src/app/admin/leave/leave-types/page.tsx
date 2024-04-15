// UTILS
import { authPage } from "@/server/helpers";
// CUSTOM COMPONENTS
import CreateLeaveTypeForm from "@/components/admin/leave/create-leave-type-form";

export default async function LeaveTypesPage() {
  await authPage("ADMIN");

  return (
    <>
      <CreateLeaveTypeForm />
    </>
  );
}
