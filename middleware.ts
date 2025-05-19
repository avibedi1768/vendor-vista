import {
  clerkClient,
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const publicRoutes = createRouteMatcher([
  "/",
  "/api/webhook/register",
  "/signup",
  "/signin",
]);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();
  const url = request.nextUrl.clone();

  // roles set up baad ch hunde aa. they need some time. is lyi aa use horya
  // Check if user just signed up (query param present)
  const justSignedUp = url.searchParams.get("justSignedUp") == "true";

  // handle unauthorized users trying to access protected routes
  if (!userId && !publicRoutes(request)) {
    // banda shop to aya c. but not signed in
    if (url.pathname.startsWith("/shop")) {
      const nextUrl = url.pathname.substring(1);
      console.log(
        "url.pathname for unsigned user trying to access shop = ",
        nextUrl
      );

      return NextResponse.redirect(
        new URL(`/signup?redirect_url=${nextUrl}`, request.url)
      );
    }

    // koi vehla banda por reha random links. send home
    return NextResponse.redirect(new URL("/", request.url));
  }

  // user is authorized. but check for vendor or customer
  if (userId) {
    try {
      const user = (await clerkClient()).users.getUser(userId);
      const role = (await user).publicMetadata.role as string | undefined;

      // this is imp. dont remove. this helps for the later on updation of roles in clerk and neondb.
      // If just signed up, allow access to signin/signup pages to finish setup
      if (justSignedUp && url.pathname === "/signup") {
        return NextResponse.next();
      }

      // admin role redirection (vendor)
      if (role === "VENDOR" && request.nextUrl.pathname === "/dashboard") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }

      // prevent non admin (customer) user to access admin dashboard (vendor)
      if (role !== "VENDOR" && request.nextUrl.pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // redirect authorized users trying to access public routes
      if (publicRoutes(request)) {
        return NextResponse.redirect(
          new URL(
            role === "VENDOR" ? "admin/dashboard" : "/dashboard",
            request.url
          )
        );
      }
    } catch (error) {
      console.error(error);
      return NextResponse.redirect(new URL("/error", request.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
