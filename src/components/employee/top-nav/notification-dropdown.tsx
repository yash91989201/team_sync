import Link from "next/link";
// UI;
import { Button } from "@ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
// ICONS
import { BellIcon } from "lucide-react";

export default function NotificationDropdown() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="relative rounded-xl" size="icon" variant="outline">
          <BellIcon className="size-4" />
          <span
            className="absolute right-3 top-2.5 size-2 -translate-y-1/2 translate-x-1/2 rounded-full  bg-red-500 data-[animate='true']:animate-pulse"
            data-animate="false"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b py-3">
            <CardTitle className="text-lg">Notifications</CardTitle>
            <CardDescription>You have 3 unread messages.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="mb-4 grid grid-cols-[25px_1fr] items-start">
              <span className="flex h-2 w-2 translate-y-1.5 rounded-full bg-blue-500" />
              <div className="grid gap-1">
                <p className="text-sm font-medium">
                  Your call has been confirmed.
                </p>
                <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                  <p>5 min ago</p>
                  <Link className="text-blue-500" href="#">
                    Read
                  </Link>
                </div>
              </div>
            </div>
            <div className="mb-4 grid grid-cols-[25px_1fr] items-start">
              <span className="flex h-2 w-2 translate-y-1.5 rounded-full bg-blue-500" />
              <div className="grid gap-1">
                <p className="text-sm font-medium">You have a new message!</p>
                <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                  <p>1 min ago</p>
                  <Link className="text-blue-500" href="#">
                    Read
                  </Link>
                </div>
              </div>
            </div>
            <div className="mb-4 grid grid-cols-[25px_1fr] items-start">
              <span className="flex h-2 w-2 translate-y-1.5 rounded-full bg-blue-500" />
              <div className="grid gap-1">
                <p className="text-sm font-medium">
                  Your subscription is expiring soon!
                </p>
                <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                  <p>2 hours ago</p>
                  <Link className="text-blue-500" href="#">
                    Read
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="secondary">
              Mark all as read
            </Button>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
