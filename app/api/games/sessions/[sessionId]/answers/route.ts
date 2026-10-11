import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ sessionId: string }> }) {
  const user = await getCurrentUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const { sessionId } = await context.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId)) return NextResponse.json({ error: "Défi introuvable." }, { status: 404 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400 }); }
  const data = body && typeof body === "object" ? body as Record<string, unknown> : {};
  if (!Number.isInteger(data.questionIndex) || (data.questionIndex as number) < 0 || (data.questionIndex as number) > 3 || !Number.isInteger(data.answerIndex) || (data.answerIndex as number) < 0 || (data.answerIndex as number) > 3) {
    return NextResponse.json({ error: "Réponse invalide." }, { status: 400 });
  }
  try {
    const sql = getDb();
    const sessions = await sql`
      select id, status, current_question, host_user_id, guest_user_id
      from public.game_sessions
      where id = ${sessionId} and (host_user_id = ${user.id} or guest_user_id = ${user.id})
      limit 1
    `;
    if (!sessions.length) return NextResponse.json({ error: "Défi introuvable ou accès non autorisé." }, { status: 404 });
    const session = sessions[0];
    if (session.status !== "active" || !session.guest_user_id) return NextResponse.json({ error: "Le défi doit avoir deux joueurs pour commencer." }, { status: 409 });
    if (Number(session.current_question) !== data.questionIndex) return NextResponse.json({ error: "Cette question n'est plus active. Actualisez le défi." }, { status: 409 });
    await sql`
      insert into public.game_session_answers (session_id, user_id, question_index, answer_index)
      values (${sessionId}, ${user.id}, ${data.questionIndex as number}, ${data.answerIndex as number})
      on conflict (session_id, user_id, question_index) do nothing
    `;
    const answers = await sql`
      select user_id from public.game_session_answers
      where session_id = ${sessionId} and question_index = ${data.questionIndex as number}
    `;
    if (answers.length >= 2) {
      const nextQuestion = (data.questionIndex as number) + 1;
      await sql`
        update public.game_sessions
        set current_question = ${nextQuestion},
            status = case when ${nextQuestion} >= 4 then 'completed' else 'active' end,
            completed_at = case when ${nextQuestion} >= 4 then now() else completed_at end,
            updated_at = now()
        where id = ${sessionId} and current_question = ${data.questionIndex as number} and status = 'active'
      `;
    }
    return NextResponse.json({ ok: true, answered: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("NIKAHYA game session answer failed.");
    return NextResponse.json({ error: "Réponse non enregistrée. Vérifiez la migration 005_game_sessions.sql." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
