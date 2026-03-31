import { NextResponse } from "next/server";
import { getMaintenanceConfig } from "@/lib/site-maintenance";

export async function GET() {
  const maintenance = await getMaintenanceConfig();
  return NextResponse.json({ maintenance });
}
