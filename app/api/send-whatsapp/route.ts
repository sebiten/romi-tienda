import { NextResponse } from 'next/server';

interface TemplatePayload {
  phoneNumber: string; // número destinatario
  clientName: string;
  orderId: string;
  cartDetails: string; 
  total: string;
}

export async function POST(request: Request) {
  try {
    const { 
      phoneNumber, 
      clientName, 
      orderId, 
      cartDetails, 
      total 
    } = (await request.json()) as TemplatePayload;

    // Token de tu WhatsApp Cloud API
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: 'Falta el token de acceso (WHATSAPP_ACCESS_TOKEN).' },
        { status: 500 }
      );
    }

    // Este es tu "Business Phone Number ID" (no confundir con tu app_id)
    const businessNumberId = "569589329578480"; // Ajusta el tuyo

    // WhatsApp Graph API endpoint (versión v22.0)
    const url = `https://graph.facebook.com/v22.0/${businessNumberId}/messages`;

    // Armar el payload de "template" con placeholders en body
    // Asegúrate de usar el mismo nombre e idioma que creaste y aprobaste
    const payload = {
      messaging_product: "whatsapp",
      to: phoneNumber,  // "543875155939" en formato internacional sin '+'
      type: "template",
      template: {
        name: "carrito",       // <- el nombre exacto de tu plantilla
        language: { code: "es_AR" },  // <- tu código de idioma
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: clientName },
              { type: "text", text: orderId },
              { type: "text", text: cartDetails },
              { type: "text", text: total },
            ],
          },
        ],
      },
    };

    // Llamada a la API
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
