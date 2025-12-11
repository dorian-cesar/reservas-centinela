ojo:
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const token = req.cookies.get("jwt")?.value;

  // Rutas que requieren auth
  const protectedRoutes = ["/dashboard", "/booking", "/admin"];

  const isProtected = protectedRoutes.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

readme actualizado