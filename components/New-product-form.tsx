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

const MAX_SIZE = 2 * 1024 * 1024;
const MAX_FILES = 5;

type ProductVariant = {
  color: string;
  size: string;
  stock: number;
};

export default function NewProductForm() {
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  // 🔹 productType (ropa/calzado)
  const [productType, setProductType] = useState<"ropa" | "calzado">("ropa");

  // 🔹 variantes
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantColor, setVariantColor] = useState("");
  const [variantSize, setVariantSize] = useState("");
  const [variantStock, setVariantStock] = useState("");

  const AVAILABLE_SIZES =
    productType === "ropa"
      ? ["XS", "S", "M", "L", "XL", "XXL"]
      : ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45"];

  const supabase = createClient();
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const handleAddVariant = () => {
    if (!variantColor.trim() || !variantSize || !variantStock) {
      setFormError("Completa color, talle y stock antes de agregar.");
      return;
    }

    setVariants((prev) => [
      ...prev,
      {
        color: variantColor.trim(),
        size: variantSize,
        stock: Number(variantStock),
      },
    ]);

    setVariantColor("");
    setVariantSize("");
    setVariantStock("");
    setFormError(null);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    if (variants.length === 0) {
      setFormError("Debes agregar al menos una variante (color+talle+stock).");
      setSubmitting(false);
      return;
    }

    // 🔹 Derivar stock total
    const stock = variants.reduce((acc, v) => acc + v.stock, 0);
    const sizes = Array.from(new Set(variants.map((v) => v.size)));
    const colors = Array.from(new Set(variants.map((v) => v.color)));

    const publicUrls: string[] = [];
    const uploadedFileNames: string[] = [];

    // SUBIR IMÁGENES
    try {
      for (const file of files) {
        if (file.size > MAX_SIZE) {
          setFormError(`La imagen "${file.name}" excede los 2MB.`);
          setSubmitting(false);
          return;
        }

        const webpBlob = await convertImageToWebP(file);
        const fileName = `${Date.now()}-${file.name.split(".")[0]}.webp`;
        const webpFile = new File([webpBlob], fileName, { type: "image/webp" });

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, webpFile);

        if (uploadError) {
          setFormError(uploadError.message);
          setSubmitting(false);
          return;
        }

        const { data } = supabase.storage.from("product-images").getPublicUrl(uploadData.path);
        publicUrls.push(data.publicUrl);
        uploadedFileNames.push(fileName);
      }
    } catch (err) {
      console.error(err);
      setFormError("Error subiendo imágenes.");
      setSubmitting(false);
      return;
    }

    if (!formRef.current) return;
    const formData = new FormData(formRef.current);

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = Number(formData.get("price"));
    const category_id = formData.get("category_id") as string;

    if (!title || title.length < 3) {
      setFormError("El título debe tener al menos 3 caracteres.");
      setSubmitting(false);
      return;
    }

    // INSERT SUPABASE
    const { error: insertError } = await supabase.from("products").insert([
      {
        title,
        description,
        price,
        images: publicUrls,
        productType, // 👈 NUEVO
        variants, // 👈 NUEVO
        stock,
        sizes,
        colors,
        category_id,
      },
    ]);

    if (insertError) {
      console.error(insertError);

      await supabase.storage.from("product-images").remove(uploadedFileNames);

      setFormError("Error creando producto.");
      setSubmitting(false);
      return;
    }

    toast({
      title: "Producto creado",
      description: `El producto "${title}" fue creado correctamente.`,
    });

    setSubmitting(false);
    formRef.current.reset();
    setVariants([]);
    setFiles([]);
    setPreviewUrls([]);
  };

  // Cargar categorías
  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .then(({ data }) => data && setCategories(data));
  }, []);

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg mx-auto">

      {/* TÍTULO */}
      <label>
        <span className="text-sm font-medium">Título</span>
        <Input name="title" required className="mt-1" />
      </label>

      {/* DESCRIPCIÓN */}
      <label>
        <span className="text-sm font-medium">Descripción</span>
        <Textarea name="description" className="mt-1" />
      </label>

      {/* PRECIO */}
      <label>
        <span className="text-sm font-medium">Precio</span>
        <Input type="number" name="price" step="0.01" min="0" required className="mt-1" />
      </label>

      {/* 🔹 Tipo de producto */}
      <label>
        <span className="text-sm font-medium">Tipo de producto</span>
        <select
          className="mt-1 w-full border rounded px-3 py-2"
          value={productType}
          onChange={(e) => setProductType(e.target.value as "ropa" | "calzado")}
        >
          <option value="ropa">Ropa</option>
          <option value="calzado">Calzado</option>
        </select>
      </label>

      {/* 🔹 Variantes */}
      <div className="border rounded p-3 space-y-2">
        <p className="text-sm font-medium">Variantes (color, talle, stock)</p>

        <div className="grid grid-cols-3 gap-2">
          <Input
            placeholder="Color"
            value={variantColor}
            onChange={(e) => setVariantColor(e.target.value)}
          />

          <select
            className="border rounded px-2 py-1"
            value={variantSize}
            onChange={(e) => setVariantSize(e.target.value)}
          >
            <option value="">Talle</option>
            {AVAILABLE_SIZES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <Input
            type="number"
            placeholder="Stock"
            value={variantStock}
            onChange={(e) => setVariantStock(e.target.value)}
          />
        </div>

        <Button type="button" variant="outline" onClick={handleAddVariant}>
          Agregar variante
        </Button>


        {variants.length > 0 && (
          <ul className="mt-2 space-y-1 text-sm">
            {variants.map((v, i) => (
              <li key={i} className="flex justify-between">
                <span>
                  {v.color} — {v.size} ({v.stock})
                </span>
                <button
                  type="button"
                  className="text-red-500 text-xs"
                  onClick={() => handleRemoveVariant(i)}
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* CATEGORÍA */}
      <label>
        <span className="text-sm font-medium">Categoría</span>
        <select name="category_id" required className="mt-1 w-full border rounded px-3 py-2">
          <option value="">Selecciona una categoría</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </label>
      {formError && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      {/* IMÁGENES */}
      <label>
        <span className="text-sm font-medium">Imágenes (máx {MAX_FILES})</span>
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
              setFormError(`Máximo ${MAX_FILES} imágenes.`);
              return;
            }

            setFiles(updated);
            const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
            setPreviewUrls((prev) => [...prev, ...newPreviews]);
          }}
        />
      </label>

      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mt-2">
          {previewUrls.map((url, idx) => (
            <div key={idx} className="relative">
              <img src={url} className="w-full h-40 object-cover rounded border" />

              <button
                type="button"
                onClick={() => {
                  setFiles((prev) => prev.filter((_, i) => i !== idx));
                  setPreviewUrls((prev) => prev.filter((_, i) => i !== idx));
                }}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Button type="submit" disabled={submitting}>
        {submitting ? <Loader2 className="animate-spin" /> : "Crear producto"}
      </Button>
    </form>
  );
}
