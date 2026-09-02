import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/learningMethods/:path*",
    "/resources/:path*",
    "/api/attempts/:path*",
    "/api/flashcards/:path*",
    "/api/memorization/:path*",
    "/api/progress/:path*",
    "/api/questions/:path*",
  ],
};
