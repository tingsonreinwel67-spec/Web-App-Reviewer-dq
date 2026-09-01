import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "MANAGER" | "ADMIN";
      managerId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: "USER" | "MANAGER" | "ADMIN";
    managerId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "USER" | "MANAGER" | "ADMIN";
    managerId: string | null;
  }
}
