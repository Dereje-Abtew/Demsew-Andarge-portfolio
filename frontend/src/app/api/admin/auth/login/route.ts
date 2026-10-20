import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().trim().email().max(256),
  password: z.string().min(1).max(128),
});

const tokenSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  accessExpiresAtUtc: z.string().datetime({ offset: true }),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const credentials = credentialsSchema.safeParse(body);

  if (!credentials.success) {
    return NextResponse.json(
      { title: "Enter a valid email and password.", status: 400 },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(`${apiUrl()}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials.data),
      cache: "no-store",
    });
    const payload: unknown = await upstream.json().catch(() => null);

    if (!upstream.ok) {
      return NextResponse.json(payload ?? { title: "Sign in failed.", status: upstream.status }, {
        status: upstream.status,
      });
    }

    const tokens = tokenSchema.safeParse(payload);
    if (!tokens.success) {
      return NextResponse.json(
        { title: "The API returned an invalid sign-in response.", status: 502 },
        { status: 502 },
      );
    }

    const response = NextResponse.json({ signedIn: true });
    const secure = process.env.NODE_ENV === "production";
    response.cookies.set("admin_access", tokens.data.accessToken, {
      httpOnly: true,
      secure,
      sameSite: "strict",
      path: "/api/admin",
      expires: new Date(tokens.data.accessExpiresAtUtc),
    });
    response.cookies.set("admin_refresh", tokens.data.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: "strict",
      path: "/api/admin",
      maxAge: 60 * 60 * 24 * 14,
    });
    return response;
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

function apiUrl() {
  return (process.env.PORTFOLIO_API_URL ?? "http://localhost:6230").replace(/\/+$/, "");
}
