import { NextResponse } from "next/server";
import { approvedAffiliateOffers } from "@/lib/affiliate-offers";
import { validateAffiliateClick } from "@/lib/affiliate-clicks";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  const result = await validateAffiliateClick(
    request, approvedAffiliateOffers(), process.env.BON_PLANS_METRICS_ENABLED === "true",
  );
  if ("status" in result) {
    return NextResponse.json({ error: "Mesure indisponible ou requête invalide." }, { status: result.status, headers });
  }
  try {
    const sql = getDb();
    await sql`
      with expired as (
        delete from public.affiliate_click_metrics
        where day < (now() at time zone 'UTC')::date - 89
      )
      insert into public.affiliate_click_metrics (day, idea_id, clicks)
      values ((now() at time zone 'UTC')::date, ${result.ideaId}, 1)
      on conflict (day, idea_id) do update
      set clicks = public.affiliate_click_metrics.clicks + 1
    `;
    return new Response(null, { status: 204, headers });
  } catch {
    return NextResponse.json({ error: "Mesure temporairement indisponible." }, { status: 503, headers });
  }
}
