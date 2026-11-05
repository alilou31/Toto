import { getDb } from "@/lib/db";

export type MembershipTier = "free" | "premium" | "elite";

export async function getMembershipTier(userId: string): Promise<MembershipTier> {
  const sql = getDb();
  const rows = await sql`select plan_code from public.premium_entitlements where user_id = ${userId} and active_until > now() limit 1`;
  if (!rows.length) return "free";
  return rows[0].plan_code === "elite" ? "elite" : "premium";
}

/** Both people must have an active paid entitlement before any conversation content is exposed. */
export async function hasConversationChatAccess(conversationId: string): Promise<boolean> {
  const sql = getDb();
  const rows = await sql`
    select exists (
      select 1 from public.conversations c
      join public.matches m on m.id = c.match_id
      join public.premium_entitlements a on a.user_id = m.user_a and a.active_until > now()
      join public.premium_entitlements b on b.user_id = m.user_b and b.active_until > now()
      where c.id = ${conversationId}
    ) as allowed
  `;
  return Boolean(rows[0]?.allowed);
}

export function membershipRequiredResponse() {
  return {
    error: "Les échanges sont réservés aux membres Premium ou Élite lorsque les deux membres du match disposent d’un abonnement actif.",
    code: "CHAT_MEMBERSHIP_REQUIRED",
    upgrade: "/offres",
  };
}
