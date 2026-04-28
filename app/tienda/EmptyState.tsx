"use client";

import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmptyState({ clearFilters }: any) {
    return (
        <div className="rounded-[1.8rem] border border-[rgba(125,91,63,0.14)] bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(125,91,63,0.08)] text-[var(--color-accent)]">
                <SearchX className="h-7 w-7" />
            </div>
            <h3 className="font-serif text-3xl text-[var(--color-ink)]">No encontramos resultados</h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--color-muted)]">
                Probá ampliar el rango de precio, quitar alguna categoría o limpiar la búsqueda para volver a ver el catálogo completo.
            </p>
            <Button onClick={clearFilters} className="mt-6">
                Limpiar filtros
            </Button>
        </div>
    );
}
