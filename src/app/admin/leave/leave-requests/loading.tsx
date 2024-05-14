// UI
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// CUSTOM COMPONENTS
import AdminMainWrapper from "@adminComponents/layouts/admin-main-wrapper";
import { LeaveRequestsTableSkeleton } from "@adminComponents/leave/leave-requests-table";

export default async function LeaveRequestsPoading() {
  return (
    <AdminMainWrapper>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-primary">
            Leave requests
          </CardTitle>
          <CardDescription>
            leave requests made by all employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LeaveRequestsTableSkeleton />
        </CardContent>
      </Card>
    </AdminMainWrapper>
  );
}
