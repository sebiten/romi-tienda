import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

/* Tipado opcional si usas TypeScript para tus productos */
interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  sizes: string[];
  colors: string[];
  created_at: string;
  updated_at: string;
}

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  // 1) Obtenemos el producto por su ID desde Supabase
  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .single<Product>();

  if (!product || error) {
    // Si no existe, enviamos a una página 404
    notFound();
  }

  // 2) Renderizamos la info
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="overflow-hidden">
        <CardHeader className="relative">
          {/* Imagen principal / Carousel de imágenes */}
          {product.images && product.images.length > 0 ? (
            <div>
              {/* Imagen con fill y object-cover (puede verse recortada) */}
              {/* <div className="w-full h-96 relative">
                <Image
                  src={product.images[0]}
                  alt={product.title || "Producto"}
                  fill
                  className="object-cover"
                  priority
                />
              </div> */}

              {/* Versión "original" para mostrar la imagen sin recortes */}
              <div className="mt-4 max-w-xl mx-auto border rounded overflow-hidden bg-white">
                <img
                  src={product.images[0]}
                  alt={product.title || "Producto"}
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">Sin imagen</span>
            </div>
          )}
          <div className="absolute bottom-2 right-2 bg-white p-2 rounded shadow">
            <span className="text-sm text-gray-600">
              {new Date(product.created_at).toLocaleDateString()}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sección izquierda (info principal) */}
            <div className="flex-1">
              <h1 className="scroll-m-20 text-3xl font-bold tracking-tight">
                {product.title}
              </h1>
              <p className="leading-7 mt-2 text-gray-600">
                {product.description}
              </p>

              <div className="my-4">
                <span className="text-xl font-semibold">
                  ${product.price.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <Button variant="default">Agregar al carrito</Button>
                <Button variant="outline">Comprar ahora</Button>
              </div>
            </div>

            {/* Sección derecha (Tabs con tallas, colores, más info) */}
            <div className="w-full md:w-1/2">
              <Tabs defaultValue="info">
                <TabsList>
                  <TabsTrigger value="info">Más Info</TabsTrigger>
                  <TabsTrigger value="tallas">Tallas</TabsTrigger>
                  <TabsTrigger value="colores">Colores</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="pt-4">
                  <p className="text-sm text-gray-700">
                    Fecha de creación: {" "}
                    {new Date(product.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-700">
                    Última actualización: {" "}
                    {new Date(product.updated_at).toLocaleDateString()}
                  </p>
                </TabsContent>

                <TabsContent value="tallas" className="pt-4">
                  {product.sizes?.length > 0 ? (
                    <ul className="list-disc list-inside text-sm text-gray-700">
                      {product.sizes.map((size) => (
                        <li key={size}>{size}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">Sin tallas.</p>
                  )}
                </TabsContent>

                <TabsContent value="colores" className="pt-4">
                  {product.colors?.length > 0 ? (
                    <div className="flex gap-2 flex-wrap">
                      {product.colors.map((color) => (
                        <Badge variant="outline" key={color}>
                          {color}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Sin colores.</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end p-6">
          <Button variant="secondary">Compartir</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
