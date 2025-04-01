"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Filter, SlidersHorizontal, ChevronDown, Search, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { ProductCard } from "@/components/ProductCard"
import { createClient } from "@/utils/supabase/client"
import type { Product } from "@/lib/types"
import { useCartStore } from "../store/cartStore"

export default function TiendaPage() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("categoria")

  const { products, isLoadingProducts, error, fetchProducts } = useCartStore()
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(categoryParam ? [categoryParam] : [])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000])
  const [sortOption, setSortOption] = useState("newest")
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)

  // Fetch products on component mount
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

  // Apply filters and sorting
  useEffect(() => {
    let result = [...products]

    // Apply category filter
    if (selectedCategories.length > 0) {
      result = result.filter((product) => selectedCategories.includes(product.category_id))
    }

    // Apply price range filter
    result = result.filter((product) => product.price! >= priceRange[0] && product.price! <= priceRange[1])

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (product) => product.title.toLowerCase().includes(query) || product.description?.toLowerCase().includes(query),
      )
    }

    // Apply sorting
    switch (sortOption) {
      case "newest":
        result.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
          return dateB - dateA
        })
        break
      case "price-asc":
        result.sort((a, b) => a.price! - b.price!)
        break
      case "price-desc":
        result.sort((a, b) => b.price! - a.price!)
        break
      case "name-asc":
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      default:
        break
    }

    setFilteredProducts(result)
  }, [products, selectedCategories, priceRange, sortOption, searchQuery])

  // Toggle category selection
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([])
    setPriceRange([0, 5000])
    setSearchQuery("")
    setSortOption("newest")
  }

  // Helper function to get category name by ID
  function getCategoryNameById(id: string) {
    const category = categories.find((cat) => cat.id === id)
    return category ? category.name : "Categoría desconocida"
  }

  return (
    <main className="bg-beige-50 min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-beige-800 mb-2">Tienda</h1>
          <div className="flex items-center text-sm text-beige-600">
            <Link href="/" className="hover:text-beige-800 transition-colors">
              Inicio
            </Link>
            <ChevronDown className="w-3 h-3 mx-2 rotate-270" />
            <span>Tienda</span>
          </div>
        </div>

        {/* Mobile filter button */}
        <div className="flex justify-between items-center mb-6 md:hidden">
          <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="border-beige-200 text-beige-700">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85%] sm:w-[350px] bg-beige-50 border-beige-200">
              <SheetHeader>
                <SheetTitle className="text-beige-800 font-serif">Filtros</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <MobileFilters
                  categories={categories}
                  selectedCategories={selectedCategories}
                  toggleCategory={toggleCategory}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  clearFilters={clearFilters}
                  onClose={() => setIsMobileFilterOpen(false)}
                  isLoadingCategories={isLoadingCategories}
                />
              </div>
            </SheetContent>
          </Sheet>

          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-[180px] border-beige-200 bg-white">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent className="bg-white border-beige-200">
              <SelectItem value="newest">Más recientes</SelectItem>
              <SelectItem value="price-asc">Precio: menor a mayor</SelectItem>
              <SelectItem value="price-desc">Precio: mayor a menor</SelectItem>
              <SelectItem value="name-asc">Nombre: A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Desktop sidebar filters */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border border-beige-200 shadow-sm p-4 sticky top-24">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-medium text-beige-800 flex items-center">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filtros
                </h2>
                {(selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 5000) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-8 text-beige-600 hover:text-beige-800"
                  >
                    Limpiar
                  </Button>
                )}
              </div>

              <div className="space-y-6">
                {/* Search */}
                <div>
                  <h3 className="text-sm font-medium text-beige-700 mb-2">Buscar</h3>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-beige-500" />
                    <Input
                      type="text"
                      placeholder="Buscar productos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 border-beige-200 bg-beige-50 focus:border-beige-300"
                    />
                    {searchQuery && (
                      <button
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setSearchQuery("")}
                        aria-label="Limpiar búsqueda"
                      >
                        <X className="w-4 h-4 text-beige-500 hover:text-beige-700" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <Accordion type="single" collapsible defaultValue="categories">
                    <AccordionItem value="categories" className="border-b-0">
                      <AccordionTrigger className="py-2 text-beige-800 hover:text-beige-800 hover:no-underline">
                        <span className="text-sm font-medium">Categorías</span>
                      </AccordionTrigger>
                      <AccordionContent>
                        {isLoadingCategories ? (
                          <div className="flex justify-center py-2">
                            <Loader2 className="w-5 h-5 text-beige-500 animate-spin" />
                          </div>
                        ) : categories.length > 0 ? (
                          <div className="space-y-2 pt-1">
                            {categories.map((category) => (
                              <div key={category.id} className="flex items-center">
                                <Checkbox
                                  id={`category-${category.id}`}
                                  checked={selectedCategories.includes(category.id)}
                                  onCheckedChange={() => toggleCategory(category.id)}
                                  className="border-beige-300 data-[state=checked]:bg-beige-700 data-[state=checked]:border-beige-700"
                                />
                                <label
                                  htmlFor={`category-${category.id}`}
                                  className="ml-2 text-sm text-beige-700 cursor-pointer"
                                >
                                  {category.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-beige-600 py-2">No hay categorías disponibles</p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                {/* Price Range */}
                <div>
                  <Accordion type="single" collapsible defaultValue="price">
                    <AccordionItem value="price" className="border-b-0">
                      <AccordionTrigger className="py-2 text-beige-800 hover:text-beige-800 hover:no-underline">
                        <span className="text-sm font-medium">Precio</span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-1">
                          <div className="flex justify-between">
                            <span className="text-sm text-beige-600">${priceRange[0].toLocaleString("es-MX")}</span>
                            <span className="text-sm text-beige-600">${priceRange[1].toLocaleString("es-MX")}</span>
                          </div>
                          <div className="flex space-x-2">
                            <Input
                              type="number"
                              min="0"
                              max={priceRange[1]}
                              value={priceRange[0]}
                              onChange={(e) => setPriceRange([Number.parseInt(e.target.value), priceRange[1]])}
                              className="border-beige-200 bg-beige-50 focus:border-beige-300"
                            />
                            <span className="text-beige-600 self-center">-</span>
                            <Input
                              type="number"
                              min={priceRange[0]}
                              value={priceRange[1]}
                              onChange={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value)])}
                              className="border-beige-200 bg-beige-50 focus:border-beige-300"
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            {/* Desktop sorting and results count */}
            <div className="hidden md:flex justify-between items-center mb-6">
              <p className="text-beige-600">
                Mostrando <span className="font-medium text-beige-800">{filteredProducts.length}</span> productos
              </p>

              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-[220px] border-beige-200 bg-white">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent className="bg-white border-beige-200">
                  <SelectItem value="newest">Más recientes</SelectItem>
                  <SelectItem value="price-asc">Precio: menor a mayor</SelectItem>
                  <SelectItem value="price-desc">Precio: mayor a menor</SelectItem>
                  <SelectItem value="name-asc">Nombre: A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active filters */}
            {(selectedCategories.length > 0 || searchQuery) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCategories.map((categoryId) => {
                  const category = categories.find((c) => c.id === categoryId)
                  return (
                    <Badge
                      key={categoryId}
                      variant="secondary"
                      className="bg-beige-100 text-beige-700 hover:bg-beige-200 px-3 py-1"
                    >
                      {category?.name || "Categoría"}
                      <button
                        onClick={() => toggleCategory(categoryId)}
                        className="ml-1 hover:text-beige-800"
                        aria-label={`Eliminar filtro ${category?.name}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )
                })}

                {searchQuery && (
                  <Badge variant="secondary" className="bg-beige-100 text-beige-700 hover:bg-beige-200 px-3 py-1">
                    Búsqueda: {searchQuery}
                    <button
                      onClick={() => setSearchQuery("")}
                      className="ml-1 hover:text-beige-800"
                      aria-label="Eliminar búsqueda"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-7 text-beige-600 hover:text-beige-800 hover:bg-beige-100 px-2"
                >
                  Limpiar filtros
                </Button>
              </div>
            )}

            {/* Products grid */}
            {isLoadingProducts ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-10 h-10 text-beige-500 animate-spin mb-4" />
                <p className="text-beige-600">Cargando productos...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-red-600">{error}</p>
                <Button onClick={() => fetchProducts()} className="mt-2 bg-beige-700 hover:bg-beige-800 text-beige-50">
                  Reintentar
                </Button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white border border-beige-200 rounded-lg shadow-sm p-8 text-center">
                <Image
                  src="/placeholder.svg?height=120&width=120"
                  alt="No hay productos"
                  width={120}
                  height={120}
                  className="mx-auto mb-4 opacity-50"
                />
                <h3 className="text-xl font-serif text-beige-800 mb-2">No se encontraron productos</h3>
                <p className="text-beige-600 mb-4">No hay productos que coincidan con los filtros seleccionados.</p>
                <Button onClick={clearFilters} className="bg-beige-700 hover:bg-beige-800 text-beige-50">
                  Limpiar filtros
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} getCategoryNameById={getCategoryNameById} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

// Mobile filters component
function MobileFilters({
  categories,
  selectedCategories,
  toggleCategory,
  priceRange,
  setPriceRange,
  clearFilters,
  onClose,
  isLoadingCategories,
}: {
  categories: { id: string; name: string }[]
  selectedCategories: string[]
  toggleCategory: (id: string) => void
  priceRange: [number, number]
  setPriceRange: (range: [number, number]) => void
  clearFilters: () => void
  onClose: () => void
  isLoadingCategories: boolean
}) {
  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-medium text-beige-800 mb-3">Categorías</h3>
        {isLoadingCategories ? (
          <div className="flex justify-center py-2">
            <Loader2 className="w-5 h-5 text-beige-500 animate-spin" />
          </div>
        ) : categories.length > 0 ? (
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center">
                <Checkbox
                  id={`mobile-category-${category.id}`}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={() => toggleCategory(category.id)}
                  className="border-beige-300 data-[state=checked]:bg-beige-700 data-[state=checked]:border-beige-700"
                />
                <label
                  htmlFor={`mobile-category-${category.id}`}
                  className="ml-2 text-sm text-beige-700 cursor-pointer"
                >
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-beige-600 py-2">No hay categorías disponibles</p>
        )}
      </div>

      <Separator className="bg-beige-200" />

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-medium text-beige-800 mb-3">Precio</h3>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-sm text-beige-600">${priceRange[0].toLocaleString("es-MX")}</span>
            <span className="text-sm text-beige-600">${priceRange[1].toLocaleString("es-MX")}</span>
          </div>
          <div className="flex space-x-2">
            <Input
              type="number"
              min="0"
              max={priceRange[1]}
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Number.parseInt(e.target.value), priceRange[1]])}
              className="border-beige-200 bg-beige-50 focus:border-beige-300"
            />
            <span className="text-beige-600 self-center">-</span>
            <Input
              type="number"
              min={priceRange[0]}
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value)])}
              className="border-beige-200 bg-beige-50 focus:border-beige-300"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 flex gap-2">
        <Button
          onClick={() => {
            clearFilters()
            onClose()
          }}
          variant="outline"
          className="flex-1 border-beige-300 text-beige-700"
        >
          Limpiar
        </Button>
        <Button onClick={onClose} className="flex-1 bg-beige-700 hover:bg-beige-800 text-beige-50">
          Aplicar
        </Button>
      </div>
    </div>
  )
}

