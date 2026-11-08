import { getCurrentUser } from "@/lib/auth";
import FeedbackAdminDashboard from "@/app/components/feedback-admin-dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function FeedbackAdminPage() {
  const user = await getCurrentUser().catch(() => null);
  const allowlist = (process.env.FEEDBACK_ADMIN_EMAILS ?? "").split(",").map(value => value.trim().toLowerCase()).filter(Boolean);
  if (!user || !allowlist.includes(user.email.toLowerCase())) {
    return <main className="voc-admin"><section className="voc-admin-card"><h1>Accès réservé</h1><p>Ce tableau de bord est réservé aux membres autorisés de l’équipe produit.</p></section></main>;
  }
  return <FeedbackAdminDashboard />;
}
