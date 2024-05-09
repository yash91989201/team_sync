import "server-only";
import nodemailer from "nodemailer";
import { render } from "@react-email/render";
// UTILS
import { env } from "@/env";
// CUSTOM COMPONENTS
import VerificationEmail from "@/components/emails/verification-email";
import PasswordResetEmail from "@/components/emails/password-reset-email";
import TwoFactorAuthEmail from "@/components/emails/two-factor-auth-email";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  // secure: env.NODE_ENV === "production",
  secure: true,
  port: 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
});

export async function sendVerificationEmail({
  email,
  token,
  subject,
  userName,
}: {
  email: string;
  token: string;
  subject: string;
  userName: string;
}) {
  const confirmationLink = `${env.NEXT_SITE_URL}/auth/admin/new-verification?token=${token}`;
  const verificationEmailHTML = render(
    VerificationEmail({ confirmationLink, userName }),
  );
  await transporter.sendMail({
    from: `${env.EMAIL_SENDER}`,
    to: email,
    subject,
    html: verificationEmailHTML,
  });
}

export async function sendPasswordResetEmail({
  email,
  token,
}: {
  email: string;
  token: string;
}) {
  const passwordResetLink = `${env.NEXT_SITE_URL}/auth/admin/new-password?token=${token}`;
  const sendPasswordResetEmailHTML = render(
    PasswordResetEmail({
      passwordResetLink,
    }),
  );
  await transporter.sendMail({
    from: `${env.EMAIL_SENDER}`,
    to: email,
    subject: "Reset your password",
    html: sendPasswordResetEmailHTML,
  });
}

export async function sendTwoFactorTokenEmail({
  email,
  token,
}: {
  email: string;
  token: string;
}) {
  const twoFactorAuthEmailHTML = render(
    TwoFactorAuthEmail({
      twoFactorCode: token,
    }),
  );
  await transporter.sendMail({
    from: `${env.EMAIL_SENDER}`,
    to: email,
    subject: "2FA Code For Login",
    html: twoFactorAuthEmailHTML,
  });
}
