import { toast } from "sonner";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  const formattedDate = new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
  return formattedDate;
}

export function fieldActionToast(action?: {
  status: "SUCCESS" | "FAILED";
  message: string;
}) {
  if (action !== undefined) {
    if (action.status === "SUCCESS") {
      toast.success(action.message);
    } else {
      toast.error(action.message);
    }
  }
}
