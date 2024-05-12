import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
// UTILS
import { authPage } from "@/server/helpers";
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
import AdminMainWrapper from "@/components/admin/layout/admin-main-wrapper";
import HolidayCalendar from "@/components/shared/holiday-calendar";

export default async function HolidaysPage() {
  await authPage("ADMIN");

  const apiHelper = await createApiHelper();
  await apiHelper.holidayRouter.getAll.prefetch();
  const holidays = dehydrate(apiHelper.queryClient);

  return (
    <AdminMainWrapper>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Holidays</CardTitle>
          <CardDescription>holidays</CardDescription>
        </CardHeader>
        <CardContent>
          <HydrationBoundary state={holidays}>
            <HolidayCalendar />
          </HydrationBoundary>
        </CardContent>
      </Card>
    </AdminMainWrapper>
  );
}
