import { NextResponse } from "next/server";

interface RequestBody {
  phoneNumber: string;
  message: string;
}

export async function POST(request: Request) {
  try {
    // 1. Obtenemos phoneNumber y message del body
    const { phoneNumber, message } = (await request.json()) as RequestBody;

    // 2. Tomamos el token de la variable de entorno
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "Falta el token de acceso (WHATSAPP_ACCESS_TOKEN)." },
        { status: 500 }
      );
    }

    // 3. Tu "business phone number ID" (de la configuración de la Cloud API)
    const businessNumberId = "569589329578480"; // <--- Reemplaza con tu ID

    // 4. Construye la URL a la Graph API
    const url = `https://graph.facebook.com/v22.0/${businessNumberId}/messages`;

    // 5. Prepara el payload. type: "text" solo funciona si hay ventana de 24h abierta.
    const payload = {
      messaging_product: "whatsapp",
      to: phoneNumber, // formato internacional sin '+'
      type: "text", // o "template" si usas plantillas es lo mejor
      text: {
        body: message,
      },
    };

    // 6. Llamada a la API de Facebook
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // 7. Manejo de la respuesta
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    // 8. Si es exitoso, devolvemos la data
    const data = await response.json();
    if (!data.messages) {
      return NextResponse.json({ error: "No se pudo enviar el mensaje." }, { status: 500 });
    }
    console.log("Mensaje enviado:", data.messages[0].id);
    
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
