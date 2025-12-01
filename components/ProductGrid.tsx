"use client";

import EmptyState from "@/app/tienda/EmptyState";
import FilterBadge from "@/app/tienda/FilterBadge";
import { Button } from "@/components/ui/button";

import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { ProductCard } from "./ProductCard";

export default function ProductGrid({
  products,
  totalPages,
  currentPage,
  setCurrentPage,
  categories,
  selectedCategories,
  searchQuery,
  clearFilters,
  toggleCategory,
  sortOption,
  setSortOption,
}: any) {
  const getCategoryNameById = (id: string): string => {
    const found = categories.find((c: any) => c.id === id)
    return found?.name ?? "Sin categoría"
  }

  return (
    <div className="flex-1">

      {/* Active filters */}
      {(selectedCategories.length > 0 || searchQuery) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedCategories.map((id: any) => {
            const cat = categories.find((c: any) => c.id === id);
            return (
              <FilterBadge
                key={id}
                label={cat?.name || "Categoría"}
                onRemove={() => toggleCategory(id)}
              />
            );
          })}

          {searchQuery && (
            <FilterBadge
              label={`Buscar: ${searchQuery}`}
              onRemove={clearFilters}
            />
          )}
        </div>
      )}

      {/* Sort */}
      <div className="flex justify-start mb-4">
        <Select value={sortOption} onValueChange={(v) => setSortOption(v)}>
          <SelectTrigger className="w-[200px] bg-white">
            Ordenar por
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Más recientes</SelectItem>
            <SelectItem value="price-asc">Precio menor</SelectItem>
            <SelectItem value="price-desc">Precio mayor</SelectItem>
            <SelectItem value="name-asc">Nombre A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {products.length === 0 ? (
        <EmptyState clearFilters={clearFilters} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p: any) => (
              <ProductCard
                key={p.id}
                product={p}
                getCategoryNameById={getCategoryNameById}
              />

            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-10 flex-wrap">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Anterior
            </Button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? "default" : "outline"}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}

            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Siguiente
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
