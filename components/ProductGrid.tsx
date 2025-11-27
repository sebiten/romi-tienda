"use client"

import { useEffect } from "react"
import { ProductCard } from "@/components/ProductCard"
import { Loader2 } from "lucide-react"
import TitleUsable from "@/components/Title"
import { createClient } from "@/utils/supabase/client"
import { useState } from "react"
import { useCartStore } from "@/app/store/cartStore"

interface ProductGridProps {
  getCategoryNameById?: (id: string) => string
  title?: string
  limit?: number
}

export function ProductGrid({ title = "Productos", limit }: ProductGridProps) {
  const { products, isLoadingProducts, error, fetchProducts } = useCartStore()
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Fetch categories from Supabase
  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoadingCategories(true)
        const supabase = createClient()
        const { data, error } = await supabase.from("categories").select("id, name")

        if (error) {
          console.error("Error fetching categories:", error)
          return
        }

        setCategories(data || [])
      } catch (err) {
        console.error("Error in fetchCategories:", err)
      } finally {
        setIsLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  // Helper function to get category name by ID
  function getCategoryNameById(id: string) {
    const category = categories.find((cat) => cat.id === id)
    return category ? category.name : "Categoría desconocida"
  }

  // Limit the number of products if specified
  const displayProducts = limit ? products.slice(0, limit) : products

  if (isLoadingProducts || isLoadingCategories) {
    return (
      <section className="py-16 px-4 md:px-6 bg-beige-50">
        <div className="container mx-auto">
          <div className="mb-12 text-center">
            <TitleUsable title={title} />
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-beige-500 to-transparent mx-auto mt-4"></div>
          </div>

          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-10 h-10 text-beige-500 animate-spin" />
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 px-4 md:px-6 bg-beige-50">
        <div className="container mx-auto text-center">
          <TitleUsable title={title} />
          <p className="text-beige-600 mt-4">{error}</p>
        </div>
      </section>
    )
  }

  if (!products || products.length === 0) {
    return (
      <section className="py-16 px-4 md:px-6 bg-beige-50">
        <div className="container mx-auto text-center">
          <TitleUsable title={title} />
          <p className="text-beige-600 mt-4">No hay productos disponibles en este momento.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-4 md:px-6 bg-beige-50">
      <div className="container mx-auto">
        <div className="mb-12 text-center">
          <TitleUsable title={title} />
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-beige-500 to-transparent mx-auto mt-4"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6 max-w-7xl mx-auto">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} getCategoryNameById={getCategoryNameById} />
          ))}
        </div>
      </div>
    </section>
  )
}

