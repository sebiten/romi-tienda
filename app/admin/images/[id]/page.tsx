import ProductImagesEditor from "@/components/Product-images-editor";
import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";

interface ImagesPageProps {
    params: { id: string }; // 👈 ya no es Promise
}

export default async function ProductImagesPage({ params }: ImagesPageProps) {
    const { id } = params; // 👈 sin await
    const supabase = await createClient();

    // Auth
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/sign-in");

    // Admin
    const { data: profileData, error: adminError } = await supabase
        .from("profiles")
        .select("isadmin")
        .eq("id", user.id)
        .single();

    if (adminError || !profileData || !profileData.isadmin) {
        redirect("/");
    }

    // Producto
    const { data: product, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !product) {
        console.error("Error cargando producto:", error?.message);
        notFound();
    }

    return (
        <main className="p-8 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center">
                Imágenes de: {product.title}
            </h1>
            <ProductImagesEditor product={product} />
        </main>
    );
}
