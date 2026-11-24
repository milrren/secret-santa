import { z } from "zod";

export const ParticipantSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  name: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().trim().email("E-mail inválido"),
});

export type Participant = z.infer<typeof ParticipantSchema>;

export const DrawRequestSchema = z.object({
  participants: z
    .array(ParticipantSchema)
    .min(2, "São necessários pelo menos 2 participantes para realizar o sorteio"),
});

export type DrawRequest = z.infer<typeof DrawRequestSchema>;

export const MatchResultSchema = z.object({
  giver: ParticipantSchema,
  receiver: ParticipantSchema,
});

export type MatchResult = z.infer<typeof MatchResultSchema>;

