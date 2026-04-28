import { NextResponse } from "next/server";
import { calculateShippingFromPostalCode } from "@/lib/shipping";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const quote = calculateShippingFromPostalCode(body?.cp?.toString() ?? "");

    return NextResponse.json({
      ...quote,
      message: `Costo de envío calculado para ${quote.province}`,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error interno al calcular el envío.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
