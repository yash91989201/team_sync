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
  CalendarX2,
  Users,
  PersonStanding,
  CalendarDays,
  LayoutDashboard,
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
    Icon: Calendar,
    label: "Leave",
    href: "/admin/leave",
    matchExact: false,
    isNested: true,
    isChildLink: false,
    childrens: [
      {
        Icon: Calendar,
        label: "Leave Requests",
        href: "/admin/leave/leave-requests",
        matchExact: false,
        isNested: false,
        isChildLink: true,
      },
      {
        Icon: Calendar,
        label: "Leave Types",
        href: "/admin/leave/leave-types",
        matchExact: false,
        isNested: false,
        isChildLink: true,
      },
    ],
  },
  {
    Icon: CalendarX2,
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
    isNested: false,
    isChildLink: false,
  },
  {
    Icon: HandCoins,
    label: "Salaries",
    href: "/admin/salaries",
    matchExact: false,
    isNested: false,
    isChildLink: false,
  },
  {
    Icon: Book,
    label: "Document Center",
    href: "/admin/document-center",
    matchExact: false,
    isNested: false,
    isChildLink: false,
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
    label: "Payslip",
    href: "/employee-portal/pay-slip",
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
    href: "/employee-portal/attendance",
    matchExact: false,
    isNested: false,
    isChildLink: false,
  },
  {
    Icon: Book,
    label: "Document Center",
    href: "/employee-portal/documents",
    matchExact: false,
    isNested: false,
    isChildLink: false,
  },
] as const;
