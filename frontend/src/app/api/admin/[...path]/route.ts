import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = { params: Promise<{ path: string[] }> };

const refreshSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  accessExpiresAtUtc: z.string().datetime({ offset: true }),
});
type RefreshTokens = z.infer<typeof refreshSchema>;
const refreshInFlight = new Map<string, Promise<RefreshTokens | null>>();

export async function GET(request: NextRequest, context: RouteContext) {
  return proxy(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxy(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxy(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxy(request, context);
}

async function proxy(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const endpoint = path.map((segment) => encodeURIComponent(segment)).join("/");
  const url = new URL(`${apiUrl()}/api/admin/${endpoint}`);
  url.search = request.nextUrl.search;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("admin_access")?.value;
  const refreshToken = cookieStore.get("admin_refresh")?.value;
  if (!accessToken) {
    return NextResponse.json({ title: "Authentication required.", status: 401 }, { status: 401 });
  }

  const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer();
  const headers = new Headers();
  headers.set("Authorization", `Bearer ${accessToken}`);
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  try {
    let upstream = await fetchApi(url, request.method, headers, body);
    if (upstream.status === 401 && refreshToken) {
      const refreshed = await refresh(refreshToken);
      if (refreshed) {
        const nextHeaders = new Headers(headers);
        nextHeaders.set("Authorization", `Bearer ${refreshed.accessToken}`);
        upstream = await fetchApi(url, request.method, nextHeaders, body);
        cookieStore.set("admin_access", refreshed.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/api/admin",
          expires: new Date(refreshed.accessExpiresAtUtc),
        });
        cookieStore.set("admin_refresh", refreshed.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/api/admin",
          maxAge: 60 * 60 * 24 * 14,
        });
      } else {
        clearAdminCookies(cookieStore);
      }
    } else if (upstream.status === 401) {
      clearAdminCookies(cookieStore);
    }

    const responseHeaders = new Headers();
    for (const name of ["content-type", "content-disposition", "cache-control"]) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      return NextResponse.json(
        { title: "Could not connect to the portfolio API.", status: 503 },
        { status: 503 },
      );
    }
    throw error;
  }
}

async function refresh(refreshToken: string) {
  const existing = refreshInFlight.get(refreshToken);
  if (existing) return existing;
  const operation = requestRefresh(refreshToken).finally(() => refreshInFlight.delete(refreshToken));
  refreshInFlight.set(refreshToken, operation);
  return operation;
}

async function requestRefresh(refreshToken: string) {
  const response = await fetch(`${apiUrl()}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });
  if (!response.ok) return null;
  const parsed = refreshSchema.safeParse(await response.json().catch(() => null));
  return parsed.success ? parsed.data : null;
}

function fetchApi(
  url: URL,
  method: string,
  headers: Headers,
  body: ArrayBuffer | undefined,
) {
  return fetch(url, { method, headers, body, cache: "no-store" });
}

function apiUrl() {
  return (process.env.PORTFOLIO_API_URL ?? "http://localhost:6231").replace(/\/+$/, "");
}

function clearAdminCookies(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  cookieStore.set("admin_access", "", { path: "/api/admin", maxAge: 0 });
  cookieStore.set("admin_refresh", "", { path: "/api/admin", maxAge: 0 });
}
