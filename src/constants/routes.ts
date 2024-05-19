// TYPES
import type { NavLinkProps } from "@/lib/types";
// ICONS
import {
  Home,
  HandCoins,
  Calendar,
  SquareCheckBig,
  Book,
  Building,
  Users,
  PersonStanding,
  CalendarDays,
  LayoutDashboard,
  GitPullRequestDraft,
  Banknote,
  BookUser,
  NotebookTabs,
  Tally5,
  UserRoundPlus,
  LayoutPanelTop,
  ListOrdered,
  Files,
  TentTree,
  BadgeIndianRupee,
} from "lucide-react";

/* 
Auth routes configuration for admin
*/
export const ADMIN_AUTH_ROUTES = {
  signUp: "/auth/admin/sign-up",
  logIn: "/auth/admin/log-in",
  newverification: "/auth/admin/new-verification",
  resetPassword: "/auth/admin/reset-password",
};
/*
Auth routes configuration for employee 
*/
export const EMPLOYEE_AUTH_ROUTES = {
  logIn: "/",
  newVerification: "/auth/employee/new-verification",
  resetPassword: "/auth/employee/reset-password",
};

export const DEFAULT_ADMIN_ROUTE = "/admin";
export const DEFAULT_EMPLOYEE_ROUTE = "/employee-portal";

/*
Configuration for routes are accessible to admins 
*/
export const ADMIN_ROUTES: NavLinkProps[] = [
  {
    Icon: LayoutDashboard,
    label: "Dashboard",
    href: "/admin",
    matchExact: true,
    isNested: false,
    isChildLink: false,
  },
  {
    Icon: GitPullRequestDraft,
    label: "Leave Requests",
    href: "/admin/leave/leave-requests",
    matchExact: false,
    isNested: false,
    isChildLink: false,
  },
  {
    Icon: CalendarDays,
    label: "Holidays",
    href: "/admin/holidays",
    matchExact: false,
    isNested: false,
    isChildLink: false,
  },
  {
    Icon: Users,
    label: "Employees",
    href: "/admin/employees",
    matchExact: false,
    isNested: true,
    isChildLink: false,
    childrens: [
      {
        Icon: BookUser,
        label: "Employee Directory",
        href: "/admin/employees",
        matchExact: true,
        isNested: false,
        isChildLink: true,
      },
      {
        Icon: NotebookTabs,
        label: "Attendance",
        href: "/admin/employees/attendance",
        matchExact: false,
        isNested: false,
        isChildLink: true,
      },
      {
        Icon: Tally5,
        label: "Leave Balances",
        href: "/admin/employees/leave-balances",
        matchExact: false,
        isNested: false,
        isChildLink: true,
      },
      {
        Icon: UserRoundPlus,
        label: "New Employee",
        href: "/admin/employees/new-employee",
        matchExact: false,
        isNested: false,
        isChildLink: true,
      },
    ],
  },
  {
    Icon: Banknote,
    label: "Payroll",
    href: "/admin/payroll",
    matchExact: false,
    isNested: true,
    isChildLink: false,
    childrens: [
      {
        Icon: BadgeIndianRupee,
        label: "Bulk Generate",
        href: "/admin/payroll/bulk-generate",
        matchExact: false,
        isNested: false,
        isChildLink: true,
      },
      {
        Icon: HandCoins,
        label: "Employees Payslip",
        href: "/admin/payroll/salary-info",
        matchExact: false,
        isNested: false,
        isChildLink: true,
      },
      {
        Icon: LayoutPanelTop,
        label: "Salary components",
        href: "/admin/payroll/salary-components",
        matchExact: false,
        isNested: false,
        isChildLink: true,
      }
    ]
  },
  {
    Icon: Book,
    label: "Document Center",
    href: "/admin/document-center",
    matchExact: false,
    isNested: true,
    isChildLink: false,
    childrens: [
      {
        Icon: Files,
        label: "Documents",
        href: "/admin/document-center/employee-documents",
        matchExact: false,
        isNested: false,
        isChildLink: true,
      },
      {
        Icon: ListOrdered,
        label: "Document Types",
        href: "/admin/document-center/document-types",
        matchExact: false,
        isNested: false,
        isChildLink: true,
      },
    ],
  },
  {
    Icon: Building,
    label: "Organization",
    href: "/admin/org",
    matchExact: false,
    isNested: true,
    isChildLink: false,
    childrens: [
      {
        Icon: TentTree,
        label: "Leave types",
        href: "/admin/leave/leave-types",
        matchExact: false,
        isNested: false,
        isChildLink: true,
      },
      {
        Icon: Building,
        label: "Departments",
        href: "/admin/departments",
        matchExact: false,
        isNested: false,
        isChildLink: true,
      },
      {
        Icon: PersonStanding,
        label: "Designations",
        href: "/admin/designations",
        matchExact: false,
        isNested: false,
        isChildLink: true,
      },
    ],
  },
] as const;

/*
Configuration for routes are accessible 
to admins for the search module
*/
export const ADMIN_SEARCH_ROUTES = ADMIN_ROUTES
  .flatMap(item => !item.childrens ? [item] : [item, ...item.childrens])
  .filter(item => !item.childrens);

/*
Configuration for routes are accessible to employees
*/
export const EMPLOYEE_ROUTES: NavLinkProps[] = [
  {
    Icon: Home,
    label: "Home",
    href: "/employee-portal",
    matchExact: true,
    isNested: false,
    isChildLink: false,
  },
  {
    Icon: HandCoins,
    label: "Payslips",
    href: "/employee-portal/payslips",
    matchExact: false,
    isNested: false,
    isChildLink: false,
  },
  {
    Icon: CalendarDays,
    label: "Holiday Calendar",
    href: "/employee-portal/holiday-calendar",
    matchExact: false,
    isNested: false,
    isChildLink: false,
  },
  {
    Icon: Calendar,
    label: "Leave",
    href: "/employee-portal/leave-apply",
    matchExact: false,
    isNested: true,
    isChildLink: true,
    childrens: [
      {
        Icon: Calendar,
        label: "Leave Apply",
        href: "/employee-portal/leave/leave-apply",
        matchExact: false,
        isNested: false,
        isChildLink: true,
      },
      {
        Icon: Calendar,
        label: "Leave Balances",
        href: "/employee-portal/leave/leave-balances",
        matchExact: false,
        isNested: false,
        isChildLink: true,
      },
      {
        Icon: CalendarDays,
        label: "Leave Calendar",
        href: "/employee-portal/leave/leave-calendar",
        matchExact: false,
        isNested: false,
        isChildLink: true,
      },
    ],
  },
  {
    Icon: SquareCheckBig,
    label: "Attendance Info",
    href: "/employee-portal/attendance-info",
    matchExact: false,
    isNested: false,
    isChildLink: false,
  },
  {
    Icon: Book,
    label: "Document Center",
    href: "/employee-portal/document-center",
    matchExact: false,
    isNested: false,
    isChildLink: false,
  },
] as const;
