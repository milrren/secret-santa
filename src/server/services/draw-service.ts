import { Participant, MatchResult } from "@/server/schemas/participant";

/**
 * Realiza o sorteio de amigo secreto garantindo que ninguém tire a si mesmo (Derangement).
 * Executa de forma pura e desacoplada, ideal para Serverless Functions (Vercel).
 */
export function generateSecretSantaPairs(participants: Participant[]): MatchResult[] {
  if (participants.length < 2) {
    throw new Error("São necessários ao menos 2 participantes para o sorteio.");
  }

  // Verifica IDs duplicados
  const ids = new Set(participants.map((p) => p.id));
  if (ids.size !== participants.length) {
    throw new Error("Existem participantes com IDs duplicados.");
  }

  // Embaralha com Fisher-Yates
  const shuffled = [...participants];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Cria ciclo onde shuffled[i] tira shuffled[i+1] (e o último tira o primeiro)
  const pairs: MatchResult[] = [];
  for (let i = 0; i < shuffled.length; i++) {
    const giver = shuffled[i];
    const receiver = shuffled[(i + 1) % shuffled.length];
    pairs.push({ giver, receiver });
  }

  return pairs;
}

