"use client";

import { useRef, useState, FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase/client";
import { convertImageToWebP } from "@/utils/convertToWebp";
import { X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";


const MAX_SIZE = 2 * 1024 * 1024; // 2MB por imagen
const MAX_FILES = 5;

export default function NewProductForm() {
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const supabase = createClient();
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  // 🔥 eliminar imagen individual
  const handleRemoveImage = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));

    setPreviewUrls((prev) => {
      const clone = [...prev];
      const [removedUrl] = clone.splice(index, 1);
      if (removedUrl) URL.revokeObjectURL(removedUrl);
      return clone;
    });
  };

  // ==== SUBMIT ====
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    const publicUrls: string[] = [];
    const uploadedFileNames: string[] = [];

    // ==== SUBIR IMÁGENES ====
    try {
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          const msg = "Todos los archivos deben ser imágenes válidas.";
          setFormError(msg);
          toast({
            variant: "destructive",
            title: "Error al subir imágenes",
            description: msg,
          });
          setSubmitting(false);
          return;
        }

        if (file.size > MAX_SIZE) {
          const msg = `La imagen "${file.name}" excede los 2MB permitidos.`;
          setFormError(msg);
          toast({
            variant: "destructive",
            title: "Imagen demasiado pesada",
            description: msg,
          });
          setSubmitting(false);
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
          const msg = `Error subiendo la imagen "${file.name}": ${uploadError.message}`;
          setFormError(msg);
          toast({
            variant: "destructive",
            title: "Error al subir imagen",
            description: msg,
          });
          setSubmitting(false);
          return;
        }

        const { data } = supabase.storage
          .from("product-images")
          .getPublicUrl(uploadData.path);

        if (data?.publicUrl) {
          publicUrls.push(data.publicUrl);
          uploadedFileNames.push(fileName);
        }
      }
    } catch (err) {
      console.error(err);
      const msg = "Hubo un error subiendo las imágenes.";
      setFormError(msg);
      toast({
        variant: "destructive",
        title: "Error inesperado",
        description: msg,
      });
      setSubmitting(false);
      return;
    }

    // ==== CAMPOS DEL FORM ====
    if (!formRef.current) {
      setSubmitting(false);
      return;
    }

    const formData = new FormData(formRef.current);

    const title = (formData.get("title") as string)?.trim() || "";
    const description = (formData.get("description") as string)?.trim() || "";
    const price = parseFloat(formData.get("price") as string);
    const sizes = (formData.get("sizes") as string)
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    const colors = (formData.get("colors") as string)
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    const stock = parseInt(formData.get("stock") as string);
    const category_id = formData.get("category_id") as string;

    if (title.length < 3) {
      const msg = "El título debe tener al menos 3 caracteres.";
      setFormError(msg);
      toast({
        variant: "destructive",
        title: "Título inválido",
        description: msg,
      });
      setSubmitting(false);
      return;
    }

    if (!categories.some((c) => c.id === category_id)) {
      const msg = "Debes seleccionar una categoría válida.";
      setFormError(msg);
      toast({
        variant: "destructive",
        title: "Categoría inválida",
        description: msg,
      });
      setSubmitting(false);
      return;
    }

    if (isNaN(price) || price < 0) {
      const msg = "El precio debe ser un número válido.";
      setFormError(msg);
      toast({
        variant: "destructive",
        title: "Precio inválido",
        description: msg,
      });
      setSubmitting(false);
      return;
    }

    if (isNaN(stock) || stock < 0) {
      const msg = "El stock debe ser un número válido.";
      setFormError(msg);
      toast({
        variant: "destructive",
        title: "Stock inválido",
        description: msg,
      });
      setSubmitting(false);
      return;
    }

    // ==== INSERT EN SUPABASE ====
    const { error: insertError } = await supabase.from("products").insert([
      {
        title,
        description,
        price,
        sizes,
        colors,
        images: publicUrls,
        stock,
        category_id,
      },
    ]);

    if (insertError) {
      console.error(insertError);
      const msg = "Error insertando producto: " + insertError.message;
      setFormError(msg);

      // rollback de imágenes subidas
      if (uploadedFileNames.length > 0) {
        await supabase.storage
          .from("product-images")
          .remove(uploadedFileNames);
      }

      toast({
        variant: "destructive",
        title: "Error al crear el producto",
        description: msg,
      });

      setSubmitting(false);
      return;
    }

    // ✅ ÉXITO: mensaje claro de lo que se creó
    toast({
      title: "Producto creado con éxito",
      description: `Se creó el producto "${title}" correctamente.`,
    });

    formRef.current.reset();
    setFiles([]);
    setPreviewUrls([]);
    setSubmitting(false);
  }

  // ==== CARGAR CATEGORÍAS ====
  useEffect(() => {
    supabase
      .from("categories")
      .select("id, name")
      .then(({ data, error }) => {
        if (!error && data) setCategories(data);
      });
  }, []);

  // cleanup al desmontar
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 max-w-lg mx-auto"
    >
      {formError && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      {/* Título */}
      <label>
        <span className="text-sm font-medium">Título</span>
        <Input name="title" required className="mt-1" />
      </label>

      {/* Descripción */}
      <label>
        <span className="text-sm font-medium">Descripción</span>
        <Textarea name="description" className="mt-1" />
      </label>

      {/* Precio */}
      <label>
        <span className="text-sm font-medium">Precio</span>
        <Input
          type="number"
          name="price"
          step="0.01"
          min="0"
          required
          className="mt-1"
        />
      </label>

      {/* Tallas */}
      <label>
        <span className="text-sm font-medium">Tallas (coma separadas)</span>
        <Input name="sizes" className="mt-1" />
      </label>

      {/* Colores */}
      <label>
        <span className="text-sm font-medium">Colores (coma separadas)</span>
        <Input name="colors" className="mt-1" />
      </label>

      {/* Stock */}
      <label>
        <span className="text-sm font-medium">Stock</span>
        <Input
          type="number"
          name="stock"
          min="0"
          required
          className="mt-1"
        />
      </label>

      {/* Categoría */}
      <label>
        <span className="text-sm font-medium">Categoría</span>
        <select
          name="category_id"
          required
          className="mt-1 w-full border rounded px-3 py-2"
        >
          <option value="">Selecciona una categoría</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </label>

      {/* Upload múltiple */}
      <label>
        <span className="text-sm font-medium">
          Imágenes del producto (máx {MAX_FILES})
        </span>
        <Input
          type="file"
          accept="image/*"
          multiple
          required={files.length === 0}
          className="mt-1"
          onChange={(e) => {
            const newFiles = Array.from(e.target.files ?? []);
            const updated = [...files, ...newFiles];

            if (updated.length > MAX_FILES) {
              const msg = `Máximo ${MAX_FILES} imágenes.`;
              setFormError(msg);
              toast({
                variant: "destructive",
                title: "Límite de imágenes",
                description: msg,
              });
              return;
            }

            setFiles(updated);

            const newPreviews = newFiles.map((file) =>
              URL.createObjectURL(file)
            );
            setPreviewUrls((prev) => [...prev, ...newPreviews]);

            e.target.value = "";
          }}
        />
      </label>

      {/* PREVIEWS + BOTÓN X */}
      {previewUrls.length > 0 && (
        <div className="mt-4">
          <p className="text-sm mb-2">Vistas previas:</p>
          <div className="grid grid-cols-2 gap-3">
            {previewUrls.map((url, idx) => (
              <div key={idx} className="relative">
                <img
                  src={url}
                  className="max-h-40 w-full object-cover rounded border shadow"
                />

                {/* Botón borrar */}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/80"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button type="submit" disabled={submitting} className="mt-2">
        {submitting && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        {submitting ? "Creando producto..." : "Crear producto"}
      </Button>
    </form>
  );
}
