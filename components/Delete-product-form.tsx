"use client";

import React, { useState, useEffect, FormEvent, JSX } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface Product {
  id: string;
  title?: string | null;
  description?: string | null;
  price?: number | null;
  images?: string[] | null;
  colors?: string[] | null;
  sizes?: string[] | null;
  created_at?: string | null;
}

export default function DeleteProductForm(): JSX.Element {
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  // 1. Cargar productos (id, title, images, etc.)
  async function fetchProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("id, title, images, colors, sizes")
      .order("title", { ascending: true });

    if (error) {
      console.error("Error fetching products:", error);
      return;
    }
    if (data) {
      setProducts(data);
    }
  }

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Manejo de borrado
  async function handleDelete(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("Deleting...");

    if (!productId) {
      setStatus("Please provide a product ID");
      return;
    }

    // Se utiliza .select("*") para obtener la representación del producto borrado y así tener acceso a las rutas de imagen.
    const { data, error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId)
      .select("*");

    if (error) {
      console.error("Error deleting product:", error);
      setStatus(`Error: ${error.message}`);
    } else {
      if (data && data.length > 0) {
        const deletedProduct: Product = data[0];
        setStatus(`Product ${productId} deleted successfully!`);

        // Borrar imágenes del Storage.
        if (deletedProduct.images && deletedProduct.images.length > 0) {
          for (const filePath of deletedProduct.images) {
            // Reemplaza "your-bucket-name" por el nombre real de tu bucket.
            const { error: storageError } = await supabase.storage
              .from("product-images")
              .remove([filePath]);

            if (storageError) {
              console.error(`Error deleting image ${filePath}:`, storageError);
            }
          }
        }
      } else {
        setStatus(`No product found with ID: ${productId}`);
      }
      // Refrescamos la lista de productos
      await fetchProducts();
    }

    setProductId("");
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Formulario para eliminar producto por ID */}
      <form onSubmit={handleDelete} className="flex flex-col gap-2 max-w-md">
        <label className="block">
          <span className="text-sm font-medium">Product ID</span>
          <Input
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
            className="mt-1"
          />
        </label>

        <Button type="submit">Delete Product</Button>
        {status && <p className="text-sm mt-2">{status}</p>}
      </form>

      {/* Listado de productos con IDs, títulos e imagen principal */}
      <div>
        <h2 className="text-lg font-medium mb-2">Product List</h2>
        <ul className="list-disc list-inside space-y-3">
          {products.map((p) => (
            <li key={p.id} className="flex flex-col">
              {p.images && p.images.length > 0 && (
                <img
                  src={p.images[0]}
                  alt={p.title ?? "Product Image"}
                  className="w-20 h-auto mb-1"
                />
              )}
              <span className="font-semibold">{p.title}</span>
              <span className="text-sm text-gray-600 break-all">{p.id}</span>

              {p.colors && p.colors.length > 0 && (
                <span className="text-sm">
                  <strong>Colors:</strong> {p.colors.join(", ")}
                </span>
              )}
              {p.sizes && p.sizes.length > 0 && (
                <span className="text-sm">
                  <strong>Sizes:</strong> {p.sizes.join(", ")}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
