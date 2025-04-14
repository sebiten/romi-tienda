import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Product } from "@/lib/types";
import { updateProductAction } from "../../actions";

interface EditProductPageProps {
  params: { id: string };
}

export default async function EditProductPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const supabase = await createClient();
  const { id } = params;
  if (!id || id.length !== 36) {
    console.error("ID de producto inválido:", id);
    notFound();
  }

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  // Verificar permisos de admin
  const { data: profileData } = await supabase
    .from("profiles")
    .select("isadmin")
    .eq("id", user.id)
    .single();
  if (!profileData || !profileData.isadmin) redirect("/");

  // Obtener el producto a editar
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !product) {
    console.error("Error al cargar el producto:", error?.message);
    notFound();
  }

  // Obtener las categorías disponibles
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });
  if (categoriesError || !categories) {
    console.error("Error al cargar las categorías:", categoriesError?.message);
    // Opcionalmente, podrías mostrar un mensaje de error o manejarlo de otra forma.
  }

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Editar Producto</h1>
      <form action={updateProductAction} className="flex flex-col gap-4">
        <input type="hidden" name="id" value={product.id} />

        <label className="font-semibold">
          Título:
          <input
            type="text"
            name="title"
            defaultValue={product.title}
            className="border p-2 w-full"
          />
        </label>

        <label className="font-semibold">
          Precio:
          <input
            type="number"
            name="price"
            step="0.01"
            defaultValue={product.price}
            className="border p-2 w-full"
          />
        </label>

        <label className="font-semibold">
          Stock:
          <input
            type="number"
            name="stock"
            defaultValue={product.stock}
            className="border p-2 w-full"
          />
        </label>

        <label className="font-semibold">
          Tallas (separadas por comas):
          <input
            type="text"
            name="sizes"
            defaultValue={product.sizes?.join(", ") || ""}
            className="border p-2 w-full"
          />
        </label>

        <label className="font-semibold">
          Categoría:
          <select
            name="category_id"
            className="border p-2 w-full"
            defaultValue={product.category_id || ""}
          >
            <option value="">Selecciona una categoría</option>
            {categories &&
              categories.map((category: any) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
          </select>
        </label>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
        >
          Actualizar Producto
        </button>
      </form>
    </main>
  );
}
