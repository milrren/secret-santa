"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import {
  AddParticipantSchema,
  CreateDrawSchema,
  UpdateDrawSchema,
} from "@/server/schemas/draw";
import { generateCouponCode } from "@/server/services/code-generator";
import { generateSecretSantaPairs } from "@/server/services/draw-service";

export type ActionResponse<T = undefined> =
  | ({ success: true } & (T extends undefined ? object : T))
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

const UuidSchema = z.string().uuid("Identificador inválido");

async function getAuthenticatedContext() {
  const { isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    return { error: "Supabase não configurado no ambiente." as const };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: "Você precisa estar logado para realizar esta ação." as const };
  }

  return { supabase, user };
}

export async function createDrawAction(
  rawInput: unknown
): Promise<ActionResponse<{ drawId: string; code: string }>> {
  const ctx = await getAuthenticatedContext();
  if ("error" in ctx) {
    return { success: false, error: ctx.error ?? "Erro de autenticação." };
  }

  const parsed = CreateDrawSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Dados do sorteio inválidos.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { supabase, user } = ctx;
  const { title, description, eventDate, budgetLimit, participants } = parsed.data;

  // Tenta inserir com código cupom único (retry automático em caso de colisão)
  let createdDraw: { id: string; code: string } | null = null;
  let lastInsertError: string | null = null;

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCouponCode(4);
    const { data, error } = await supabase
      .from("draws")
      .insert({
        code,
        title,
        description,
        event_date: eventDate,
        budget_limit: budgetLimit,
        status: "draft",
        created_by: user.id,
      })
      .select("id, code")
      .single();

    if (!error && data) {
      createdDraw = data;
      break;
    }

    // 23505 = unique_violation no Postgres
    if (error?.code !== "23505") {
      lastInsertError = error?.message || "Erro ao salvar sorteio.";
      break;
    }
  }

  if (!createdDraw) {
    return {
      success: false,
      error: lastInsertError || "Não foi possível gerar um código único. Tente novamente.",
    };
  }

  if (participants.length > 0) {
    const userEmailLower = user.email?.toLowerCase();
    const participantRows = participants.map((p) => ({
      draw_id: createdDraw.id,
      name: p.name,
      email: p.email,
      user_id: userEmailLower && p.email.toLowerCase() === userEmailLower ? user.id : null,
    }));

    const { error: partError } = await supabase
      .from("participants")
      .insert(participantRows);

    if (partError) {
      // Rollback do sorteio rascunho se os participantes falharem
      await supabase.from("draws").delete().eq("id", createdDraw.id);
      return {
        success: false,
        error: "Erro ao salvar participantes iniciais: " + partError.message,
      };
    }
  }

  revalidatePath("/dashboard");
  return {
    success: true,
    drawId: createdDraw.id,
    code: createdDraw.code,
  };
}

