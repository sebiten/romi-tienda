"use client";

import { Button } from "@/components/ui/button";

export default function EmptyState({ clearFilters }: any) {
    return (
        <div className="text-center py-16 bg-white border rounded-lg">
            <h3 className="text-xl mb-2">No se encontraron productos</h3>
            <Button onClick={clearFilters}>Limpiar filtros</Button>
        </div>
    );
}
