import { NextResponse } from "next/server";
import { serviceDiscovery } from "@/config/x402";

export async function GET() {
  return NextResponse.json(serviceDiscovery);
}
