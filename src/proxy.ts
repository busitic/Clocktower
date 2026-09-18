import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

/*
  PROXY (formerly "middleware" — renamed in Next.js 16)
  --------------------------------------------------------
  Still UX convenience, NOT the security boundary — see session.ts.
  Next.js's own rename here is a deliberate signal of that: this file
  intercepts/redirects requests at the network layer, but the real
  authorization check happens again in every protected page and route
  handler via requireUser()/requireRole().
*/
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isLandlordRoute = pathname.startsWith("/landlord");
  const isAdminRoute = pathname.startsWith("/admin");
  const isStudentDashboard = pathname.startsWith("/dashboard");

  if (!isLoggedIn && (isLandlordRoute || isAdminRoute || isStudentDashboard)) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isLandlordRoute && role !== "LANDLORD") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isLoggedIn && isAdminRoute && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/landlord/:path*", "/admin/:path*"],
};