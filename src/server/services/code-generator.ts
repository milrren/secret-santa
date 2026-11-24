import { randomInt } from "crypto";

// Alfabeto legível sem caracteres ambíguos (0, O, 1, I, L)
const COUPON_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/**
 * Gera um código único no estilo cupom (ex: SANTA-9K2F).
 */
export function generateCouponCode(length = 4): string {
  let suffix = "";
  for (let i = 0; i < length; i++) {
    suffix += COUPON_ALPHABET[randomInt(0, COUPON_ALPHABET.length)];
  }
  return `SANTA-${suffix}`;
}
