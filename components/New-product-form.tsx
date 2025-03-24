"use client";

import { useRef, useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase/client";
import DeleteProductForm from "./Delete-product-form";

// Tamaño máximo de archivo: 2 MB (ajústalo a tus necesidades)
const MAX_SIZE = 2 * 1024 * 1024;

export default function NewProductForm() {
    const [submitting, setSubmitting] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    // Ref al <form> real en el DOM
    const formRef = useRef<HTMLFormElement>(null);

    // Cliente de Supabase en el frontend (anon key o sesión del usuario)
    const supabase = createClient();

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setSubmitting(true);

        // 1. Validamos el archivo (opcional)
        let fileName = "";
        let publicUrl = "";

        if (file) {
            // Validar tamaño
            if (file.size > MAX_SIZE) {
                alert("La imagen excede los 2MB permitidos.");
                setSubmitting(false);
                return;
            }

            // // Validar tipo MIME
            // const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
            // if (!allowedTypes.includes(file.type)) {
            //     alert("Solo se permiten imágenes JPG o PNG.");
            //     setSubmitting(false);
            //     return;
            // }

            // Si pasa las validaciones, subimos la imagen
            fileName = `${file.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from("product-images")
                .upload(fileName, file);

            if (uploadError) {
                alert("Error subiendo la imagen: " + uploadError.message);
                setSubmitting(false);
                return;
            }

            const { data } = supabase.storage
                .from("product-images")
                .getPublicUrl(uploadData.path);

            publicUrl = data?.publicUrl ?? "";
        }

        // 2. Leemos campos del formulario
        if (!formRef.current) {
            setSubmitting(false);
            return;
        }
        const formData = new FormData(formRef.current);

        // Extraemos valores
        const title = (formData.get("title") as string)?.trim() || "";
        const description = (formData.get("description") as string)?.trim() || "";
        const priceStr = (formData.get("price") as string) || "0";
        const sizesStr = (formData.get("sizes") as string) || "";
        const colorsStr = (formData.get("colors") as string) || "";

        // Validaciones sencillas de campos
        if (title.length < 3) {
            alert("El título debe tener al menos 3 caracteres.");
            setSubmitting(false);
            return;
        }

        const price = parseFloat(priceStr);
        if (isNaN(price) || price < 0) {
            alert("El precio debe ser un número mayor o igual a 0.");
            setSubmitting(false);
            return;
        }

        // Convertimos tallas y colores a arrays
        const sizes = sizesStr
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s !== "");
        const colors = colorsStr
            .split(",")
            .map((c) => c.trim())
            .filter((c) => c !== "");

        // 3. Insertar en la tabla products
        const { data: insertData, error: insertError } = await supabase
            .from("products")
            .insert([
                {
                    title,
                    description,
                    price,
                    sizes,
                    colors,
                    images: publicUrl ? [publicUrl] : [],
                },
            ])
            .select(); // para ver la fila insertada

        // 4. Si falla el insert, opcionalmente borramos la imagen
        if (insertError) {
            console.error("ERROR al insertar producto:", insertError);
            alert("Error al insertar producto: " + insertError.message);

            // Limpieza: eliminar la imagen subida (si existe y no la necesitamos)
            if (fileName) {
                await supabase.storage
                    .from("product-images")
                    .remove([fileName]);
            }

            setSubmitting(false);
            return;
        }

        // 5. Éxito: reseteamos el formulario
        console.log("Producto insertado:", insertData);
        alert("¡Producto creado con éxito!");
        formRef.current.reset();
        setFile(null);
        setSubmitting(false);
    }

    return (
        <>
            <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 max-w-lg"
            >
                {/* Título */}
                <label className="block">
                    <span className="text-sm font-medium">Título</span>
                    <Input
                        name="title"
                        placeholder="Nombre del producto"
                        className="mt-1"
                        required
                    />
                </label>

                {/* Descripción */}
                <label className="block">
                    <span className="text-sm font-medium">Descripción</span>
                    <Textarea
                        name="description"
                        placeholder="Descripción del producto"
                        className="mt-1"
                    />
                </label>

                {/* Precio */}
                <label className="block">
                    <span className="text-sm font-medium">Precio</span>
                    <Input
                        type="number"
                        name="price"
                        placeholder="25.99"
                        step="0.01"
                        min="0"
                        className="mt-1"
                        required
                    />
                </label>

                {/* Tallas */}
                <label className="block">
                    <span className="text-sm font-medium">Tallas (coma separadas)</span>
                    <Input name="sizes" className="mt-1" />
                </label>

                {/* Colores */}
                <label className="block">
                    <span className="text-sm font-medium">Colores (coma separadas)</span>
                    <Input name="colors" className="mt-1" />
                </label>

                {/* Imagen */}
                <label className="block">
                    <span className="text-sm font-medium">Imagen del producto</span>
                    <Input
                        type="file"
                        onChange={(e) => {
                            setFile(e.target.files?.[0] ?? null);
                        }}
                        className="mt-1"
                    />
                </label>

                <Button type="submit" disabled={submitting}>
                    {submitting ? "Creando..." : "Crear producto"}
                </Button>
            </form>
            <DeleteProductForm />
        </>
    );
}
