import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  providers: [], // filled in by the full config in auth.ts
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      if (pathname.startsWith("/admin")) {
        // Managers see their own reports; admins see everyone. The roster API
        // applies the same rule to the data itself.
        const role = auth?.user?.role;
        return isLoggedIn && (role === "ADMIN" || role === "MANAGER");
      }

      return isLoggedIn;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.managerId = (user as any).managerId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).managerId = token.managerId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};
