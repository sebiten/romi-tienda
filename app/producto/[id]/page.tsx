"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AddToCartButton } from "@/components/AddToCartButton";
import { createClient } from "@/utils/supabase/client";
import { Product } from "@/lib/types";

// Memoized product image gallery component
const ProductImageGallery = memo(
  ({
    images,
    title,
    activeImage,
    setActiveImage,
  }: {
    images: string[] | undefined;
    title: string;
    activeImage: number;
    setActiveImage: (index: number) => void;
  }) => (
    <div className="space-y-4">
      <div className="aspect-square relative rounded-lg overflow-hidden bg-white border border-beige-200">
        <Image
          src={images?.[activeImage] || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnail gallery */}
      {images && images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              className={`aspect-square relative rounded-md overflow-hidden border-2 ${activeImage === index ? "border-beige-700" : "border-beige-200"
                }`}
              onClick={() => setActiveImage(index)}
              aria-label={`Ver imagen ${index + 1}`}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`${title} - Vista ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 60px, 80px"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
);

ProductImageGallery.displayName = "ProductImageGallery";

// Memoized option selector component
const OptionSelector = memo(
  ({
    label,
    options,
    selectedOption,
    onChange,
  }: {
    label: string;
    options: string[];
    selectedOption: string;
    onChange: (option: string) => void;
  }) => (
    <div>
      <h3 className="text-sm font-medium text-beige-700 mb-3">{label}</h3>
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {options.map((option) => (
          <button
            key={option}
            className={`h-10 rounded-md border transition-colors ${selectedOption === option
              ? "bg-beige-800 text-beige-50 border-beige-800"
              : "bg-white text-beige-700 border-beige-200 hover:border-beige-300"
              }`}
            onClick={() => onChange(option)}
            aria-pressed={selectedOption === option}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
);

OptionSelector.displayName = "OptionSelector";

// Loading skeleton component
const ProductSkeleton = () => (
  <div className="container mx-auto py-12 px-4">
    <div className="max-w-6xl mx-auto">
      <div className="animate-pulse">
        <div className="h-6 bg-beige-200 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-beige-200 rounded-lg"></div>
          <div className="space-y-4">
            <div className="h-8 bg-beige-200 rounded w-3/4"></div>
            <div className="h-4 bg-beige-200 rounded w-1/2"></div>
            <div className="h-6 bg-beige-200 rounded w-1/4 mt-6"></div>
            <div className="grid grid-cols-4 gap-2 mt-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-beige-200 rounded"></div>
              ))}
            </div>
            <div className="h-6 bg-beige-200 rounded w-1/4 mt-6"></div>
            <div className="grid grid-cols-4 gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-beige-200 rounded"></div>
              ))}
            </div>
            <div className="h-12 bg-beige-200 rounded mt-8"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Error state component
const ErrorState = ({ error }: { error: string | null }) => (
  <div className="container mx-auto py-12 px-4">
    <div className="max-w-md mx-auto text-center">
      <div className="flex justify-center mb-4">
        <AlertCircle className="h-12 w-12 text-beige-800" />
      </div>
      <h1 className="text-2xl font-serif text-beige-800 mb-4">
        Producto no encontrado
      </h1>
      <p className="text-beige-600 mb-6">
        {error || "No pudimos encontrar el producto que estás buscando."}
      </p>
      <Button asChild className="bg-beige-700 hover:bg-beige-800 text-beige-50">
        <Link href="/tienda">Volver a la tienda</Link>
      </Button>
    </div>
  </div>
);

// Main component
export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      try {
        setLoading(true);
        const supabase = createClient();

        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .single();

        if (error) {
          throw new Error(error.message);
        }

        setProduct(data);

        // Set default selections if available
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }

        if (data.colors && data.colors.length > 0) {
          setSelectedColor(data.colors[0]);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(
          "No se pudo cargar el producto. Por favor, inténtalo de nuevo."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Handle option changes
  const handleSizeChange = useCallback((size: string) => {
    setSelectedSize(size);
  }, []);

  const handleColorChange = useCallback((color: string) => {
    setSelectedColor(color);
  }, []);

  const handleImageChange = useCallback((index: number) => {
    setActiveImage(index);
  }, []);

  // Render loading state
  if (loading) {
    return <ProductSkeleton />;
  }

  // Render error state
  if (error || !product) {
    return <ErrorState error={error} />;
  }

  return (
    <main className="bg-beige-50 min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <div className="flex items-center text-sm text-beige-600">
            <Link href="/" className="hover:text-beige-800 transition-colors">
              Inicio
            </Link>
            <ChevronRight className="w-3 h-3 mx-2" />
            <Link
              href="/tienda"
              className="hover:text-beige-800 transition-colors"
            >
              Tienda
            </Link>
            <ChevronRight className="w-3 h-3 mx-2" />
            <span className="truncate max-w-[200px]">{product.title}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product images */}
          <ProductImageGallery
            images={product.images}
            title={product.title}
            activeImage={activeImage}
            setActiveImage={handleImageChange}
          />
          {/* Product details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-serif text-beige-800 mb-2">
                {product.title}
              </h1>
              {product.description && (
                <p className="text-beige-600">{product.description}</p>
              )}

              <div className="mt-4 flex items-center">
                <span className="text-2xl font-medium text-beige-800">
                  ${product.price?.toLocaleString("es-AR")}
                </span>
                {product.price && product.price > product.price && (
                  <span className="ml-2 text-lg line-through text-beige-500">
                    ${product.price.toLocaleString("es-AR")}
                  </span>
                )}
              </div>
            </div>

            <Separator className="bg-beige-200" />

            {/* Size selection */}
            {product.sizes && product.sizes.length > 0 && (
              <OptionSelector
                label="Talla"
                options={product.sizes}
                selectedOption={selectedSize}
                onChange={handleSizeChange}
              />
            )}

            {/* Color selection */}
            {product.colors && product.colors.length > 0 && (
              <OptionSelector
                label="Color"
                options={product.colors}
                selectedOption={selectedColor}
                onChange={handleColorChange}
              />
            )}

            {/* Stock information */}
            <div className="flex items-center">
              {product.stock && product.stock > 0 ? (
                <div className="flex items-center text-green-600">
                  <Check className="w-4 h-4 mr-1" />
                  <span>En stock ({product.stock} disponibles)</span>
                </div>
              ) : (
                <div className="text-red-500">Agotado</div>
              )}
            </div>

            {/* Add to cart button */}
            <div className="pt-4">
              <AddToCartButton
                product={product}
                selectedSize={selectedSize}
                selectedColor={selectedColor}
                className="w-full py-6 text-lg"
              />

            </div>

            {/* Additional information */}
            <Card className="bg-beige-100/50 border-beige-200 p-4">
              <div className="text-sm text-beige-700 space-y-2">
                <p>• Envío gratuito en pedidos superiores a $999 ARG</p>
                <p>• Devoluciones gratuitas dentro de los 30 días</p>
                <p>• Garantía de calidad en todos nuestros productos</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
