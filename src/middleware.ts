import { type NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import NextAuth from "next-auth";
import { authConfig } from "./lib/auth-config";
import { getLocale } from "next-intl/server";

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware(routing);
const { auth } = NextAuth(authConfig);
// Public paths that don't require authentication
const publicPaths = ["/auth/signin"];

export default async function middleware(req: NextRequest) {
  const session = await auth();
  const pathname = req.nextUrl.pathname;
  const locale = await getLocale();

  // If user is authenticated and trying to access auth pages, redirect to home
  if (session?.user && publicPaths.some((path) => pathname.endsWith(path))) {
    const homeUrl = new URL(`/${locale}`, req.url);
    return NextResponse.redirect(homeUrl);
  }

  // For public paths or authenticated users on non-auth pages
  if (session?.user ?? publicPaths.some((path) => pathname.endsWith(path))) {
    return intlMiddleware(req);
  }

  // For protected paths, check authentication
  if (!session) {
    console.log("Redirecting to sign-in page");
    // Redirect to the sign-in page with the current URL as callbackUrl

    console.log(req.url);
    const signInUrl = new URL(`/${locale}/auth/signin`, req.url);
    console.log(signInUrl);
    signInUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // For authenticated users, return the locale response
  return intlMiddleware(req);
}

export const config = {
  unstable_allowDynamic: [
    "**/node_modules/@prisma/client/**",
    "**/node_modules/@auth/prisma-adapter/**",
  ],
  // Match all pathnames except for API routes, Next.js internals, and static files
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
