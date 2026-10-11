import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const GAME_IDS = new Set(["mots-croises", "enigme", "calcul", "personnalite", "duel", "tournoi"]);

export async function GET() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  try {
    const sql = getDb();
    const results = await sql`select id, game_id, score, correct_answers, total_questions, duration_seconds, completed_at from public.game_results where user_id = ${user.id} order by completed_at desc limit 50`;
    return NextResponse.json({ results }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("NIKAHYA game results read failed.");
    return NextResponse.json({ error: "Historique indisponible. Vérifiez que la migration 004_games.sql est appliquée." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Connectez-vous pour enregistrer votre résultat." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  const data = body as Record<string, unknown>;
  const { gameId, score, correctAnswers, totalQuestions, durationSeconds } = data;
  if (typeof gameId !== "string" || !GAME_IDS.has(gameId)
    || !Number.isInteger(score) || (score as number) < 0 || (score as number) > 1000
    || !Number.isInteger(correctAnswers) || (correctAnswers as number) < 0
    || !Number.isInteger(totalQuestions) || (totalQuestions as number) < 1 || (totalQuestions as number) > 50
    || (correctAnswers as number) > (totalQuestions as number)
    || !Number.isInteger(durationSeconds) || (durationSeconds as number) < 0 || (durationSeconds as number) > 86400) {
    return NextResponse.json({ error: "Le résultat de la partie est invalide." }, { status: 400 });
  }
  try {
    const sql = getDb();
    const rows = await sql`insert into public.game_results (user_id, game_id, score, correct_answers, total_questions, duration_seconds) values (${user.id}, ${gameId}, ${score as number}, ${correctAnswers as number}, ${totalQuestions as number}, ${durationSeconds as number}) returning id, game_id, score, correct_answers, total_questions, duration_seconds, completed_at`;
    return NextResponse.json({ result: rows[0] }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("NIKAHYA game result save failed.");
    return NextResponse.json({ error: "Résultat non enregistré. Vérifiez que la migration 004_games.sql est appliquée." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
