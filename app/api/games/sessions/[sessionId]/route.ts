import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ sessionId: string }> }) {
  const user = await getCurrentUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const { sessionId } = await context.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId)) return NextResponse.json({ error: "Défi introuvable." }, { status: 404 });
  try {
    const sql = getDb();
    const sessions = await sql`
      select id, invite_code, game_id, status, current_question, created_at, updated_at, completed_at,
        (host_user_id = ${user.id}) as is_host,
        case when host_user_id = ${user.id} then guest_user_id is not null else host_user_id is not null end as has_opponent
      from public.game_sessions
      where id = ${sessionId} and (host_user_id = ${user.id} or guest_user_id = ${user.id})
      limit 1
    `;
    if (!sessions.length) return NextResponse.json({ error: "Défi introuvable ou accès non autorisé." }, { status: 404, headers: { "Cache-Control": "no-store" } });
    const session = sessions[0];
    const questionIndex = Math.min(Number(session.current_question), 3);
    const answers = await sql`
      select user_id, answer_index, question_index, answered_at
      from public.game_session_answers
      where session_id = ${sessionId} and question_index = ${questionIndex}
        and user_id in (
          select host_user_id from public.game_sessions where id = ${sessionId}
          union select guest_user_id from public.game_sessions where id = ${sessionId} and guest_user_id is not null
        )
    `;
    const mine = answers.find((answer: { user_id: string }) => answer.user_id === user.id);
    const bothAnswered = answers.length >= 2;
    return NextResponse.json({
      session,
      question: session.status === "completed" ? null : questionIndex,
      myAnswer: mine ? Number(mine.answer_index) : null,
      opponentAnswered: answers.some((answer: { user_id: string }) => answer.user_id !== user.id),
      bothAnswered,
      answers: bothAnswered ? answers.map((answer: { user_id: string; answer_index: number }) => ({ isMe: answer.user_id === user.id, answerIndex: Number(answer.answer_index) })) : [],
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("NIKAHYA game session state read failed.");
    return NextResponse.json({ error: "État du défi indisponible. Vérifiez la migration 005_game_sessions.sql." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
