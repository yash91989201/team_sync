// UI
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PayslipPdf() {
  return (
    <Card className="h-full w-full rounded-none border-none">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">
          Payslip PDF preview
        </CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  );
}
