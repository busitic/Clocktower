import type { UserRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";

// Module augmentation: adds our custom fields to Auth.js's built-in types
// so `session.user.role` autocompletes and type-checks everywhere.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}