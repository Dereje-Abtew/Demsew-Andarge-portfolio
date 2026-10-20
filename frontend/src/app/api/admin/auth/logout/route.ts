import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("admin_refresh")?.value;

  try {
    if (refreshToken) {
      await fetch(`${apiUrl()}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      });
    }
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
  }

  const response = NextResponse.json({ signedOut: true });
  response.cookies.set("admin_access", "", { path: "/api/admin", maxAge: 0 });
  response.cookies.set("admin_refresh", "", { path: "/api/admin", maxAge: 0 });
  return response;
}

function apiUrl() {
  return (process.env.PORTFOLIO_API_URL ?? "http://localhost:6230").replace(/\/+$/, "");
}
