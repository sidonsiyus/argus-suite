import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;

  // Only run authentication on protected routes
  if (
    !pathname.startsWith("/mentor-os") &&
    !pathname.startsWith("/appointments/coordinator") &&
    pathname !== "/appointments/login"
  ) {
    return supabaseResponse;
  }

  const isPublicStatic =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api") ||
    pathname.includes(".");

  if (isPublicStatic) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Authenticate user securely on server using getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Coordinator route protection
  const isCoordinatorRoute = pathname.startsWith("/appointments/coordinator");
  const isCoordinatorLogin =
    pathname === "/appointments/coordinator/login" || pathname === "/appointments/login";

  if (isCoordinatorRoute && !isCoordinatorLogin && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/appointments/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  if (isCoordinatorLogin && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/appointments/coordinator";
    url.searchParams.delete("redirectTo");
    return NextResponse.redirect(url);
  }

  const isAuthRoute = pathname.startsWith("/mentor-os/login");

  // If mentor is not authenticated, redirect to /mentor-os/login
  if (
    !user &&
    !isAuthRoute &&
    (pathname === "/mentor-os" ||
      pathname.startsWith("/mentor-os/dashboard") ||
      pathname.startsWith("/mentor-os/analytics") ||
      pathname.startsWith("/mentor-os/roadmaps") ||
      pathname.startsWith("/mentor-os/students") ||
      pathname.startsWith("/mentor-os/sessions") ||
      pathname.startsWith("/mentor-os/calendar") ||
      pathname.startsWith("/mentor-os/resources") ||
      pathname.startsWith("/mentor-os/internships") ||
      pathname.startsWith("/mentor-os/achievements") ||
      pathname.startsWith("/mentor-os/groups"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/mentor-os/login";
    if (pathname !== "/mentor-os") {
      url.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(url);
  }

  // If authenticated user visits /mentor-os/login, redirect to /mentor-os/dashboard
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/mentor-os/dashboard";
    url.searchParams.delete("redirect");
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
