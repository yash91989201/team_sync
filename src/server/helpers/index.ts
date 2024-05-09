import "server-only";
import { eq } from "drizzle-orm";
import { Argon2id } from "oslo/password";
import { redirect } from "next/navigation";
// UTILS
import { db } from "@/server/db";
import { validateRequest } from "@/lib/auth";
// DB TABLES
import { userTable } from "@/server/db/schema";
// CONSTANTS
import {
  ADMIN_AUTH_ROUTES,
  DEFAULT_ADMIN_ROUTE,
  DEFAULT_EMPLOYEE_ROUTE,
  EMPLOYEE_AUTH_ROUTES,
} from "@/constants/routes";

const argon2id = new Argon2id();

export function hashPassword(password: string) {
  return argon2id.hash(password);
}

export function verifyPassword(hashedPassword: string, password: string) {
  return argon2id.verify(hashedPassword, password);
}

export async function getUserByEmail(email: string) {
  const user = await db.query.userTable.findFirst({
    where: eq(userTable.email, email),
  });
  return user;
}

export async function getUser() {
  const { user, session } = await validateRequest();

  if (!session || !user) {
    return { isLoggedIn: false };
  }

  return {
    isLoggedIn: true,
    user,
    isAdmin: user.role === "ADMIN",
  };
}

export async function auth() {
  const { user, session } = await validateRequest();
  return { user, session }
}

export async function authPage(
  expectedRole?: "ADMIN" | "EMPLOYEE",
  isAuthPage = false,
) {
  const { user, session } = await validateRequest();

  const LOGIN_ROUTE =
    expectedRole === "ADMIN"
      ? ADMIN_AUTH_ROUTES.logIn
      : EMPLOYEE_AUTH_ROUTES.logIn;

  if (!user || !session) {
    if (isAuthPage) return;

    return redirect(LOGIN_ROUTE);
  } else {
    const DEFAULT_ROUTE =
      user.role === "ADMIN" ? DEFAULT_ADMIN_ROUTE : DEFAULT_EMPLOYEE_ROUTE;

    if (isAuthPage) return redirect(DEFAULT_ROUTE);

    if (expectedRole === undefined) return redirect(DEFAULT_ROUTE);

    if (user.role !== expectedRole) return redirect(DEFAULT_ROUTE);
  }
}

export async function getPayslipPdfAsFormData(payslipId: string) {
  const payslipPdfUrl = `https://team-sync-preview.novafyasia.in/pdf/payslip/${payslipId}`

  const response = await fetch(`team-sync-preview.novafyasia.in/pdf-service/generate-pdf/payslip?url=${payslipPdfUrl}`)
  const payslipPdf = await response.blob()

  const formData = new FormData()
  formData.append("id", payslipId)
  formData.append("file", payslipPdf)

  return formData
}