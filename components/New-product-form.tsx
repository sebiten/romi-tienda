"use client";

import {
  useRef,
  useState,
  FormEvent,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase/client";
import { convertImageToWebP } from "@/utils/convertToWebp";
import { X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

const MAX_SIZE = 3 * 1024 * 1024;
const MAX_FILES = 5;

type ProductVariant = {
  color: string;
  size: string;
  stock: number;
};

// 🔹 NORMALIZAR SIEMPRE (frontend)
const normalize = (str: string) =>
  str
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

export default function NewProductForm() {
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );

  const [productType, setProductType] = useState<"ropa" | "calzado">("ropa");

  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantColor, setVariantColor] = useState("");
  const [variantSize, setVariantSize] = useState("");
  const [variantStock, setVariantStock] = useState("");

  const supabase = createClient();
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  // 🔹 Memo para evitar recrear arrays en cada render
  const AVAILABLE_SIZES = useMemo(
    () =>
      productType === "ropa"
        ? ["XS", "S", "M", "L", "XL", "XXL"]
        : ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
    [productType]
  );

  const handleAddVariant = useCallback(() => {
    if (!variantColor.trim() || !variantSize || !variantStock) {
      setFormError("Completa color, talle y stock antes de agregar.");
      return;
    }

    setVariants((prev) => [
      ...prev,
      {
        color: normalize(variantColor), // NORMALIZADO
        size: variantSize,
        stock: Number(variantStock),
      },
    ]);

    setVariantColor("");
    setVariantSize("");
    setVariantStock("");
    setFormError(null);
  }, [variantColor, variantSize, variantStock]);

  const handleRemoveVariant = useCallback((index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));

    // Liberar memoria del preview
    setPreviewUrls((prev) => {
      const urlToRevoke = prev[index];
      if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
      return prev.filter((_, i) => i !== index);
    });

    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      setFormError(null);

      if (variants.length === 0) {
        setFormError("Debes agregar al menos una variante.");
        setSubmitting(false);
        return;
      }

      const stock = variants.reduce((acc, v) => acc + v.stock, 0);
      const sizes = Array.from(new Set(variants.map((v) => v.size)));
      const colors = Array.from(new Set(variants.map((v) => v.color)));

      let publicUrls: string[] = [];
      let uploadedFileNames: string[] = [];

      // SUBIR IMÁGENES EN PARALELO
      try {
        const uploadResults = await Promise.all(
          files.map(async (file) => {
            if (file.size > MAX_SIZE) {
              throw new Error(
                `La imagen "${file.name}" excede los 2MB.`
              );
            }

            const webpBlob = await convertImageToWebP(file);
            const fileName = `${Date.now()}-${file.name.split(".")[0]
              }.webp`;
            const webpFile = new File([webpBlob], fileName, {
              type: "image/webp",
            });

            const { data: uploadData, error: uploadError } =
              await supabase.storage
                .from("product-images")
                .upload(fileName, webpFile);

            if (uploadError || !uploadData) {
              throw new Error(uploadError?.message || "Error subiendo imagen");
            }

            const { data } = supabase.storage
              .from("product-images")
              .getPublicUrl(uploadData.path);

            return {
              publicUrl: data.publicUrl,
              fileName,
            };
          })
        );

        publicUrls = uploadResults.map((r) => r.publicUrl);
        uploadedFileNames = uploadResults.map((r) => r.fileName);
      } catch (err: any) {
        console.error(err);
        setFormError(err?.message || "Error subiendo imágenes.");
        setSubmitting(false);
        return;
      }

      if (!formRef.current) {
        setSubmitting(false);
        return;
      }

      const formData = new FormData(formRef.current);

      const rawTitle = formData.get("title") as string;
      const rawDescription = (formData.get("description") as string) || "";

      const title = normalize(rawTitle);
      const description = normalize(rawDescription);

      const price = Number(formData.get("price"));
      const category_id = formData.get("category_id") as string;

      const normalizedVariants = variants.map((v) => ({
        ...v,
        color: normalize(v.color),
      }));

      const res = await fetch("/api/products/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price,
          images: publicUrls,
          productType,
          variants: normalizedVariants,
          stock,
          sizes,
          colors,
          category_id,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        await supabase.storage
          .from("product-images")
          .remove(uploadedFileNames);
        setFormError(result.error || "Error creando producto.");
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
      // Revocar todos los objectURLs
      setPreviewUrls((prev) => {
        prev.forEach((url) => URL.revokeObjectURL(url));
        return [];
      });
    },
    [variants, files, supabase, toast]
  );

  // Cargar categorías (si quisieras optimizar más, esto podría venir del server)
  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .then(({ data, error }) => {
        if (!error && data) setCategories(data);
      });
  }, [supabase]);

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 max-w-lg mx-auto"
    >
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
        <Input
          type="number"
          name="price"
          step="0.01"
          min="0"
          required
          className="mt-1"
        />
      </label>

      {/* TIPO PRODUCTO */}
      <label>
        <span className="text-sm font-medium">Tipo de producto</span>
        <select
          className="mt-1 w-full border rounded px-3 py-2"
          value={productType}
          onChange={(e) =>
            setProductType(e.target.value as "ropa" | "calzado")
          }
        >
          <option value="ropa">Ropa</option>
          <option value="calzado">Calzado</option>
        </select>
      </label>

      {/* VARIANTES */}
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

      {formError && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      {/* IMÁGENES */}
      <label>
        <span className="text-sm font-medium">
          Imágenes (máx {MAX_FILES})
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
              setFormError(`Máximo ${MAX_FILES} imágenes.`);
              return;
            }

            setFiles(updated);
            const newPreviews = newFiles.map((file) =>
              URL.createObjectURL(file)
            );
            setPreviewUrls((prev) => [...prev, ...newPreviews]);
          }}
        />
      </label>

      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mt-2">
          {previewUrls.map((url, idx) => (
            <div key={idx} className="relative">
              <img
                src={url}
                className="w-full h-40 object-cover rounded border"
              />

              <button
                type="button"
                onClick={() => handleRemoveVariant(idx)}
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
