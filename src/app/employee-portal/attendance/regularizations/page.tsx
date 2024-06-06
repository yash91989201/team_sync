// UTILS
import { authPage } from "@/server/helpers";
// UI
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/tabs";
// CUSTOM COMPONENTS
import EmployeeMainWrapper from "@empLayouts/employee-main-wrapper";
import RegularizationHistory from "@empComponents/regularizations/regularization-history";
import PendingRegularizations from "@empComponents/regularizations/pending-regularizations";
import AttendanceRegularizations from "@empComponents/regularizations/attendance-regularization";

export default async function RegularizationsPage() {
  await authPage("EMPLOYEE");

  return (
    <EmployeeMainWrapper>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-primary">
            Attendance Regularization
          </CardTitle>
          <CardDescription>
            apply for regularization on your attendance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="apply" className="w-full">
            <TabsList className="mx-auto">
              <TabsTrigger value="apply">Apply</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="apply">
              <AttendanceRegularizations />
            </TabsContent>
            <TabsContent value="pending">
              <PendingRegularizations />
            </TabsContent>
            <TabsContent value="history">
              <RegularizationHistory />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </EmployeeMainWrapper>
  );
}
