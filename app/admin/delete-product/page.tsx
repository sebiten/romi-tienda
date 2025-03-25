import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { deleteProductAction } from "../actions";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/types";

export default async function DeleteProductPage() {
    const supabase = await createClient();

    const { data: products, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching products:", error.message);
        notFound();
    }

    if (!products || products.length === 0) {
        return (
            <main className="p-8 text-center">
                <h1 className="text-3xl font-bold mb-4">Eliminar Producto</h1>
                <p className="text-muted-foreground">No hay productos disponibles.</p>
            </main>
        );
    }

    return (
        <main className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8">Eliminar Producto</h1>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 justify-items-center">
                {products.map((product: Product) => (
                    <Card key={product.id} className="w-full max-w-sm flex flex-col items-center text-center p-4">
                        <img
                            src={product.images?.[0] ?? "/placeholder.png"}
                            alt={product.title ?? "Imagen del producto"}
                            className="w-32 h-32 object-cover rounded-md mb-4"
                        />
                        <CardContent className="flex flex-col gap-2 items-center">
                            <div>
                                <h2 className="text-lg font-semibold">{product.title}</h2>
                                <p className="text-sm text-muted-foreground">
                                    ID: {product.id}
                                </p>
                                {product.description && (
                                    <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                                )}
                                <p className="text-md font-bold mt-2">${product.price ?? 0}</p>
                            </div>

                            {/* Alerta de confirmación */}
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                        Eliminar
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta acción no se puede deshacer. Esto eliminará
                                            permanentemente el producto: <strong>{product.title}</strong>
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <form action={deleteProductAction}>
                                            <input type="hidden" name="productId" value={product.id} />
                                            <AlertDialogAction
                                                type="submit"
                                                className="bg-red-600 hover:bg-red-700 text-white"
                                            >
                                                Confirmar eliminación
                                            </AlertDialogAction>
                                        </form>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </main>
    );
}
