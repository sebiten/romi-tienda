import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import EditProductForm from "./EditProductForm";

// 🔥 Deben ser async ahora (por el Dynamic API)
export default async function EditProductPage(props: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ success?: string }>
}) {
  // 🔥 OBLIGATORIO: await params y await searchParams
  const { id } = await props.params;
  const searchParams = await props.searchParams;

  const supabase = await createClient();

  if (!id || id.length !== 36) notFound();

  // Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Admin check
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

  const showSuccess = searchParams?.success === "1";

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-center">Editar Producto</h1>

      {showSuccess && (
        <div className="mb-6 p-4 rounded-lg border border-green-300 bg-green-100 text-green-800 text-sm">
          <strong>¡Producto actualizado!</strong> Los cambios se guardaron correctamente.
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

      <EditProductForm product={product} categories={categories} />
    </main>
  );
}
