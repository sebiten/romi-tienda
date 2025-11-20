import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import NewProductForm from "@/components/New-product-form";

export default async function NewProductPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Si no hay usuario logueado, redirigimos
    if (!user) {
        redirect("/sign-in");
    }
    // 3) Consultamos la tabla profiles para ver isadmin
    const { data: profileData, error } = await supabase
        .from("profiles")
        .select("isadmin")
        .eq("id", user.id)
        .single();

    if (error || !profileData) {
        // Si no se pudo obtener el perfil, o no existe
        redirect("/");
    }

    // Si no es admin, redirigimos
    if (!profileData.isadmin) {
        redirect("/");
    }

    // 4) Renderizamos el formulario
    return (
        <section className="p-4 mx-auto">
            <h1 className="text-2xl font-semibold mb-4">Crear nuevo producto</h1>
            <NewProductForm />
        </section>
    );
}
