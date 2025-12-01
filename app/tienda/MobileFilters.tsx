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
import { Search, X } from "lucide-react";

type Props = {
    categories: any[];
    selectedCategories: string[];
    toggleCategory: (id: string) => void;

    priceRange: [number, number];
    setPriceRange: (r: [number, number]) => void;

    searchQuery: string;
    setSearchQuery: (s: string) => void;

    // PRO FILTERS
    selectedSizes: string[];
    toggleSize: (s: string) => void;

    selectedColors: string[];
    toggleColor: (c: string) => void;

    selectedStock: string[];
    toggleStock: (s: string) => void;

    selectedBrands: string[];
    toggleBrand: (b: string) => void;

    filterDiscount: boolean;
    setFilterDiscount: (v: boolean) => void;

    brands: string[];

    clearFilters: () => void;
    onClose: () => void;
};

function MobileFilters({
    categories,
    selectedCategories,
    toggleCategory,
    priceRange,
    setPriceRange,
    searchQuery,
    setSearchQuery,
    clearFilters,
    onClose,

    // PRO FILTERS
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
    brands,
}: Props) {



    return (
        <div className="space-y-2 py-2">

            {/* BUSCADOR */}
            <div className="relative mt-4">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-beige-500" />
                <Input
                    placeholder="Buscar productos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 border-beige-300 bg-beige-50"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                        <X className="w-4 h-4 text-beige-600" />
                    </button>
                )}
            </div>

            {/* TALLES */}
            {/* TALLAS */}
            <Accordion type="single" collapsible defaultValue="sizes">
                <AccordionItem value="sizes">
                    <AccordionTrigger className="text-beige-800 font-medium">
                        Talles
                    </AccordionTrigger>

                    <AccordionContent>
                        <div className="space-y-4 pt-3">

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
                    <AccordionTrigger className="font-medium text-beige-800">
                        Colores
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="flex flex-wrap gap-2">
                            {["Negro", "Blanco", "Rojo", "Azul", "Beige"].map((color) => (
                                <Badge
                                    key={color}
                                    variant={selectedColors.includes(color) ? "default" : "outline"}
                                    onClick={() => toggleColor(color)}
                                    className="cursor-pointer border-beige-300 text-beige-700"
                                >
                                    {color}
                                </Badge>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {/* STOCK */}
            {/* <Accordion type="single" collapsible defaultValue="stock">
                <AccordionItem value="stock">
                    <AccordionTrigger className="font-medium text-beige-800">
                        Disponibilidad
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-2">
                            {[
                                { label: "En stock", value: "in_stock" },
                                { label: "Agotado", value: "out_stock" },
                                { label: "Últimas unidades", value: "low_stock" },
                            ].map((s) => (
                                <label key={s.value} className="flex items-center gap-2">
                                    <Checkbox
                                        checked={selectedStock.includes(s.value)}
                                        onCheckedChange={() => toggleStock(s.value)}
                                    />
                                    <span className="text-beige-700">{s.label}</span>
                                </label>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion> */}



            {/* CATEGORÍAS */}
            <Accordion type="single" collapsible defaultValue="cats">
                <AccordionItem value="cats">
                    <AccordionTrigger className="font-medium text-beige-800">
                        Categorías
                    </AccordionTrigger>

                    <AccordionContent>
                        <div className="space-y-2">
                            {categories.map((cat) => (
                                <label key={cat.id} className="flex items-center gap-2">
                                    <Checkbox
                                        checked={selectedCategories.includes(cat.id)}
                                        onCheckedChange={() => toggleCategory(cat.id)}
                                    />
                                    <span className="text-beige-700">{cat.name}</span>
                                </label>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {/* PRECIO */}
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

            {/* BOTONES */}
            <div className="flex gap-3 pt-4">
                <Button
                    variant="outline"
                    onClick={() => {
                        clearFilters();
                        onClose();
                    }}
                    className="flex-1 border-beige-300 text-beige-800"
                >
                    Limpiar
                </Button>

                <Button
                    onClick={onClose}
                    className="flex-1 bg-beige-700 hover:bg-beige-800 text-white"
                >
                    Aplicar
                </Button>
            </div>
        </div>
    );
}

export default memo(MobileFilters);
