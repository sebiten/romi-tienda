"use client";

import { useRef, useState, FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase/client";
import { convertImageToWebP } from "@/utils/convertToWebp";

const MAX_SIZE = 2 * 1024 * 1024;

export default function NewProductForm() {
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const supabase = createClient();
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    let fileName = "";
    let publicUrl = "";

    if (file) {
      if (!file.type.startsWith("image/")) {
        setFormError("El archivo debe ser una imagen válida.");
        setSubmitting(false);
        return;
      }

      if (file.size > MAX_SIZE) {
        setFormError("La imagen excede los 2MB permitidos.");
        setSubmitting(false);
        return;
      }

      try {
        const webpBlob = await convertImageToWebP(file);
        fileName = `${Date.now()}-${file.name.split(".")[0]}.webp`;
        const webpFile = new File([webpBlob], fileName, {
          type: "image/webp",
        });

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, webpFile);

        if (uploadError) {
          setFormError("Error subiendo la imagen: " + uploadError.message);
          setSubmitting(false);
          return;
        }

        const { data } = supabase.storage
          .from("product-images")
          .getPublicUrl(uploadData.path);

        publicUrl = data?.publicUrl ?? "";
      } catch (error) {
        setFormError("Hubo un problema al convertir la imagen.");
        console.error(error);
        setSubmitting(false);
        return;
      }
    }

    if (!formRef.current) {
      setSubmitting(false);
      return;
    }

    const formData = new FormData(formRef.current);

    const title = (formData.get("title") as string)?.trim() || "";
    const description = (formData.get("description") as string)?.trim() || "";
    const priceStr = (formData.get("price") as string) || "0";
    const sizesStr = (formData.get("sizes") as string) || "";
    const colorsStr = (formData.get("colors") as string) || "";
    const stockStr = (formData.get("stock") as string) || "0";
    const category_id = (formData.get("category_id") as string)?.trim() || "";

    if (title.length < 3) {
      setFormError("El título debe tener al menos 3 caracteres.");
      setSubmitting(false);
      return;
    }

    if (!categories.some((cat) => cat.id === category_id)) {
      setFormError("Debes seleccionar una categoría válida.");
      setSubmitting(false);
      return;
    }

    const price = parseFloat(priceStr);
    if (isNaN(price) || price < 0) {
      setFormError("El precio debe ser un número mayor o igual a 0.");
      setSubmitting(false);
      return;
    }

    const sizes = sizesStr
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "");
    if (sizes.length > 5) {
      setFormError("Solo se permiten hasta 5 tallas.");
      setSubmitting(false);
      return;
    }

    const colors = colorsStr
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c !== "");
    if (colors.length > 5) {
      setFormError("Solo se permiten hasta 5 colores.");
      setSubmitting(false);
      return;
    }

    const stock = parseInt(stockStr);
    if (isNaN(stock) || stock < 0) {
      setFormError("El stock debe ser un número entero mayor o igual a 0.");
      setSubmitting(false);
      return;
    }

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
          stock,
          category_id,
        },
      ])
      .select();

    if (insertError) {
      console.error("ERROR al insertar producto:", insertError);
      setFormError("Error al insertar producto: " + insertError.message);

      if (fileName) {
        await supabase.storage.from("product-images").remove([fileName]);
      }

      setSubmitting(false);
      return;
    }

    setFormError(null);
    alert("¡Producto creado con éxito!");
    formRef.current.reset();
    setFile(null);
    setSubmitting(false);
  }

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name");
      if (error) {
        console.error("Error fetching categories:", error);
      } else {
        setCategories(data || []);
      }
    }
    fetchCategories();
  }, []);

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 max-w-lg mx-auto"
    >
      {formError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
          {formError}
        </div>
      )}

      <label className="block">
        <span className="text-sm font-medium">Título</span>
        <Input
          name="title"
          placeholder="Nombre del producto"
          className="mt-1"
          required
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Descripción</span>
        <Textarea
          name="description"
          placeholder="Descripción del producto"
          className="mt-1"
        />
      </label>

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

      <label className="block">
        <span className="text-sm font-medium">Tallas (coma separadas)</span>
        <Input name="sizes" className="mt-1" />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Colores (coma separadas)</span>
        <Input name="colors" className="mt-1" />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Stock</span>
        <Input
          type="number"
          name="stock"
          placeholder="Cantidad disponible"
          min="0"
          className="mt-1"
          required
        />
      </label>

      <label className="block">
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

      <label className="block">
        <span className="text-sm font-medium">Imagen del producto</span>
        <Input
          type="file"
          accept="image/*"
          required
          onChange={(e) => {
            const selectedFile = e.target.files?.[0] ?? null;
            setFile(selectedFile);

            if (selectedFile) {
              const url = URL.createObjectURL(selectedFile);
              setPreviewUrl(url);
            } else {
              setPreviewUrl(null);
            }
          }}
          className="mt-1"
        />
      </label>
      {previewUrl && (
        <div className="mt-4">
          <p className="text-sm mb-1">Vista previa:</p>
          <img
            src={previewUrl}
            alt="Vista previa"
            className="max-h-64 rounded border shadow"
          />
        </div>
      )}
      <Button type="submit" disabled={submitting}>
        {submitting ? "Creando..." : "Crear producto"}
      </Button>
    </form>
  );
}
