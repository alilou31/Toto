import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };
const sentiments = new Set(["pain_point", "request", "positive", "objection", "opportunity"]);

async function isAdmin() {
  const user = await getCurrentUser().catch(() => null);
  const allowlist = (process.env.FEEDBACK_ADMIN_EMAILS ?? "")
    .split(",").map(value => value.trim().toLowerCase()).filter(Boolean);
  return user && allowlist.includes(user.email.toLowerCase()) ? user : null;
}

export async function GET() {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Accès réservé à l’équipe produit." }, { status: 403, headers: noStore });
  try {
    const sql = getDb();
    const [feedback, insights, totals] = await Promise.all([
      sql`select id, category, rating, message, source, created_at from public.product_feedback order by created_at desc limit 100`,
      sql`select id, source, subreddit, external_url, theme, sentiment, summary, created_at from public.market_insights order by created_at desc limit 100`,
      sql`select count(*)::integer as total_feedback, count(*) filter (where created_at >= now() - interval '7 days')::integer as last_7_days, round(avg(rating)::numeric, 1) as average_rating from public.product_feedback`,
    ]);
    return NextResponse.json({ feedback, insights, metrics: totals[0] ?? { total_feedback: 0, last_7_days: 0, average_rating: null } }, { headers: noStore });
  } catch {
    console.error("NAKAHYA feedback dashboard unavailable.");
    return NextResponse.json({ error: "Tableau de bord indisponible. Vérifiez que la migration 023 est appliquée." }, { status: 503, headers: noStore });
  }
}

export async function POST(request: Request) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Accès réservé à l’équipe produit." }, { status: 403, headers: noStore });
  let input: unknown;
  try { input = await request.json(); }
  catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400, headers: noStore }); }
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400, headers: noStore });
  }
  const data = input as Record<string, unknown>;
  const source = data.source === "reddit" ? "reddit" : "other";
  const subreddit = typeof data.subreddit === "string" ? data.subreddit.trim().replace(/^r\//, "") : "";
  const externalUrl = typeof data.externalUrl === "string" ? data.externalUrl.trim() : "";
  const theme = typeof data.theme === "string" ? data.theme.trim() : "";
  const sentiment = typeof data.sentiment === "string" ? data.sentiment : "";
  const summary = typeof data.summary === "string" ? data.summary.trim() : "";
  let parsedUrl: URL | null = null;
  try { parsedUrl = new URL(externalUrl); } catch { /* validation below */ }
  const isRedditHost = parsedUrl && ["reddit.com", "www.reddit.com", "old.reddit.com"].includes(parsedUrl.hostname.toLowerCase());
  const validSubreddit = /^[A-Za-z0-9_]{2,80}$/.test(subreddit);
  if (!parsedUrl || !["http:", "https:"].includes(parsedUrl.protocol) || externalUrl.length > 2048
    || theme.length < 2 || theme.length > 80 || !sentiments.has(sentiment)
    || summary.length < 10 || summary.length > 1500
    || (source === "reddit" && (!isRedditHost || !validSubreddit))) {
    return NextResponse.json({ error: "Vérifiez la source, le lien, le thème et le résumé." }, { status: 400, headers: noStore });
  }
  try {
    const sql = getDb();
    await sql`
      insert into public.market_insights (source, subreddit, external_url, theme, sentiment, summary, created_by)
      values (${source}, ${source === "reddit" ? subreddit : null}, ${externalUrl}, ${theme}, ${sentiment}, ${summary}, ${admin.id})
    `;
    return NextResponse.json({ ok: true }, { status: 201, headers: noStore });
  } catch {
    console.error("NAKAHYA market insight could not be saved.");
    return NextResponse.json({ error: "L’insight n’a pas pu être enregistré. Vérifiez la migration 023." }, { status: 503, headers: noStore });
  }
}
