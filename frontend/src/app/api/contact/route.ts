import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(256),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().trim().min(1).max(180),
  message: z.string().trim().min(1).max(5000),
});

function apiUrl() {
  return (process.env.PORTFOLIO_API_URL || "http://localhost:6231").replace(/\/+$/, "");
}

export async function POST(request: NextRequest) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ title: "Check your message details.", errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const response = await fetch(`${apiUrl()}/api/public/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...parsed.data, phone: parsed.data.phone || null }),
      cache: "no-store",
    });
    const payload = await response.text();
    return new NextResponse(payload, {
      status: response.status,
      headers: { "Content-Type": response.headers.get("content-type") || "application/problem+json" },
    });
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    return NextResponse.json({
      type: "about:blank",
      title: "Message service unavailable",
      status: 503,
      detail: "Could not connect to the portfolio API. Please try again later.",
    }, { status: 503, headers: { "Content-Type": "application/problem+json" } });
  }
}
