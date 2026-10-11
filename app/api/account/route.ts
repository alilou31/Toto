import { NextResponse } from "next/server";
import { destroyCurrentSession, getCurrentUser, verifyPassword } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(request: Request) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400, headers: { "Cache-Control": "no-store" } }); }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  const data = body as Record<string, unknown>;
  if (typeof data.password !== "string" || data.password.length < 1 || data.password.length > 256 || data.confirmation !== "SUPPRIMER") {
    return NextResponse.json({ error: "Saisissez votre mot de passe et tapez SUPPRIMER pour confirmer." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  const user = await getCurrentUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Votre session a expiré. Reconnectez-vous." }, { status: 401, headers: { "Cache-Control": "no-store" } });

  try {
    const sql = getDb();
    const rows = await sql`select password_hash from public.auth_users where id = ${user.id} and disabled_at is null limit 1`;
    const account = rows[0] as { password_hash: string } | undefined;
    if (!account || !(await verifyPassword(data.password, account.password_hash))) {
      return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 403, headers: { "Cache-Control": "no-store" } });
    }
    // One PostgreSQL statement: remove the profile and its dependent data, then the auth user and sessions.
    await sql`
      with deleted_profile as (
        delete from public.profiles where id = ${user.id} returning id
      ),
      deleted_user as (
        delete from public.auth_users where id = ${user.id} returning id
      )
      select
        (select count(*) from deleted_profile) as profiles_deleted,
        (select count(*) from deleted_user) as users_deleted
    `;
    await destroyCurrentSession();
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("NIKAHYA account deletion failed.");
    return NextResponse.json({ error: "La suppression du compte a échoué. Réessayez plus tard." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
