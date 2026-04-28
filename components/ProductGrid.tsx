"use client";

import EmptyState from "@/app/tienda/EmptyState";
import FilterBadge from "@/app/tienda/FilterBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
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
    const found = categories.find((c: any) => c.id === id);
    return found?.name ?? "Sin categoria";
  };

  return (
    <div className="flex-1">
      <div className="mb-4 flex items-center justify-end">
        <Select value={sortOption} onValueChange={(v) => setSortOption(v)}>
          <SelectTrigger className="h-10 w-full border-[rgba(125,91,63,0.18)] bg-white sm:w-[220px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Mas recientes</SelectItem>
            <SelectItem value="price-asc">Precio menor</SelectItem>
            <SelectItem value="price-desc">Precio mayor</SelectItem>
            <SelectItem value="name-asc">Nombre A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(selectedCategories.length > 0 || searchQuery) && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {selectedCategories.map((id: any) => {
            const cat = categories.find((c: any) => c.id === id);
            return (
              <FilterBadge
                key={id}
                label={cat?.name || "Categoria"}
                onRemove={() => toggleCategory(id)}
              />
            );
          })}

          {searchQuery && (
            <FilterBadge
              label={`Busqueda: ${searchQuery}`}
              onRemove={clearFilters}
            />
          )}
        </div>
      )}

      {products.length === 0 ? (
        <EmptyState clearFilters={clearFilters} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
            {products.map((p: any) => (
              <ProductCard
                key={p.id}
                product={p}
                getCategoryNameById={getCategoryNameById}
              />
            ))}
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              className="border-[rgba(125,91,63,0.16)] bg-white"
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Anterior
            </Button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? "default" : "outline"}
                className={currentPage === i + 1 ? "" : "border-[rgba(125,91,63,0.16)] bg-white"}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}

            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              className="border-[rgba(125,91,63,0.16)] bg-white"
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
