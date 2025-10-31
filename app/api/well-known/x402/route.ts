import { NextResponse } from "next/server";
import { serviceDiscovery } from "@/config/x402";

export async function GET() {
  return NextResponse.json(serviceDiscovery, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600", // Cache for 1 hour
    },
  });
}
