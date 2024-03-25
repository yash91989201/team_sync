import crypto from "crypto";
import { eq } from "drizzle-orm";
import { generateId } from "lucia";
// UTILS
import { db } from "@/server/db";
// SCHEMAS
import {
  passwordResetTokenTable,
  twoFactorConfirmationTable,
  twoFactorTokenTable,
  verificationTokenTable,
} from "@/server/db/schema";

async function generateVerificationToken(email: string) {
  const token = generateId(15);
  const expiresAt = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await getVerificationTokenByEmail(email);
  if (existingToken) {
    await db
      .delete(verificationTokenTable)
      .where(eq(verificationTokenTable.token, existingToken.token));
  }

  await db.insert(verificationTokenTable).values({
    token,
    expiresAt,
    email,
  });

  return {
    token,
    expiresAt,
    email,
  };
}

async function getVerificationTokenByEmail(email: string) {
  const verificationToken = await db.query.verificationTokenTable.findFirst({
    where: eq(verificationTokenTable.email, email),
  });
  return verificationToken;
}

async function getVerificationTokenByToken(token: string) {
  const verificationToken = await db.query.verificationTokenTable.findFirst({
    where: eq(verificationTokenTable.token, token),
  });
  return verificationToken;
}

async function getPasswordResetTokenByToken(token: string) {
  const resetToken = await db.query.passwordResetTokenTable.findFirst({
    where: eq(passwordResetTokenTable.token, token),
  });
  return resetToken;
}

async function getPasswordResetTokenByEmail(email: string) {
  const resetToken = await db.query.passwordResetTokenTable.findFirst({
    where: eq(passwordResetTokenTable.email, email),
  });
  return resetToken;
}

async function generatePasswordResetToken(email: string) {
  const resetToken = generateId(15);
  const expiresAt = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await getPasswordResetTokenByEmail(email);
  if (existingToken) {
    await db
      .delete(passwordResetTokenTable)
      .where(eq(passwordResetTokenTable.token, existingToken.token));
  }

  await db.insert(passwordResetTokenTable).values({
    email,
    token: resetToken,
    expiresAt,
  });

  return {
    token: resetToken,
    expiresAt,
    email,
  };
}

async function getTwoFactorTokenByToken(token: string) {
  const existingToken = await db.query.twoFactorTokenTable.findFirst({
    where: eq(twoFactorTokenTable.token, token),
  });
  return existingToken;
}

async function getTwoFactorTokenByEmail(email: string) {
  const existingToken = await db.query.twoFactorTokenTable.findFirst({
    where: eq(twoFactorTokenTable.email, email),
  });
  return existingToken;
}

async function getTwoFactorConfirmationByUserId(userId: string) {
  const existingConfirmation =
    await db.query.twoFactorConfirmationTable.findFirst({
      where: eq(twoFactorConfirmationTable.userId, userId),
    });
  return existingConfirmation;
}

async function generateTwoFactorToken(email: string) {
  const token = crypto.randomInt(100_000, 1_000_000).toString();
  const expiresAt = new Date(new Date().getTime() + 5 * 60 * 1000);

  const existingToken = await getTwoFactorTokenByEmail(email);
  if (existingToken) {
    await db
      .delete(twoFactorTokenTable)
      .where(eq(twoFactorTokenTable.token, existingToken.token));
  }

  await db.insert(twoFactorTokenTable).values({
    email,
    token,
    expiresAt,
  });

  return {
    email,
    token,
    expiresAt,
  };
}

export {
  generatePasswordResetToken,
  generateTwoFactorToken,
  generateVerificationToken,
  getPasswordResetTokenByEmail,
  getPasswordResetTokenByToken,
  getTwoFactorConfirmationByUserId,
  getTwoFactorTokenByEmail,
  getTwoFactorTokenByToken,
  getVerificationTokenByEmail,
  getVerificationTokenByToken,
};
