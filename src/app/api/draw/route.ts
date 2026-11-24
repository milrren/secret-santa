import { NextRequest, NextResponse } from "next/server";
import { DrawRequestSchema } from "@/server/schemas/participant";
import { generateSecretSantaPairs } from "@/server/services/draw-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = DrawRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Requisição inválida",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const matches = generateSecretSantaPairs(result.data.participants);

    return NextResponse.json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json(
      { error: "Falha ao processar sorteio", message },
      { status: 500 }
    );
  }
}

