import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    issuer: process.env.KINDE_ISSUER_URL,
    site: process.env.KINDE_SITE_URL,
  });
}
