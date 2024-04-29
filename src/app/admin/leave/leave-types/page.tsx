import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
// UTILS
import { createApiHelper } from "@/trpc/server";
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
import { LeaveTypeTable } from "@/components/admin/tables";
import AdminMainWrapper from "@/components/admin/admin-main-wrapper";
import CreateLeaveTypeForm from "@/components/admin/leave/create-leave-type-form";

export default async function LeaveTypesPage() {
  await authPage("ADMIN");

  const apiHelper = await createApiHelper();
  await apiHelper.leaveRouter.getLeaveTypes.prefetch();
  const leaveTypes = dehydrate(apiHelper.queryClient);

  return (
    <AdminMainWrapper className="flex gap-3">
      <Card className="h-fit flex-1">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Leave Types</CardTitle>
          <CardDescription>Types of leaves employees can take</CardDescription>
        </CardHeader>
        <CardContent>
          <HydrationBoundary state={leaveTypes}>
            <LeaveTypeTable />
          </HydrationBoundary>
        </CardContent>
      </Card>
      <CreateLeaveTypeForm />
    </AdminMainWrapper>
  );
}
