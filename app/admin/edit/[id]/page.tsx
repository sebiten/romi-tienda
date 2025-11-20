import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { updateProductAction } from "../../actions";

export default async function EditProductPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { params, searchParams } = props;

  const { id } = await params;
  const search = await searchParams;

  const supabase = await createClient();

  const showSuccess = search?.success === "1";

  if (!id || id.length !== 36) notFound();

  // Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  // Admin
  const { data: profileData } = await supabase
    .from("profiles")
    .select("isadmin")
    .eq("id", user.id)
    .single();
  if (!profileData?.isadmin) redirect("/");

  // Product
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();
  if (!product) notFound();

  // Categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  return (
    <main className="p-2 max-w-3xl mx-auto">

      <h1 className="text-4xl font-bold mb-2 text-center tracking-tight">
        Editar Producto
      </h1>

      {/* 🎉 Banner de éxito */}


      <div className="bg-white border rounded-xl shadow p-8 space-y-6">
        <form action={updateProductAction} className="space-y-6">
          <input type="hidden" name="id" value={product.id} />

          {/* Título */}
          <div>
            <label className="text-sm font-semibold block mb-1">Título</label>
            <input
              type="text"
              name="title"
              defaultValue={product.title}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="text-sm font-semibold block mb-1">Descripción</label>
            <textarea
              name="description"
              defaultValue={product.description ?? ""}
              className="w-full border rounded-lg p-3 min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Precio + Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold block mb-1">Precio</label>
              <input
                type="number"
                name="price"
                step="0.01"
                defaultValue={product.price}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold block mb-1">Stock</label>
              <input
                type="number"
                name="stock"
                defaultValue={product.stock}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Tallas */}
          <div>
            <label className="text-sm font-semibold block mb-1">
              Tallas (separadas por comas)
            </label>
            <input
              type="text"
              name="sizes"
              defaultValue={product.sizes?.join(", ") || ""}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Colores */}
          {/* Colores */}
          <div>
            <label className="text-sm font-semibold block mb-1">
              Colores (separados por comas)
            </label>
            <input
              type="text"
              name="colors"
              defaultValue={
                Array.isArray(product.colors)
                  ? product.colors.join(", ")
                  : typeof product.colors === "string"
                    ? product.colors
                    : ""
              }
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>


          {/* Categoría */}
          <div>
            <label className="text-sm font-semibold block mb-1">Categoría</label>
            <select
              name="category_id"
              className="w-full border rounded-lg p-3 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              defaultValue={product.category_id || ""}
            >
              <option value="">Selecciona una categoría</option>
              {categories?.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          {showSuccess && (
            <div className="mb-6 p-4 rounded-lg border border-green-300 bg-green-100 text-green-800 text-sm">
              <strong>¡Producto actualizado!</strong> Los cambios se guardaron correctamente.

              {/* 🔙 Botón volver */}
              <div className="mt-3">
                <a
                  href="/admin/edit"
                  className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition"
                >
                  ← Volver al panel
                </a>
              </div>
            </div>
          )}
          {/* Botón */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold text-center hover:bg-blue-700 transition-colors"
          >
            Guardar Cambios
          </button>
        </form>
      </div>
    </main>
  );
}
