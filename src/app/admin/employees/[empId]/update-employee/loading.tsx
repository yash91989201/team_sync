// UI
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// UI
import { Skeleton } from "@/components/ui/skeleton";
// CUSTOM COMPONENTS
import AdminMainWrapper from "@/components/admin/layout/admin-main-wrapper";

export default function LoadingPage() {
  return (
    <AdminMainWrapper>
      <div className="mx-auto max-w-7xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-primary">
              <Skeleton className="h-8 w-2/4" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-1/4" />
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </AdminMainWrapper>
  );
}
