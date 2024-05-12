"use server";
import { eq } from "drizzle-orm";
import { generateId } from "lucia";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
// UTILS
import { db } from "@/server/db";
import { lucia, validateRequest } from "@/lib/auth";
import { verifyPassword, getUserByEmail, hashPassword } from "@/server/helpers";
import {
  generateVerificationToken,
  generateTwoFactorToken,
  getTwoFactorTokenByEmail,
  getTwoFactorConfirmationByUserId,
  getVerificationTokenByToken,
  generatePasswordResetToken,
} from "@/server/helpers/token";
import {
  sendTwoFactorTokenEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "@/server/helpers/email";
// SCHEMAS
import {
  LoginSchema,
  AdminSignupSchema,
  ResetPasswordSchema,
  NewVerificationSchema,
} from "@/lib/schema";
// DB TABLE
import {
  twoFactorConfirmationTable,
  twoFactorTokenTable,
  userTable,
  verificationTokenTable,
} from "@/server/db/schema";
// TYPES
import type {
  LoginSchemaType,
  AdminSignupSchemaType,
  ResetPasswordSchemaType,
  NewVerificationSchemaType,
} from "@/lib/types";
// CONSTANTS
import {
  DEFAULT_ADMIN_ROUTE,
  ADMIN_AUTH_ROUTES,
  DEFAULT_EMPLOYEE_ROUTE,
  EMPLOYEE_AUTH_ROUTES,
} from "@/constants/routes";

const allowNewAdmin = true;

export async function adminSignup(
  payload: AdminSignupSchemaType,
): Promise<AdminSignupStatusType> {
  const validatedPayload = AdminSignupSchema.safeParse(payload);
  if (!validatedPayload.success) {
    return {
      status: "FAILED",
      message: "Invalid credentials",
    };
  }

  const adminList = await db.query.userTable.findMany({
    where: eq(userTable.role, "ADMIN"),
  });
  const adminCount = adminList.length;

  if (adminCount === 0 || allowNewAdmin) {
    const { name, email, password } = validatedPayload.data;
    const hashedPassword = await hashPassword(password);
    const adminId = generateId(15);

    const [createAdminQuery] = await db.insert(userTable).values({
      id: adminId,
      email,
      password: hashedPassword,
      name,
      code: `ADMIN_${adminId}_${adminCount + 1}`,
      role: "ADMIN",
      emailVerified: new Date(),
    });

    if (createAdminQuery.affectedRows === 1) {
      // const verificationToken = await generateVerificationToken(email);

      // await sendVerificationEmail({
      //   userName: name,
      //   email: verificationToken.email,
      //   token: verificationToken.token,
      //   subject: "Confirm your SignUp.",
      // });

      return {
        status: "SUCCESS",
        message:
          adminCount === 0
            ? "First admin account created successfully, email verification link sent to your email."
            : "Admin account created successfully, email verification link sent to your email.",
      };
    }

    return {
      status: "FAILED",
      message: "Unable to create admin account please try again.",
    };
  } else {
    return {
      status: "FAILED",
      message: "Admin already exists, login instead.",
    };
  }
}

export async function logIn(
  payload: LoginSchemaType,
): Promise<LoginStatusType> {
  const validatedPayload = LoginSchema.safeParse(payload);

  if (!validatedPayload.success) {
    return {
      status: "FAILED",
      message: "Invalid credentials!",
    };
  }

  const { email, password, twoFactorCode } = validatedPayload.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return { status: "FAILED", message: "Email does not exists." };
  }

  const isPasswordCorrect = await verifyPassword(
    existingUser.password,
    password,
  );

  if (!isPasswordCorrect) {
    return { status: "FAILED", message: "Email does not exists." };
  }

  if (existingUser.emailVerified === null) {
    const verificationToken = await generateVerificationToken(
      existingUser.email,
    );

    await sendVerificationEmail({
      email: verificationToken.email,
      token: verificationToken.token,
      subject: "Verify your Email.",
      userName: existingUser.name,
    });

    return {
      status: "SUCCESS",
      message: "Confirmation Email Sent.",
      authType: "PASSWORD",
      loggedInRedirect: false,
      loggedInRoute: "",
    };
  }

  const { twoFactorEnabled } = existingUser;

  if (twoFactorEnabled) {
    if (twoFactorCode) {
      const existingTwoFAToken = await getTwoFactorTokenByEmail(
        existingUser.email,
      );

      if (!existingTwoFAToken) {
        return { status: "FAILED", message: "Invalid Code" };
      }

      const isTwoFATokenExpired =
        new Date(existingTwoFAToken.expiresAt) < new Date();

      if (isTwoFATokenExpired) {
        return { status: "FAILED", message: "2FA Code Expired. Log In again!" };
      }

      // after the existing token has been verified delete it
      await db
        .delete(twoFactorTokenTable)
        .where(eq(twoFactorTokenTable.token, existingTwoFAToken.token));

      const existingConfirmation = await getTwoFactorConfirmationByUserId(
        existingUser.id,
      );

      if (existingConfirmation) {
        await db
          .delete(twoFactorConfirmationTable)
          .where(eq(twoFactorConfirmationTable.id, existingConfirmation.id));
      }
      await db.insert(twoFactorConfirmationTable).values({
        id: generateId(15),
        userId: existingUser.id,
      });
    } else {
      const twoFAToken = await generateTwoFactorToken(existingUser.email);
      await sendTwoFactorTokenEmail({
        email: twoFAToken.email,
        token: twoFAToken.token,
      });
      return {
        status: "SUCCESS",
        message: "2FA code sent to your email.",
        authType: "PASSWORD_WITH_2FA",
        loggedInRedirect: false,
        loggedInRoute: "",
      };
    }
  }

  try {
    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
    return {
      status: "SUCCESS",
      message: "Log In successful.",
      authType: twoFactorEnabled ? "PASSWORD_WITH_2FA" : "PASSWORD",
      loggedInRedirect: true,
      loggedInRoute:
        existingUser.role === "ADMIN"
          ? DEFAULT_ADMIN_ROUTE
          : DEFAULT_EMPLOYEE_ROUTE,
    };
  } catch (e) {
    return { status: "FAILED", message: "Error occoured." };
  }
}

