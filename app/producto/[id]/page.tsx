"use client"

import { useState, useEffect, useCallback, memo, useMemo } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Check, AlertCircle, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AddToCartButton } from "@/components/AddToCartButton"
import { createClient } from "@/utils/supabase/client"
import type { Product } from "@/lib/types"
import { useCartStore } from "@/app/store/cartStore"

// === Helpers para variants ===
function getProductColors(product: Product): string[] {
  if (product.variants && product.variants.length > 0) {
    return Array.from(new Set(product.variants.map((v: any) => v.color)))
  }
  return product.colors ?? []
}

function getProductSizes(product: Product): string[] {
  if (product.variants && product.variants.length > 0) {
    return Array.from(new Set(product.variants.map((v: any) => v.size)))
  }
  return product.sizes ?? []
}

function getVariantStock(product: Product, color: string, size: string): number {
  if (product.variants && product.variants.length > 0) {
    const variant = product.variants.find((v: any) => v.color === color && v.size === size)

    if (!variant) return 0

    return variant.stock ?? 0
  }
  return product.stock ?? 0
}

const ProductImageGallery = memo(
  ({
    images,
    title,
    activeImage,
    setActiveImage,
  }: {
    images: string[] | undefined
    title: string
    activeImage: number
    setActiveImage: (index: number) => void
  }) => (
    <div className="space-y-4">
      {/* Main image with fade transition */}
      <div className="aspect-square relative rounded-2xl overflow-hidden bg-white border border-beige-200 shadow-sm group">
        <Image
          key={activeImage}
          src={images?.[activeImage] || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover transition-all duration-500 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnail gallery with enhanced styling */}
      {images && images.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {images.map((image, index) => (
            <button
              key={index}
              className={`
                aspect-square relative rounded-xl overflow-hidden 
                transition-all duration-300 ease-out
                ${activeImage === index
                  ? "ring-2 ring-beige-700 ring-offset-2 ring-offset-beige-50 scale-105 shadow-md"
                  : "ring-1 ring-beige-200 hover:ring-beige-400 hover:scale-105 shadow-sm"
                }
              `}
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
  ),
)

ProductImageGallery.displayName = "ProductImageGallery"

const OptionSelector = memo(
  ({
    label,
    options,
    selectedOption,
    onChange,
  }: {
    label: string
    options: string[]
    selectedOption: string
    onChange: (option: string) => void
  }) => (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-beige-800 tracking-wide uppercase">{label}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            className={`
              px-5 py-2.5 rounded-lg font-medium text-sm
              transition-all duration-200 ease-out
              ${selectedOption === option
                ? "bg-beige-800 text-beige-50 shadow-md scale-105 ring-2 ring-beige-700 ring-offset-2"
                : "bg-white text-beige-700 border border-beige-200 hover:border-beige-400 hover:shadow-sm hover:scale-105"
              }
            `}
            onClick={() => onChange(option)}
            aria-pressed={selectedOption === option}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  ),
)

OptionSelector.displayName = "OptionSelector"

const ProductSkeleton = () => (
  <div className="container mx-auto py-12 px-4">
    <div className="max-w-6xl mx-auto">
      <div className="animate-pulse space-y-8">
        <div className="h-4 bg-beige-200 rounded-full w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="aspect-square bg-gradient-to-br from-beige-100 to-beige-200 rounded-2xl"></div>
            <div className="grid grid-cols-5 gap-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="aspect-square bg-beige-200 rounded-xl"></div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="h-10 bg-beige-200 rounded-lg w-3/4"></div>
              <div className="h-6 bg-beige-100 rounded-lg w-1/2"></div>
            </div>
            <div className="h-8 bg-beige-200 rounded-lg w-1/4"></div>
            <div className="h-px bg-beige-200"></div>
            <div className="space-y-3">
              <div className="h-4 bg-beige-200 rounded w-1/6"></div>
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 w-16 bg-beige-200 rounded-lg"></div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-beige-200 rounded w-1/6"></div>
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 w-16 bg-beige-200 rounded-lg"></div>
                ))}
              </div>
            </div>
            <div className="h-14 bg-beige-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const ErrorState = ({ error }: { error: string | null }) => (
  <div className="container mx-auto py-20 px-4">
    <div className="max-w-md mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-beige-100 rounded-full">
          <AlertCircle className="h-12 w-12 text-beige-700" />
        </div>
      </div>
      <h1 className="font-serif text-3xl text-beige-900 mb-3 font-bold">Producto no encontrado</h1>
      <p className="text-beige-600 mb-8 leading-relaxed">
        {error || "No pudimos encontrar el producto que estás buscando."}
      </p>
      <Button
        asChild
        className="bg-beige-700 hover:bg-beige-800 text-beige-50 px-8 py-6 rounded-xl shadow-sm hover:shadow-md transition-all"
      >
        <Link href="/tienda">Volver a la tienda</Link>
      </Button>
    </div>
  </div>
)

// Main component
export default function ProductPage() {
  const params = useParams()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [activeImage, setActiveImage] = useState(0)

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return

      try {
        setLoading(true)
        const supabase = createClient()

        const { data, error } = await supabase.from("products").select("*").eq("id", productId).single()

        if (error) {
          throw new Error(error.message)
        }

        setProduct(data as Product)

        const colors = getProductColors(data as Product)
        const sizes = getProductSizes(data as Product)

        if (sizes.length > 0) {
          setSelectedSize(sizes[0])
        }

        if (colors.length > 0) {
          setSelectedColor(colors[0])
        }
      } catch (err) {
        console.error("Error fetching product:", err)
        setError("No se pudo cargar el producto. Por favor, inténtalo de nuevo.")
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  const colors = useMemo(() => (product ? getProductColors(product) : []), [product])

  const sizes = useMemo(() => (product ? getProductSizes(product) : []), [product])

  const currentStock = useMemo(() => {
    if (!product) return 0
    if (selectedColor && selectedSize) {
      return getVariantStock(product, selectedColor, selectedSize)
    }
    return product.stock ?? 0
  }, [product, selectedColor, selectedSize])

  const cartItems = useCartStore((state) => state.items)

  const cartQty = useMemo(() => {
    if (!product) return 0
    return cartItems
      .filter((item) => item.product_id === product.id && item.color === selectedColor && item.size === selectedSize)
      .reduce((sum, item) => sum + item.quantity, 0)
  }, [cartItems, product, selectedColor, selectedSize])

  const remainingStock = Math.max(currentStock - cartQty, 0)

  const handleSizeChange = useCallback((size: string) => {
    setSelectedSize(size)
  }, [])

  const handleColorChange = useCallback((color: string) => {
    setSelectedColor(color)
  }, [])

  const handleImageChange = useCallback((index: number) => {
    setActiveImage(index)
  }, [])

  if (loading) {
    return <ProductSkeleton />
  }

  if (error || !product) {
    return <ErrorState error={error} />
  }

  return (
    <main className="bg-beige-50 min-h-screen py-8 md:py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <nav className="mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center text-sm text-beige-600 gap-2">
            <li>
              <Link href="/" className="flex items-center gap-1.5 hover:text-beige-900 transition-colors group">
                <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Inicio</span>
              </Link>
            </li>
            <li>
              <ChevronRight className="w-4 h-4 text-beige-400" />
            </li>
            <li>
              <Link href="/tienda" className="hover:text-beige-900 transition-colors">
                Tienda
              </Link>
            </li>
            <li>
              <ChevronRight className="w-4 h-4 text-beige-400" />
            </li>
            <li className="text-beige-800 font-medium truncate max-w-[200px]">{product.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          {/* Product images */}
          <ProductImageGallery
            images={product.images}
            title={product.title}
            activeImage={activeImage}
            setActiveImage={handleImageChange}
          />

          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="font-serif text-4xl md:text-5xl text-beige-900 leading-tight font-bold">
                {product.title}
              </h1>
              {product.description && <p className="text-beige-600 text-lg leading-relaxed">{product.description}</p>}

              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-beige-900">${product.price?.toLocaleString("es-AR")}</span>
                <span className="text-sm text-beige-600">ARS</span>
              </div>
            </div>

            <Separator className="bg-beige-200" />

            {/* Size selection */}
            {sizes.length > 0 && (
              <OptionSelector label="Talla" options={sizes} selectedOption={selectedSize} onChange={handleSizeChange} />
            )}

            {/* Color selection */}
            {colors.length > 0 && (
              <OptionSelector
                label="Color"
                options={colors}
                selectedOption={selectedColor}
                onChange={handleColorChange}
              />
            )}

            <div className="flex items-center py-3">
              {remainingStock > 0 ? (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    {remainingStock} disponibles para {selectedColor} - {selectedSize}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-700">
                    Sin stock para {selectedColor} - {selectedSize}
                  </span>
                </div>
              )}
            </div>

            {/* Add to cart button */}
            <div className="pt-2">
              <AddToCartButton
                product={product}
                selectedSize={selectedSize}
                selectedColor={selectedColor}
                currentStock={currentStock}
                className="w-full py-6 text-lg rounded-xl shadow-sm hover:shadow-md transition-all"
              />
            </div>

            <Card className="bg-gradient-to-br from-beige-50 to-beige-100/50 border-beige-200 shadow-sm">
              <div className="p-6">
                <h3 className="font-semibold text-beige-900 mb-4 text-sm uppercase tracking-wide">
                  Información adicional
                </h3>
                <div className="space-y-3 text-sm text-beige-700">
                  <div className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-beige-600 mt-0.5 flex-shrink-0" />
                    <p>Envío gratuito en pedidos superiores a $80.000 ARS</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-beige-600 mt-0.5 flex-shrink-0" />
                    <p>Devoluciones gratuitas dentro de los 30 días</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-beige-600 mt-0.5 flex-shrink-0" />
                    <p>Garantía de calidad en todos nuestros productos</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
