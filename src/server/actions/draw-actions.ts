"use server";

import { DrawRequestSchema, MatchResult } from "@/server/schemas/participant";
import { generateSecretSantaPairs } from "@/server/services/draw-service";

export type DrawActionResult =
  | { success: true; matches: MatchResult[] }
  | { success: false; error: string };

/**
 * Server Action para executar o sorteio serverless diretamente a partir de formulários/componentes React.
 */
export async function executeDrawAction(
  rawParticipants: unknown
): Promise<DrawActionResult> {
  try {
    const validation = DrawRequestSchema.safeParse({
      participants: rawParticipants,
    });

    if (!validation.success) {
      const firstIssue = validation.error.issues[0]?.message || "Dados inválidos";
      return { success: false, error: firstIssue };
    }

    const matches = generateSecretSantaPairs(validation.data.participants);
    return { success: true, matches };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro interno ao realizar o sorteio.";
    return { success: false, error: message };
  }
}

