/**
 * NextAuth.js type extensions
 * Created: 2025/3/13
 */

import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

// Extend the Session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      provider: string;
    } & DefaultSession["user"];
  }

  // Extend the User type
  interface User extends DefaultUser {
    id: string;
    provider?: string;
  }
}

// Extend the JWT type
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    provider?: string;
  }
}
