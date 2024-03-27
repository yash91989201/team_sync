// TYPES
import type { NavLinkProps } from "@/lib/types";
// ICONS
import {
  Home,
  HandCoins,
  Calendar,
  CalendarCheck,
  Book,
  Building,
  CalendarX2,
  Users,
  PersonStanding,
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
    Icon: Home,
    label: "Overview",
    href: "/admin",
    matchExact: true,
  },
  {
    Icon: Calendar,
    label: "Leave Requests",
    href: "/admin/leave-requests",
    matchExact: false,
  },
  {
    Icon: CalendarX2,
    label: "Holidays",
    href: "/admin/holidays",
    matchExact: false,
  },
  {
    Icon: Users,
    label: "Employees",
    href: "/admin/employees",
    matchExact: false,
  },
  {
    Icon: HandCoins,
    label: "Salaries",
    href: "/admin/salaries",
    matchExact: false,
  },
  {
    Icon: Book,
    label: "Document Center",
    href: "/admin/document-center",
    matchExact: false,
  },
  {
    Icon: Building,
    label: "Departments",
    href: "/admin/departments",
    matchExact: false,
  },
  {
    Icon: PersonStanding,
    label: "Designations",
    href: "/admin/designations",
    matchExact: false,
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
    matchExact: false,
  },
  {
    Icon: HandCoins,
    label: "Payslip",
    href: "/employee-portal/pay-slip",
    matchExact: false,
  },
  {
    Icon: Calendar,
    label: "Leave Apply",
    href: "/employee-portal/leave-apply",
    matchExact: false,
  },
  {
    Icon: Calendar,
    label: "Leave Balance",
    href: "/employee-portal/leave-balance",
    matchExact: false,
  },
  {
    Icon: CalendarCheck,
    label: "Attendance Info",
    href: "/employee-portal/attendance",
    matchExact: false,
  },
  {
    Icon: Book,
    label: "Documents",
    href: "/employee-portal/documents",
    matchExact: false,
  },
] as const;
