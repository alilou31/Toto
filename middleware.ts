import { NextResponse, type NextRequest } from "next/server";
import { canonicalRedirect, OFFICIAL_SITE_ORIGIN, privatePath } from "@/lib/site-origin";

export function middleware(request: NextRequest) {
  const target = canonicalRedirect(request.url, request.method);
  const response = target ? NextResponse.redirect(target, 308) : NextResponse.next();
  const hostname = request.nextUrl.hostname;
  if (privatePath(request.nextUrl.pathname) || (hostname !== new URL(OFFICIAL_SITE_ORIGIN).hostname && !["localhost", "127.0.0.1"].includes(hostname))) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
