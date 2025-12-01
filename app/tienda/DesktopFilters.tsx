"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, Search, X } from "lucide-react";

type Props = {
    categories: any[];
    selectedCategories: string[];
    toggleCategory: (id: string) => void;

    priceRange: [number, number];
    setPriceRange: (range: [number, number]) => void;

    searchQuery: string;
    setSearchQuery: (v: string) => void;

    clearFilters: () => void;

    // PRO Filters
    selectedSizes: string[];
    toggleSize: (size: string) => void;

    selectedColors: string[];
    toggleColor: (color: string) => void;

    selectedStock: string[];
    toggleStock: (v: string) => void;

    selectedBrands: string[];
    toggleBrand: (brand: string) => void;

    filterDiscount: boolean;
    setFilterDiscount: (v: boolean) => void;

    brands: string[];
};

function DesktopFilters({
    categories,
    selectedCategories,
    toggleCategory,
    priceRange,
    setPriceRange,
    searchQuery,
    setSearchQuery,
    clearFilters,

    selectedSizes,
    toggleSize,

    selectedColors,
    toggleColor,

    selectedStock,
    toggleStock,

    selectedBrands,
    toggleBrand,

    filterDiscount,
    setFilterDiscount,

    brands
}: Props) {
    return (
        <div className="bg-white rounded-lg border shadow p-4 sticky top-24">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-medium flex items-center">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filtros
                </h2>

                {(selectedCategories.length > 0 || searchQuery) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                        Limpiar
                    </Button>
                )}
            </div>

            {/* BUSCADOR */}
            <div className="relative mb-6">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4" />
                <Input
                    placeholder="Buscar productos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                />
                {searchQuery && (
                    <button
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setSearchQuery("")}
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* TALLAS */}
            {/* TALLAS */}
            <Accordion type="single" collapsible defaultValue="sizes">
                <AccordionItem value="sizes">
                    <AccordionTrigger className="py-2">
                        Talles
                    </AccordionTrigger>

                    <AccordionContent>
                        <div className="space-y-4 pt-1">

                            {/* ---- ROPA ---- */}
                            <div>
                                <p className="text-xs font-medium text-beige-600 mb-1">Ropa</p>
                                <div className="flex flex-wrap gap-2">
                                    {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                                        <Badge
                                            key={size}
                                            variant={selectedSizes.includes(size) ? "default" : "outline"}
                                            className="cursor-pointer border-beige-300 text-beige-700 hover:bg-beige-100"
                                            onClick={() => toggleSize(size)}
                                        >
                                            {size}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* ---- ZAPATILLAS ---- */}
                            <div>
                                <p className="text-xs font-medium text-beige-600 mb-1">Zapatillas</p>
                                <div className="flex flex-wrap gap-2">
                                    {["35", "36", "37", "38", "39", "40", "41", "42", "43", "44"].map((size) => (
                                        <Badge
                                            key={size}
                                            variant={selectedSizes.includes(size) ? "default" : "outline"}
                                            className="cursor-pointer border-beige-300 text-beige-700 hover:bg-beige-100"
                                            onClick={() => toggleSize(size)}
                                        >
                                            {size}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>


            {/* COLORES */}
            <Accordion type="single" collapsible defaultValue="colors">
                <AccordionItem value="colors">
                    <AccordionTrigger className="py-2">
                        Colores
                    </AccordionTrigger>

                    <AccordionContent>
                        <div className="flex flex-wrap gap-2 pt-1">
                            {["Negro", "Blanco", "Rojo", "Azul", "Beige"].map((color) => (
                                <Badge
                                    key={color}
                                    variant={selectedColors.includes(color) ? "default" : "outline"}
                                    className="cursor-pointer border-beige-300 text-beige-700 hover:bg-beige-100"
                                    onClick={() => toggleColor(color)}
                                >
                                    {color}
                                </Badge>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {/* STOCK */}
            <Accordion type="single" collapsible defaultValue="price">
                <AccordionItem value="price">
                    <AccordionTrigger className="font-medium text-beige-800">
                        Precio
                    </AccordionTrigger>

                    <AccordionContent>
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm text-beige-600">
                                <span>${priceRange[0]}</span>
                                <span>${priceRange[1]}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    value={priceRange[0]}
                                    min={0}
                                    max={priceRange[1]}
                                    onChange={(e) =>
                                        setPriceRange([Number(e.target.value), priceRange[1]])
                                    }
                                    className="border-beige-300 bg-beige-50"
                                />

                                <span className="text-beige-600">–</span>

                                <Input
                                    type="number"
                                    value={priceRange[1]}
                                    min={priceRange[0]}
                                    onChange={(e) =>
                                        setPriceRange([priceRange[0], Number(e.target.value)])
                                    }
                                    className="border-beige-300 bg-beige-50"
                                />
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {/* MARCAS
            <Accordion type="single" collapsible defaultValue="brands">
                <AccordionItem value="brands">
                    <AccordionTrigger className="py-2">
                        Marcas
                    </AccordionTrigger>

                    <AccordionContent>
                        <div className="space-y-2 pt-1">
                            {brands.map((brand) => (
                                <div key={brand} className="flex items-center">
                                    <Checkbox
                                        checked={selectedBrands.includes(brand)}
                                        onCheckedChange={() => toggleBrand(brand)}
                                    />
                                    <span className="ml-2 text-sm">{brand}</span>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            DESCUENTOS
            <div className="flex items-center gap-2 pt-4">
                <Checkbox
                    checked={filterDiscount}
                    onCheckedChange={() => setFilterDiscount(!filterDiscount)}
                />
                <span className="text-sm">Solo productos en oferta</span>
            </div> */}

            {/* CATEGORÍAS */}
            <Accordion type="single" collapsible defaultValue="cat" className="">
                <AccordionItem value="cat">
                    <AccordionTrigger>Categorías</AccordionTrigger>

                    <AccordionContent>
                        {categories.map((cat) => (
                            <label key={cat.id} className="flex items-center gap-2 mt-2 cursor-pointer">
                                <Checkbox
                                    checked={selectedCategories.includes(cat.id)}
                                    onCheckedChange={() => toggleCategory(cat.id)}
                                />
                                {cat.name}
                            </label>
                        ))}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

        </div>
    );
}

export default memo(DesktopFilters);
