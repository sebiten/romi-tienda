import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const normalize = (str: string) =>
    str
        .trim()
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const body = await req.json();

        if (!body.title || !body.price) {
            return NextResponse.json(
                { error: "Faltan datos del producto" },
                { status: 400 }
            );
        }

        const normalized = {
            ...body,
            title: normalize(body.title),
            description: body.description ? normalize(body.description) : "",
            variants: body.variants?.map((v: any) => ({
                ...v,
                color: normalize(v.color),
            })),
        };

        const { error } = await supabase.from("products").insert(normalized);

        if (error) {
            console.error("❌ ERROR al insertar:", error);
            return NextResponse.json(
                { error: "Error guardando producto" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (err) {
        console.error("❌ ERROR en API create product:", err);
        return NextResponse.json(
            { error: "Error interno" },
            { status: 500 }
        );
    }
}
