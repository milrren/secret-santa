import type { SupabaseClient } from "@supabase/supabase-js";
import type { Transporter } from "nodemailer";
import type { Database } from "@/types/database";
import { drawResultEmail } from "@/server/mail/templates/draw-result-email";

export interface DispatchResult {
  sent: number;
  failed: number;
  errors: string[];
}

const BATCH_SIZE = 5;

interface MatchWithParticipants {
  id: string;
  giver_id: string;
  giver: { name: string; email: string };
  receiver: { name: string };
  draw: {
    title: string;
    code: string;
    event_date: string | null;
    budget_limit: number | null;
  };
}

export async function dispatchEmails(
  drawId: string,
  adminSupabase: SupabaseClient<Database>,
  transporter: Transporter
): Promise<DispatchResult> {
  const appUrl =
    process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const fromName = process.env.EMAIL_FROM_NAME ?? "Secret Santa";
  const fromEmail = process.env.GMAIL_USER!;

  // 1. Busca matches pendentes com dados do giver, receiver e draw
  const { data: matches, error } = await adminSupabase
    .from("matches")
    .select(
      `id, giver_id,
       giver:participants!matches_giver_id_fkey(name, email),
       receiver:participants!matches_receiver_id_fkey(name),
       draw:draws!matches_draw_id_fkey(title, code, event_date, budget_limit)`
    )
    .eq("draw_id", drawId)
    .eq("email_sent", false);

  if (error) {
    return { sent: 0, failed: 0, errors: [`DB error: ${error.message}`] };
  }

  if (!matches || matches.length === 0) {
    return { sent: 0, failed: 0, errors: [] };
  }

  const result: DispatchResult = { sent: 0, failed: 0, errors: [] };

  // 2. Processa em lotes de BATCH_SIZE
  for (let i = 0; i < matches.length; i += BATCH_SIZE) {
    const batch = matches.slice(i, i + BATCH_SIZE) as unknown as MatchWithParticipants[];

    const outcomes = await Promise.allSettled(
      batch.map(async (match) => {
        const { subject, html, text } = drawResultEmail({
          giverName: match.giver.name,
          receiverName: match.receiver.name,
          drawTitle: match.draw.title,
          drawCode: match.draw.code,
          eventDate: match.draw.event_date,
          budget: match.draw.budget_limit,
          appUrl,
        });

        await transporter.sendMail({
          from: `"${fromName}" <${fromEmail}>`,
          to: match.giver.email,
          subject,
          html,
          text,
        });

        return match.id;
      })
    );

    // 3. Coleta IDs bem-sucedidos e atualiza o banco
    const succeededIds: string[] = [];
    outcomes.forEach((outcome, idx) => {
      if (outcome.status === "fulfilled") {
        succeededIds.push(batch[idx].id);
        result.sent++;
      } else {
        result.failed++;
        result.errors.push(
          `${batch[idx].giver.email}: ${outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason)}`
        );
      }
    });

    if (succeededIds.length > 0) {
      await adminSupabase
        .from("matches")
        .update({ email_sent: true })
        .in("id", succeededIds);
    }
  }

  return result;
}
