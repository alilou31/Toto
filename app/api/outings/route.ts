import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };
const kinds = ["restaurant","cinema","promenade","voyage","cafe"];
async function premium(userId:string) {
 const sql=getDb();
 const rows=await sql`select 1 from public.premium_entitlements where user_id=${userId} and active_until>now() limit 1`;
 return rows.length>0;
}
export async function GET() {
 const user=await getCurrentUser().catch(()=>null);
 if(!user)return NextResponse.json({error:"Authentification requise."},{status:401,headers});
 try {
  const sql=getDb();
  const rows=await sql`select i.id,i.sender_id,i.recipient_id,i.kind,i.proposed_at,i.city,i.note,i.status,i.created_at,
  p.public_name as sender_name from public.outing_invitations i
  join public.profiles p on p.id=i.sender_id
  where (i.sender_id=${user.id} or i.recipient_id=${user.id})
  and not exists(select 1 from public.blocks b where (b.blocker_id=i.sender_id and b.blocked_id=i.recipient_id) or (b.blocker_id=i.recipient_id and b.blocked_id=i.sender_id))
  order by i.created_at desc limit 100`;
  return NextResponse.json({invitations:rows,premium:await premium(user.id)},{headers});
 }catch{return NextResponse.json({error:"Service indisponible. Vérifiez la migration 015."},{status:503,headers});}
}
export async function POST(request:Request) {
 const user=await getCurrentUser().catch(()=>null);
 if(!user)return NextResponse.json({error:"Authentification requise."},{status:401,headers});
 let data:Record<string,unknown>;
 try{data=await request.json() as Record<string,unknown>;}catch{return NextResponse.json({error:"Requête invalide."},{status:400,headers});}
 const recipientId=typeof data.recipientId==="string"?data.recipientId.trim():"";
 const kind=typeof data.kind==="string"?data.kind:"";
 const city=typeof data.city==="string"?data.city.trim():"";
 const note=typeof data.note==="string"?data.note.trim():"";
 const when=typeof data.proposedAt==="string"?new Date(data.proposedAt):new Date(NaN);
 if(!recipientId||recipientId.length>128||recipientId===user.id||!kinds.includes(kind)||city.length<2||city.length>100||note.length>240||!Number.isFinite(when.getTime())||when.getTime()<Date.now()+3600000||when.getTime()>Date.now()+31536000000)
 return NextResponse.json({error:"Vérifiez le destinataire, l'activité, la ville et la date (au moins une heure à l'avance)."},{status:400,headers});
 try{
  if(!await premium(user.id))return NextResponse.json({error:"Cette fonctionnalité nécessite Premium. Le paiement n'est pas encore activé.",upgrade:"/offres"},{status:403,headers});
  const sql=getDb();
  const eligible=await sql`select 1 from public.matches m
   join public.profiles a on a.id=${user.id} join public.profiles b on b.id=${recipientId}
   where ((m.user_a=${user.id} and m.user_b=${recipientId}) or (m.user_b=${user.id} and m.user_a=${recipientId}))
   and a.birth_date<=current_date-interval '18 years' and b.birth_date<=current_date-interval '18 years'
   and a.onboarding_completed=true and b.onboarding_completed=true and b.visibility='visible'
   and not exists(select 1 from public.blocks x where (x.blocker_id=${user.id} and x.blocked_id=${recipientId}) or (x.blocker_id=${recipientId} and x.blocked_id=${user.id}))
   limit 1`;
  if(!eligible.length)return NextResponse.json({error:"Invitation possible uniquement avec un match autorisé."},{status:403,headers});
  const duplicate=await sql`select 1 from public.outing_invitations where sender_id=${user.id} and recipient_id=${recipientId} and status='pending' and proposed_at>now() limit 1`;
  if(duplicate.length)return NextResponse.json({error:"Une invitation est déjà en attente pour ce membre."},{status:409,headers});
  const rows=await sql`insert into public.outing_invitations(sender_id,recipient_id,kind,proposed_at,city,note)
  values(${user.id},${recipientId},${kind},${when.toISOString()},${city},${note||null}) returning id,status`;
  return NextResponse.json({invitation:rows[0]},{status:201,headers});
 }catch{return NextResponse.json({error:"Impossible de créer l'invitation."},{status:503,headers});}
}
export async function PATCH(request:Request){
 const user=await getCurrentUser().catch(()=>null);
 if(!user)return NextResponse.json({error:"Authentification requise."},{status:401,headers});
 let data:Record<string,unknown>;
 try{data=await request.json() as Record<string,unknown>;}catch{return NextResponse.json({error:"Requête invalide."},{status:400,headers});}
 const id=typeof data.id==="string"?data.id:"",status=typeof data.status==="string"?data.status:"";
 if(!/^[a-f0-9-]{36}$/i.test(id)||!["accepted","declined","cancelled"].includes(status))return NextResponse.json({error:"Action invalide."},{status:400,headers});
 try{
  const sql=getDb();
  const rows=await sql`update public.outing_invitations i set status=${status},updated_at=now()
  where i.id=${id} and i.status='pending' and i.proposed_at>now()
  and ((i.recipient_id=${user.id} and ${status} in ('accepted','declined')) or (i.sender_id=${user.id} and ${status}='cancelled'))
  and not exists(select 1 from public.blocks b where (b.blocker_id=i.sender_id and b.blocked_id=i.recipient_id) or (b.blocker_id=i.recipient_id and b.blocked_id=i.sender_id))
  returning i.id,i.status`;
  if(!rows.length)return NextResponse.json({error:"Invitation introuvable ou action non autorisée."},{status:404,headers});
  return NextResponse.json({invitation:rows[0]},{headers});
 }catch{return NextResponse.json({error:"Mise à jour indisponible."},{status:503,headers});}
}