export async function newVerification(
  payload: NewVerificationSchemaType,
): Promise<NewVerificationStatusType> {
  const validatedPayload = NewVerificationSchema.safeParse(payload);
  if (!validatedPayload.success) {
    return { status: "FAILED", message: "Invalid Token!" };
  }

  const { token } = validatedPayload.data;
  const tokenData = await getVerificationTokenByToken(token);

  if (!tokenData) {
    return { status: "FAILED", message: "Invalid Token!" };
  }

  const { expiresAt, email } = tokenData;

  const isTokenExpired = new Date(expiresAt) < new Date();
  if (isTokenExpired) {
    return { status: "FAILED", message: "Token Expired, please try again." };
  }

  const existingUser = await getUserByEmail(email);
  if (!existingUser) {
    return { status: "FAILED", message: "No user exists with this token!" };
  }

  const [updateUserquery] = await db
    .update(userTable)
    .set({ emailVerified: new Date() })
    .where(eq(userTable.id, existingUser.id));

  await db
    .delete(verificationTokenTable)
    .where(eq(verificationTokenTable.token, token));

  if (updateUserquery.affectedRows == 0) {
    return {
      status: "FAILED",
      message: "Unable to verify email, please try again.",
    };
  }

  return {
    status: "SUCCESS",
    message: "Email Verified",
  };
}

export async function resetPassword(
  payload: ResetPasswordSchemaType,
): Promise<ResetPasswordStatusType> {
  const validatedFormData = ResetPasswordSchema.safeParse(payload);
  if (!validatedFormData.success) {
    return {
      status: "FAILED",
      message: "Password reset failed.",
    };
  }

  const existingUser = await getUserByEmail(validatedFormData.data.email);

  if (!existingUser) {
    return {
      status: "FAILED",
      message: "Email doesnot exists.",
    };
  }

  const resetToken = await generatePasswordResetToken(existingUser.email);

  await sendPasswordResetEmail({
    email: existingUser.email,
    token: resetToken.token,
  });

  return {
    status: "SUCCESS",
    message: "Check your inbox for reset mail.",
  };
}

export async function logOut() {
  const { user, session } = await validateRequest();

  if (!session || !user) {
    return {
      error: "Unauthorized",
    };
  }

  const logInRoute =
    user.role === "ADMIN"
      ? ADMIN_AUTH_ROUTES.logIn
      : EMPLOYEE_AUTH_ROUTES.logIn;

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );

  return redirect(logInRoute);
}
