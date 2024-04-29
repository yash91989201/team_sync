import { cache } from "react";
import { Lucia } from "lucia";
import { cookies } from "next/headers";
// UTILS
import { luciaDbAdapter } from "@/server/db";
// TYPES
import type { Session, User } from "lucia";
import type { UserType } from "@/lib/types";

export const lucia = new Lucia(luciaDbAdapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      id: attributes.id,
      code: attributes.code,
      name: attributes.name,
      email: attributes.email,
      role: attributes.role,
      isTeamLead: attributes.isTeamLead,
      emailVerified: attributes.emailVerified,
      twoFactorEnabled: attributes.twoFactorEnabled,
      imageUrl: attributes.imageUrl,
    };
  },
});

export const validateRequest = cache(
  async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
  > => {
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return {
        user: null,
        session: null,
      };
    }

    const result = await lucia.validateSession(sessionId);
    // next.js throws when you attempt to set cookie when rendering page
    try {
      if (result.session?.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
      }
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
      }
    } catch { }
    return result;
  },
);

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

// eslint-disable-next-line
interface DatabaseUserAttributes extends UserType { }
