"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAdminSupabase, isAdminConfigured } from "@/lib/supabase/admin";
import { getGmailTransporter, isMailConfigured } from "@/server/mail/transporter";
import { dispatchEmails } from "@/server/services/email-dispatch-service";
import type { ActionResponse } from "@/server/actions/draw-management";

const UuidSchema = z.string().uuid("Identificador inválido");

export async function dispatchDrawEmailsAction(
  drawId: string
): Promise<ActionResponse<{ sentCount: number; failedCount: number; errors: string[] }>> {
  // 1. Valida formato do ID
  const parsed = UuidSchema.safeParse(drawId);
  if (!parsed.success) {
    return { success: false, error: "ID do sorteio inválido." };
  }

  // 2. Verifica configuração de e-mail e admin
  if (!isAdminConfigured()) {
    return {
      success: false,
      error:
        "Chave de serviço do Supabase (SUPABASE_SERVICE_ROLE_KEY) não configurada. Adicione ao .env.local.",
    };
  }

  if (!isMailConfigured()) {
    return {
      success: false,
      error:
        "Credenciais de e-mail (GMAIL_USER / GMAIL_APP_PASSWORD) não configuradas. Adicione ao .env.local.",
    };
  }

  // 3. Verifica sessão do usuário
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Você precisa estar logado para realizar esta ação." };
  }

  // 4. Verifica que o usuário é dono do sorteio e que ele já foi realizado
  const { data: draw, error: drawError } = await supabase
    .from("draws")
    .select("id, status, created_by")
    .eq("id", drawId)
    .single();

  if (drawError || !draw) {
    return { success: false, error: "Sorteio não encontrado." };
  }

  if (draw.created_by !== user.id) {
    return { success: false, error: "Apenas o organizador pode disparar os e-mails." };
  }

  if (draw.status !== "drawn") {
    return {
      success: false,
      error: "O sorteio ainda não foi realizado. Execute o sorteio antes de enviar e-mails.",
    };
  }

  // 5. Despacha e-mails
  try {
    const adminSupabase = getAdminSupabase();
    const transporter = getGmailTransporter();
    const result = await dispatchEmails(drawId, adminSupabase, transporter);

    return {
      success: true,
      sentCount: result.sent,
      failedCount: result.failed,
      errors: result.errors,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro inesperado ao enviar e-mails.",
    };
  }
}
