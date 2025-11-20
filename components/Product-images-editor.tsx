"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
import { convertImageToWebP } from "@/utils/convertToWebp";
import { X } from "lucide-react";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_FILES = 5;

export default function ProductImagesEditor({ product }: { product: any }) {
    const supabase = createClient();

    const [images, setImages] = useState<string[]>(product.images || []);
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const canAddMore = images.length < MAX_FILES;

    // 🔥 Eliminar imagen existente
    const handleDeleteImage = async (url: string) => {
        if (!confirm("¿Eliminar esta imagen?")) return;

        setLoading(true);
        setFormError(null);
        setSuccess(null);

        try {
            // Obtener path en el bucket
            const parts = url.split("/product-images/");
            const path = parts[1];
            if (!path) {
                console.error("No se pudo obtener el path del archivo");
            } else {
                const { error: storageError } = await supabase.storage
                    .from("product-images")
                    .remove([path]);

                if (storageError) {
                    console.error("Error borrando de storage:", storageError.message);
                    setFormError("No se pudo eliminar la imagen del almacenamiento.");
                    setLoading(false);
                    return;
                }
            }

            // Actualizar array en la DB
            const newImages = images.filter((img) => img !== url);
            const { error: updateError } = await supabase
                .from("products")
                .update({ images: newImages })
                .eq("id", product.id);

            if (updateError) {
                console.error("Error actualizando producto:", updateError.message);
                setFormError("Error actualizando el producto en la base de datos.");
                setLoading(false);
                return;
            }

            setImages(newImages);
            setSuccess("Imagen eliminada correctamente.");
        } catch (err) {
            console.error(err);
            setFormError("Ocurrió un error al eliminar la imagen.");
        } finally {
            setLoading(false);
        }
    };

    // 🔥 Subir nuevas imágenes
    const handleAddImages = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = Array.from(e.target.files ?? []);
        e.target.value = "";

        if (files.length === 0) return;

        if (images.length + files.length > MAX_FILES) {
            setFormError(
                `Solo puedes tener hasta ${MAX_FILES} imágenes. Actualmente tienes ${images.length}.`
            );
            return;
        }

        setLoading(true);
        setFormError(null);
        setSuccess(null);

        const newUrls: string[] = [];

        try {
            for (const file of files) {
                if (!file.type.startsWith("image/")) {
                    setFormError("Solo se permiten archivos de imagen.");
                    setLoading(false);
                    return;
                }

                if (file.size > MAX_SIZE) {
                    setFormError(
                        `La imagen "${file.name}" excede los ${MAX_SIZE / (1024 * 1024)}MB permitidos.`
                    );
                    setLoading(false);
                    return;
                }

                const webpBlob = await convertImageToWebP(file);
                const fileName = `${Date.now()}-${file.name.split(".")[0]}.webp`;
                const webpFile = new File([webpBlob], fileName, {
                    type: "image/webp",
                });

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from("product-images")
                    .upload(fileName, webpFile);

                if (uploadError) {
                    console.error("Error subiendo imagen:", uploadError.message);
                    setFormError("Error subiendo una de las imágenes.");
                    setLoading(false);
                    return;
                }

                const { data } = supabase.storage
                    .from("product-images")
                    .getPublicUrl(uploadData.path);

                if (data?.publicUrl) {
                    newUrls.push(data.publicUrl);
                }
            }

            const finalImages = [...images, ...newUrls];

            const { error: updateError } = await supabase
                .from("products")
                .update({ images: finalImages })
                .eq("id", product.id);

            if (updateError) {
                console.error("Error actualizando producto:", updateError.message);
                setFormError("Error actualizando el producto con las nuevas imágenes.");
                setLoading(false);
                return;
            }

            setImages(finalImages);
            setSuccess("Imágenes agregadas correctamente.");
        } catch (err) {
            console.error(err);
            setFormError("Ocurrió un error al agregar las imágenes.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {formError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
                    {formError}
                </div>
            )}
            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
                    {success}
                </div>
            )}

            <p className="text-sm text-muted-foreground">
                Máximo {MAX_FILES} imágenes. Actualmente: {images.length}
            </p>

            {/* Lista de imágenes actuales */}
            {images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {images.map((url) => (
                        <div key={url} className="relative">
                            <img
                                src={url}
                                alt="Imagen del producto"
                                className="w-full h-32 object-cover rounded border shadow"
                            />
                            <button
                                type="button"
                                disabled={loading}
                                onClick={() => handleDeleteImage(url)}
                                className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/80 text-xs"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">
                    Este producto no tiene imágenes aún.
                </p>
            )}

            {/* Input para nuevas imágenes */}
            <div className="space-y-2">
                <label className="text-sm font-medium">
                    Agregar nuevas imágenes
                    <span className="block text-xs text-muted-foreground">
                        (se convierten a WebP automáticamente)
                    </span>
                </label>
                <Input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={loading || !canAddMore}
                    onChange={handleAddImages}
                />
                {!canAddMore && (
                    <p className="text-xs text-red-600">
                        Ya tienes el máximo de imágenes permitidas.
                    </p>
                )}
            </div>

            <div className="pt-4">
                <Button
                    type="button"
                    variant="outline"
                    disabled={loading}
                    onClick={() => window.history.back()}
                >
                    Volver
                </Button>
            </div>
        </div>
    );
}
