// UTILS
import { api } from "@/trpc/server";
import { authPage } from "@/server/helpers";
// UI
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// CUSTOM COMPONENTS
import AdminMainWrapper from "@/components/admin/admin-main-wrapper";
import LeaveTypeTable from "@/components/admin/leave/leave-type-table";
import CreateLeaveTypeForm from "@/components/admin/leave/create-leave-type-form";

export default async function LeaveTypesPage() {
  await authPage("ADMIN");

  const leaveTypes = await api.leaveRouter.getLeaveTypes();

  return (
    <AdminMainWrapper className="flex gap-3">
      <Card className="h-fit flex-1">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Leave Types</CardTitle>
          <CardDescription>Types of leaves employees can take</CardDescription>
        </CardHeader>
        <CardContent>
          <LeaveTypeTable initialData={leaveTypes} />
        </CardContent>
      </Card>
      <CreateLeaveTypeForm />
    </AdminMainWrapper>
  );
}
