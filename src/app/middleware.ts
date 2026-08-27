export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    "/learningMethods/:path*",
    "/resources/:path*",
    "/api/attempts/:path*",
    "/api/flashcards/:path*",
    "/api/memorization/:path*",
    "/api/progress/:path*",
    "/api/questions/:path*",
  ],
};
