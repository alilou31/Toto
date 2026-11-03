import { NextResponse } from "next/server";
import { approvedAffiliateOffers } from "@/lib/affiliate-offers";
export const dynamic = "force-dynamic";
export function GET() {
  return NextResponse.json({
    offers: approvedAffiliateOffers(),
    ...(process.env.BON_PLANS_METRICS_ENABLED === "true" ? { clickMeasurementEnabled: true } : {}),
  }, { headers: { "Cache-Control": "no-store" } });
}

