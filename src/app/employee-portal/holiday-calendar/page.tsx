import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
// UTILS
import { createApiHelper } from "@/trpc/server";
// UI
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// CUSTOM COMPONENTS
import HolidayCalendar from "@sharedComponents/holiday-calendar";
import EmployeeMainWrapper from "@empComponents/layouts/employee-main-wrapper";

export default async function HolidayCalendarPage() {
  const apiHelper = await createApiHelper();
  await apiHelper.holidayRouter.getAll.prefetch();
  const holidays = dehydrate(apiHelper.queryClient);

  return (
    <EmployeeMainWrapper>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-primary">
            Holiday Calendar
          </CardTitle>
          <CardDescription>available holidays</CardDescription>
        </CardHeader>
        <CardContent>
          <HydrationBoundary state={holidays}>
            <HolidayCalendar />
          </HydrationBoundary>
        </CardContent>
      </Card>
    </EmployeeMainWrapper>
  );
}
