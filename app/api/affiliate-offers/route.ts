import { NextResponse } from "next/server";
import { approvedAffiliateOffers } from "@/lib/affiliate-offers";
export const dynamic = "force-dynamic";
export function GET() {
  return NextResponse.json({ offers: approvedAffiliateOffers() }, { headers: { "Cache-Control": "no-store" } });
}
