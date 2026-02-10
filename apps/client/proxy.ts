import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

export default withAuth(
  async function middleware(req: Request, res: Response) {},
  {
    // Middleware still runs on all routes, but doesn't protect the home route
    publicPaths: [
      "/",
      "/api/auth/login",
      "/api/auth/register",
      "/api/auth/callback",
      "/api/auth/logout",
    ],
    isReturnToCurrentPathAfterLogin: true,
  },
);

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
  // matcher: [
  //   "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  // ],
};
