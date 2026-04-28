"use client"

import { useState, useEffect, useCallback, memo, useMemo } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Check, AlertCircle, Home, ShieldCheck, Sparkles, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AddToCartButton } from "@/components/AddToCartButton"
import { createClient } from "@/utils/supabase/client"
import type { Product } from "@/lib/types"
import { useCartStore } from "@/app/store/cartStore"

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
      <div className="group relative aspect-square overflow-hidden rounded-[2rem] border border-[rgba(125,91,63,0.14)] bg-white shadow-sm">
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

      {images && images.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {images.map((image, index) => (
            <button
              key={index}
              className={`relative aspect-square overflow-hidden rounded-xl transition-all duration-300 ease-out ${
                activeImage === index
                  ? "scale-105 ring-2 ring-beige-700 ring-offset-2 ring-offset-beige-50 shadow-md"
                  : "ring-1 ring-beige-200 shadow-sm hover:scale-105 hover:ring-beige-400"
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
      <h3 className="text-sm font-semibold uppercase tracking-wide text-beige-800">{label}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200 ease-out ${
              selectedOption === option
                ? "scale-105 bg-beige-800 text-beige-50 shadow-md ring-2 ring-beige-700 ring-offset-2"
                : "border border-beige-200 bg-white text-beige-700 hover:scale-105 hover:border-beige-400 hover:shadow-sm"
            }`}
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
  <div className="container mx-auto px-4 py-12">
    <div className="mx-auto max-w-6xl">
      <div className="space-y-8 animate-pulse">
        <div className="h-4 w-1/4 rounded-full bg-beige-200"></div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-beige-100 to-beige-200"></div>
            <div className="grid grid-cols-5 gap-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-beige-200"></div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="h-10 w-3/4 rounded-lg bg-beige-200"></div>
              <div className="h-6 w-1/2 rounded-lg bg-beige-100"></div>
            </div>
            <div className="h-8 w-1/4 rounded-lg bg-beige-200"></div>
            <div className="h-px bg-beige-200"></div>
            <div className="space-y-3">
              <div className="h-4 w-1/6 rounded bg-beige-200"></div>
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 w-16 rounded-lg bg-beige-200"></div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 w-1/6 rounded bg-beige-200"></div>
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 w-16 rounded-lg bg-beige-200"></div>
                ))}
              </div>
            </div>
            <div className="h-14 rounded-xl bg-beige-200"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const ErrorState = ({ error }: { error: string | null }) => (
  <div className="container mx-auto px-4 py-20">
    <div className="mx-auto max-w-md text-center">
      <div className="mb-6 flex justify-center">
        <div className="rounded-full bg-beige-100 p-4">
          <AlertCircle className="h-12 w-12 text-beige-700" />
        </div>
      </div>
      <h1 className="mb-3 font-serif text-3xl font-bold text-beige-900">Producto no encontrado</h1>
      <p className="mb-8 leading-relaxed text-beige-600">
        {error || "No pudimos encontrar el producto que estás buscando."}
      </p>
      <Button asChild className="rounded-xl bg-beige-700 px-8 py-6 text-beige-50 shadow-sm transition-all hover:bg-beige-800 hover:shadow-md">
        <Link href="/tienda">Volver a la tienda</Link>
      </Button>
    </div>
  </div>
)

export default function ProductPage() {
  const params = useParams()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return
      try {
        setLoading(true)
        const supabase = createClient()
        const { data, error } = await supabase.from("products").select("*").eq("id", productId).single()
        if (error) throw new Error(error.message)
        setProduct(data as Product)
        const colors = getProductColors(data as Product)
        const sizes = getProductSizes(data as Product)
        if (sizes.length > 0) setSelectedSize(sizes[0])
        if (colors.length > 0) setSelectedColor(colors[0])
      } catch (err) {
        console.error("Error fetching product:", err)
        setError("No se pudo cargar el producto. Por favor, intentá nuevamente.")
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
    if (selectedColor && selectedSize) return getVariantStock(product, selectedColor, selectedSize)
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

  const handleSizeChange = useCallback((size: string) => setSelectedSize(size), [])
  const handleColorChange = useCallback((color: string) => setSelectedColor(color), [])
  const handleImageChange = useCallback((index: number) => setActiveImage(index), [])

  if (loading) return <ProductSkeleton />
  if (error || !product) return <ErrorState error={error} />

  return (
    <main className="min-h-screen bg-beige-50 px-4 py-8 md:py-12">
      <div className="container mx-auto max-w-6xl">
        <nav className="mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-beige-600">
            <li>
              <Link href="/" className="group flex items-center gap-1.5 transition-colors hover:text-beige-900">
                <Home className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span>Inicio</span>
              </Link>
            </li>
            <li><ChevronRight className="h-4 w-4 text-beige-400" /></li>
            <li><Link href="/tienda" className="transition-colors hover:text-beige-900">Tienda</Link></li>
            <li><ChevronRight className="h-4 w-4 text-beige-400" /></li>
            <li className="max-w-[200px] truncate font-medium text-beige-800">{product.title}</li>
          </ol>
        </nav>

        <section className="surface-card surface-border mb-8 overflow-hidden rounded-[2rem] px-6 py-8 shadow-sm md:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(125,91,63,0.14)] bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
                <Sparkles className="h-3.5 w-3.5" />
                Selección destacada
              </span>
              <div className="space-y-3">
                <h1 className="font-serif text-4xl leading-tight text-beige-900 md:text-5xl">{product.title}</h1>
                {product.description && (
                  <p className="max-w-2xl text-base leading-7 text-[var(--color-muted)] md:text-lg">{product.description}</p>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[360px]">
              <div className="rounded-2xl border border-[rgba(125,91,63,0.12)] bg-white/80 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">Precio</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">${product.price?.toLocaleString("es-AR")}</p>
                <p className="text-sm text-[var(--color-muted)]">valor final en ARS</p>
              </div>
              <div className="rounded-2xl border border-[rgba(125,91,63,0.12)] bg-white/80 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">Disponibilidad</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">{remainingStock}</p>
                <p className="text-sm text-[var(--color-muted)]">unidades para esta variante</p>
              </div>
              <div className="rounded-2xl border border-[rgba(125,91,63,0.12)] bg-white/80 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">Compra</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">Segura</p>
                <p className="text-sm text-[var(--color-muted)]">stock y totales verificados</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-16">
          <ProductImageGallery images={product.images} title={product.title} activeImage={activeImage} setActiveImage={handleImageChange} />

          <div className="space-y-6">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-beige-900">${product.price?.toLocaleString("es-AR")}</span>
              <span className="text-sm text-beige-600">ARS</span>
            </div>

            <Separator className="bg-beige-200" />

            {sizes.length > 0 && <OptionSelector label="Talle" options={sizes} selectedOption={selectedSize} onChange={handleSizeChange} />}
            {colors.length > 0 && <OptionSelector label="Color" options={colors} selectedOption={selectedColor} onChange={handleColorChange} />}

            <div className="flex items-center py-1">
              {remainingStock > 0 ? (
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">{remainingStock} disponibles para {selectedColor} - {selectedSize}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium text-red-700">Sin stock para {selectedColor} - {selectedSize}</span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <AddToCartButton product={product} selectedSize={selectedSize} selectedColor={selectedColor} currentStock={currentStock} className="w-full rounded-xl py-6 text-lg shadow-sm transition-all hover:shadow-md" />
            </div>

            <Card className="border-beige-200 bg-gradient-to-br from-beige-50 to-beige-100/50 shadow-sm">
              <div className="p-6">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-beige-900">Compra con confianza</h3>
                <div className="space-y-3 text-sm text-beige-700">
                  <div className="flex items-start gap-3">
                    <Truck className="mt-0.5 h-4 w-4 flex-shrink-0 text-beige-600" />
                    <p>Envío gratuito en pedidos superiores a $80.000 ARS.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-beige-600" />
                    <p>Verificamos stock, precio y envío antes de enviarte al pago.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-beige-600" />
                    <p>Podés revisar tu pedido desde tu perfil una vez finalizada la compra.</p>
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
