import { z } from "zod";

export const DrawParticipantInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome do participante deve ter pelo menos 2 caracteres")
    .max(80, "Nome muito longo"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Informe um e-mail válido"),
});

export type DrawParticipantInput = z.infer<typeof DrawParticipantInputSchema>;

const OptionalBudgetSchema = z
  .union([z.number(), z.string(), z.null(), z.undefined()])
  .transform((val, ctx) => {
    if (val === null || val === undefined || val === "") return null;
    const normalized =
      typeof val === "string" ? Number(val.replace(",", ".").trim()) : val;
    if (!Number.isFinite(normalized) || normalized <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "O valor sugerido deve ser maior que zero",
      });
      return z.NEVER;
    }
    return Math.round(normalized * 100) / 100;
  });

const OptionalEventDateSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((val, ctx) => {
    if (!val || !val.trim()) return null;
    const parsed = new Date(val);
    if (Number.isNaN(parsed.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Data do evento inválida",
      });
      return z.NEVER;
    }
    return parsed.toISOString();
  });

export const DrawDetailsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "O título deve ter pelo menos 3 caracteres")
    .max(100, "O título deve ter no máximo 100 caracteres"),
  description: z
    .string()
    .trim()
    .max(500, "A descrição deve ter no máximo 500 caracteres")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  eventDate: OptionalEventDateSchema,
  budgetLimit: OptionalBudgetSchema,
});

export const CreateDrawSchema = DrawDetailsSchema.extend({
  participants: z
    .array(DrawParticipantInputSchema)
    .refine(
      (list) => {
        const emails = list.map((p) => p.email.toLowerCase());
        return new Set(emails).size === emails.length;
      },
      { message: "Não é permitido repetir e-mails na lista de participantes" }
    ),
});

export type CreateDrawInput = z.infer<typeof CreateDrawSchema>;

export const UpdateDrawSchema = DrawDetailsSchema.extend({
  drawId: z.string().uuid("ID do sorteio inválido"),
});

export type UpdateDrawInput = z.infer<typeof UpdateDrawSchema>;

export const AddParticipantSchema = DrawParticipantInputSchema.extend({
  drawId: z.string().uuid("ID do sorteio inválido"),
});

export type AddParticipantInput = z.infer<typeof AddParticipantSchema>;
