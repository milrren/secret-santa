import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "secret-santa-api",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    runtime: "vercel-serverless",
  });
}