export async function updateDrawAction(
  rawInput: unknown
): Promise<ActionResponse> {
  const ctx = await getAuthenticatedContext();
  if ("error" in ctx) {
    return { success: false, error: ctx.error ?? "Erro de autenticação." };
  }

  const parsed = UpdateDrawSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Dados inválidos.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { supabase, user } = ctx;
  const { drawId, title, description, eventDate, budgetLimit } = parsed.data;

  const { data, error } = await supabase
    .from("draws")
    .update({
      title,
      description,
      event_date: eventDate,
      budget_limit: budgetLimit,
    })
    .eq("id", drawId)
    .eq("created_by", user.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      success: false,
      error: error?.message || "Sorteio não encontrado ou sem permissão de edição.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/draws/${drawId}`);
  return { success: true };
}

export async function addParticipantAction(
  rawInput: unknown
): Promise<ActionResponse<{ participant: { id: string; name: string; email: string } }>> {
  const ctx = await getAuthenticatedContext();
  if ("error" in ctx) {
    return { success: false, error: ctx.error ?? "Erro de autenticação." };
  }

  const parsed = AddParticipantSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Dados do participante inválidos.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { supabase, user } = ctx;
  const { drawId, name, email } = parsed.data;

  const { data: draw } = await supabase
    .from("draws")
    .select("id, status, created_by")
    .eq("id", drawId)
    .maybeSingle();

  if (!draw || draw.created_by !== user.id) {
    return { success: false, error: "Sorteio não encontrado ou sem permissão." };
  }

  if (draw.status !== "draft") {
    return {
      success: false,
      error: "Não é possível adicionar participantes após o sorteio já ter sido realizado.",
    };
  }

  const userEmailLower = user.email?.toLowerCase();
  const { data: inserted, error } = await supabase
    .from("participants")
    .insert({
      draw_id: drawId,
      name,
      email,
      user_id: userEmailLower && email.toLowerCase() === userEmailLower ? user.id : null,
    })
    .select("id, name, email")
    .single();

  if (error || !inserted) {
    if (error?.code === "23505") {
      return {
        success: false,
        error: "Já existe um participante com este e-mail neste sorteio.",
      };
    }
    return {
      success: false,
      error: error?.message || "Erro ao adicionar participante.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/draws/${drawId}`);
  return { success: true, participant: inserted };
}

export async function removeParticipantAction(
  drawId: string,
  participantId: string
): Promise<ActionResponse> {
  const ctx = await getAuthenticatedContext();
  if ("error" in ctx) {
    return { success: false, error: ctx.error ?? "Erro de autenticação." };
  }

  if (!UuidSchema.safeParse(drawId).success || !UuidSchema.safeParse(participantId).success) {
    return { success: false, error: "Identificadores inválidos." };
  }

  const { supabase, user } = ctx;

  const { data: draw } = await supabase
    .from("draws")
    .select("id, status, created_by")
    .eq("id", drawId)
    .maybeSingle();

  if (!draw || draw.created_by !== user.id) {
    return { success: false, error: "Sorteio não encontrado ou sem permissão." };
  }

  if (draw.status !== "draft") {
    return {
      success: false,
      error: "Não é possível remover participantes após o sorteio já ter sido realizado.",
    };
  }

  const { error } = await supabase
    .from("participants")
    .delete()
    .eq("id", participantId)
    .eq("draw_id", drawId);

  if (error) {
    return { success: false, error: "Erro ao remover participante." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/draws/${drawId}`);
  return { success: true };
}

export async function performDrawAction(
  drawId: string
): Promise<ActionResponse<{ count: number }>> {
  const ctx = await getAuthenticatedContext();
  if ("error" in ctx) {
    return { success: false, error: ctx.error ?? "Erro de autenticação." };
  }

  if (!UuidSchema.safeParse(drawId).success) {
    return { success: false, error: "ID do sorteio inválido." };
  }

  const { supabase, user } = ctx;

  const { data: draw } = await supabase
    .from("draws")
    .select("id, status, created_by")
    .eq("id", drawId)
    .maybeSingle();

  if (!draw || draw.created_by !== user.id) {
    return { success: false, error: "Sorteio não encontrado ou sem permissão." };
  }

  if (draw.status !== "draft") {
    return { success: false, error: "Este sorteio já foi realizado anteriormente." };
  }

  const { data: participants, error: partError } = await supabase
    .from("participants")
    .select("id, name, email")
    .eq("draw_id", drawId);

  if (partError || !participants) {
    return { success: false, error: "Erro ao carregar participantes do sorteio." };
  }

  if (participants.length < 2) {
    return {
      success: false,
      error: "Adicione pelo menos 2 participantes para realizar o sorteio.",
    };
  }

  // Gera os pares garantindo que ninguém tire a si mesmo (Derangement)
  const pairs = generateSecretSantaPairs(participants);

  const matchRows = pairs.map((pair) => ({
    draw_id: drawId,
    giver_id: pair.giver.id,
    receiver_id: pair.receiver.id,
    email_sent: false,
  }));

  const { error: matchError } = await supabase.from("matches").insert(matchRows);

  if (matchError) {
    if (matchError.code === "23505") {
      return { success: false, error: "Os pares deste sorteio já foram gerados." };
    }
    return {
      success: false,
      error: "Erro ao gravar resultados do sorteio: " + matchError.message,
    };
  }

  const { error: updateError } = await supabase
    .from("draws")
    .update({ status: "drawn" })
    .eq("id", drawId)
    .eq("status", "draft");

  if (updateError) {
    return {
      success: false,
      error: "Pares gravados, mas houve falha ao atualizar o status do sorteio.",
    };
  }

  // Regra estrita de sigilo: nunca retornamos os pares gerados ao organizador!
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/draws/${drawId}`);
  return { success: true, count: pairs.length };
}

export async function deleteDrawAction(drawId: string): Promise<ActionResponse> {
  const ctx = await getAuthenticatedContext();
  if ("error" in ctx) {
    return { success: false, error: ctx.error ?? "Erro de autenticação." };
  }

  if (!UuidSchema.safeParse(drawId).success) {
    return { success: false, error: "ID do sorteio inválido." };
  }

  const { supabase, user } = ctx;

  const { data: draw } = await supabase
    .from("draws")
    .select("id, status, created_by")
    .eq("id", drawId)
    .maybeSingle();

  if (!draw || draw.created_by !== user.id) {
    return { success: false, error: "Sorteio não encontrado ou sem permissão." };
  }

  if (draw.status !== "draft") {
    return {
      success: false,
      error: "Apenas sorteios em rascunho podem ser excluídos.",
    };
  }

  const { error } = await supabase
    .from("draws")
    .delete()
    .eq("id", drawId)
    .eq("created_by", user.id);

  if (error) {
    return { success: false, error: "Erro ao excluir sorteio." };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
