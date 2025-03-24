import Hero from "@/components/Hero";
import { createClient } from "@/utils/supabase/server"; // Ajusta la ruta de tu supabase client en el servidor
import Link from "next/link";

export default async function Home() {
  // 1) Crear supabase en el servidor y obtener productos
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error.message);
  }

  // 2) Renderizar
  return (
    <>
      <Hero
      />
      <main className="flex-1 flex flex-col gap-6 px-4 py-6">
        {/* Título seccional */}
        <h2 className="text-2xl font-semibold mb-4">Lista de Productos</h2>

        {/* Grid de productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

          {(products ?? []).map((product) => (
            <Link
              href={`/producto/${product.id}`}
              key={product.id}
              className="bg-white rounded shadow p-4 flex flex-col"
            >
              {/* Imagen principal (si existe) */}
              {product.images && product.images.length > 0 && (
                // Si prefieres next/image, configura tu dominio en next.config.js
                <img
                  src={product.images[0]}
                  alt={product.title ?? "Imagen del producto"}
                  className="w-full h-48 object-cover rounded mb-3"
                />
              )}

              {/* Título */}
              <h3 className="text-lg font-bold mb-1">{product.title}</h3>

              {/* Descripción */}
              <p className="text-sm text-gray-600 mb-2">
                {product.description}
              </p>

              {/* Precio */}
              <span className="text-md font-semibold mb-2">
                ${product.price ?? 0}
              </span>

              {/* Tallas y colores */}
              <div className="text-sm text-gray-700 mt-auto">
                {product.sizes && product.sizes.length > 0 && (
                  <p>
                    <strong>Tallas:</strong> {product.sizes.join(", ")}
                  </p>
                )}
                {product.colors && product.colors.length > 0 && (
                  <p>
                    <strong>Colores:</strong> {product.colors.join(", ")}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
