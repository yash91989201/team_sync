import { api } from "@/trpc/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LeaveApplyPage() {
  const employeeLeaveBalances = await api.leaveRouter.getLeaveBalance();
  return (
    <div>
      {employeeLeaveBalances.map(({ id, type, daysAllowed, balance }) => (
        <Card key={id}>
          <CardHeader>
            <CardTitle>{type}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              {balance}/{daysAllowed}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
