import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { verifyTokenEdge } from "@/lib/token-edge";

// Next.js 16 renamed the `middleware` file convention to `proxy`. This is the
// single request interceptor for the app: it drives locale routing (via
// next-intl), redirects retired locales, and gates the admin area.
const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Locales this store used to serve. Anything still linking to them lands on
  // the English equivalent rather than a 404.
  const RETIRED_LOCALES = ["ru", "lv"];
  for (const old of RETIRED_LOCALES) {
    if (pathname === `/${old}` || pathname.startsWith(`/${old}/`)) {
      const url = request.nextUrl.clone();
      url.pathname = "/en" + pathname.slice(old.length + 1);
      return NextResponse.redirect(url, 308);
    }
  }

  if (pathname.endsWith("/solvetaworld.html")) {
    const url = request.nextUrl.clone();
    url.pathname = "/solvetaworld.html";
    return NextResponse.rewrite(url);
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
    const token = request.cookies.get("session_token")?.value;
    const payload = token ? await verifyTokenEdge(token) : null;

    if (pathname.startsWith("/admin")) {
      if (!payload) {
        return NextResponse.redirect(new URL("/en/auth/login", request.url));
      }
    }

    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|fonts|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
