"use client"

export default function NotificationDot({ animate = false, notificationCount }: {
   animate?: boolean;
   notificationCount?: number
}) {

   return (
      <span
         data-animate={animate && notificationCount === undefined}
         data-show-notification-count={notificationCount !== undefined}
         data-notification-count={notificationCount && notificationCount > 10 ? "9+" : notificationCount}
         className="size-2 rounded-full bg-red-500 data-[animate='true']:animate-pulse relative
   data-[show-notification-count='true']:before:content-[attr(data-notification-count)] 
   data-[show-notification-count='true']:size-[1.125rem] data-[show-notification-count='false']:mr-1 
   before:text-white before:text-xs 
   before:absolute before:-translate-x-1/2 before:-translate-y-1/2 before:top-1/2 before:left-1/2
   "
      />
   );
}