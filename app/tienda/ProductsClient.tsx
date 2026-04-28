"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { SlidersHorizontal } from "lucide-react";
import DesktopFilters from "./DesktopFilters";
import ProductGrid from "@/components/ProductGrid";
import ProductSkeletonGrid from "@/components/skeletons/ProductSkeleton";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import MobileFilters from "./MobileFilters";

export default function ProductsClient({ products, categories }: any) {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000]);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOption, setSortOption] = useState("newest");
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [selectedStock, setSelectedStock] = useState<string[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [filterDiscount, setFilterDiscount] = useState(false);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const brands = ["Nike", "Adidas", "Vans", "Jordan"];

    const toggleSize = (size: string) => {
        setSelectedSizes((prev) =>
            prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
        );
    };

    const toggleColor = (color: string) => {
        setSelectedColors((prev) =>
            prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
        );
    };

    const toggleStock = (value: string) => {
        setSelectedStock((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        );
    };

    const toggleBrand = (brand: string) => {
        setSelectedBrands((prev) =>
            prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
        );
    };

    useEffect(() => {
        setIsLoading(true);
        const timeoutId = setTimeout(() => setIsLoading(false), 300);
        return () => clearTimeout(timeoutId);
    }, [
        selectedCategories,
        priceRange,
        searchQuery,
        sortOption,
        selectedSizes,
        selectedColors,
        selectedStock,
        selectedBrands,
        filterDiscount,
    ]);

    const filtered = useMemo(() => {
        let result = [...products];

        if (selectedCategories.length > 0) {
            result = result.filter((p) => selectedCategories.includes(p.category_id));
        }

        result = result.filter((p) => {
            const price = p.price || 0;
            return price >= priceRange[0] && price <= priceRange[1];
        });

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (p) => p.title.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
            );
        }

        if (selectedSizes.length > 0) {
            result = result.filter((p) =>
                p.sizes?.some((size: string) => selectedSizes.includes(size))
            );
        }

        if (selectedColors.length > 0) {
            result = result.filter((p) =>
                p.colors?.some((color: string) => selectedColors.includes(color))
            );
        }

        if (selectedStock.length > 0) {
            result = result.filter((p) => {
                if (selectedStock.includes("out_stock") && p.stock === 0) return true;
                if (selectedStock.includes("in_stock") && p.stock > 0) return true;
                if (selectedStock.includes("low_stock") && p.stock <= 5 && p.stock > 0) return true;
                return false;
            });
        }

        if (selectedBrands.length > 0) {
            result = result.filter((p) => selectedBrands.includes(p.brand));
        }

        if (filterDiscount) {
            result = result.filter((p) => p.discount_price !== null);
        }

        switch (sortOption) {
            case "newest":
                result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                break;
            case "price-asc":
                result.sort((a, b) => a.price - b.price);
                break;
            case "price-desc":
                result.sort((a, b) => b.price - a.price);
                break;
            case "name-asc":
                result.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case "discount-desc":
                result.sort((a, b) => (b.discount || 0) - (a.discount || 0));
                break;
        }

        return result;
    }, [
        products,
        selectedCategories,
        priceRange,
        searchQuery,
        sortOption,
        selectedSizes,
        selectedColors,
        selectedStock,
        selectedBrands,
        filterDiscount,
    ]);

    const productsPerPage = 9;
    const totalPages = Math.ceil(filtered.length / productsPerPage);

    const paginated = useMemo(() => {
        const start = (currentPage - 1) * productsPerPage;
        return filtered.slice(start, start + productsPerPage);
    }, [filtered, currentPage]);

    const toggleCategory = useCallback((id: string) => {
        setSelectedCategories((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        );
        setCurrentPage(1);
    }, []);

    const clearFilters = () => {
        setSelectedCategories([]);
        setSelectedSizes([]);
        setSelectedColors([]);
        setSelectedStock([]);
        setSelectedBrands([]);
        setFilterDiscount(false);
        setPriceRange([0, 200000]);
        setSearchQuery("");
        setSortOption("newest");
        setCurrentPage(1);
    };

    const getCategoryNameById = (id: string): string => {
        const found = categories.find((c: any) => c.id === id);
        return found?.name ?? "Sin categoria";
    };

    return (
        <main className="min-h-screen bg-beige-50 px-4 py-6 md:py-10">
            <div className="container mx-auto max-w-7xl">
                <section className="mb-5 flex flex-col gap-3 border-b border-[rgba(125,91,63,0.12)] pb-5 md:mb-8 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="font-serif text-4xl  text-[var(--color-ink)] md:text-4xl">
                            Tienda
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-muted)] md:text-base hidden md:block">
                            {/* {filtered.length} productos disponibles. Usa filtros para encontrar talle, color o precio. */}
                            Usa filtros para encontrar talle, color o precio.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-[var(--color-muted)] hidden md:flex">
                        <span className="rounded-full border border-[rgba(125,91,63,0.14)] bg-white/75 px-3 py-1.5">
                            {products.length} en catalogo
                        </span>
                        <span className="rounded-full border border-[rgba(125,91,63,0.14)] bg-white/75 px-3 py-1.5">
                            {categories.length} categorias
                        </span>
                    </div>
                </section>

                <div className="mb-4 flex items-center justify-between gap-3 md:hidden">
                    <div>
                        <p className="text-sm font-medium text-[var(--color-ink)]">
                            {filtered.length} resultados
                        </p>
                        <p className="text-xs text-[var(--color-muted)]">
                            Ajusta filtros para refinar la busqueda
                        </p>
                    </div>
                    <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                className="border-[rgba(125,91,63,0.18)] bg-white text-[var(--color-ink)] shadow-sm"
                                onClick={() => setIsMobileFiltersOpen(true)}
                            >
                                <SlidersHorizontal className="mr-2 h-4 w-4" />
                                Filtros
                            </Button>
                        </SheetTrigger>

                        <SheetContent side="left" className="w-[85%] bg-beige-50 sm:w-[350px]">
                            <SheetHeader className="mb-3">
                                <SheetTitle className="text-left font-serif text-2xl text-[var(--color-ink)]">
                                    Refinar busqueda
                                </SheetTitle>
                            </SheetHeader>
                            <MobileFilters
                                categories={categories}
                                selectedCategories={selectedCategories}
                                toggleCategory={toggleCategory}
                                priceRange={priceRange}
                                setPriceRange={setPriceRange}
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                                selectedSizes={selectedSizes}
                                toggleSize={toggleSize}
                                selectedColors={selectedColors}
                                toggleColor={toggleColor}
                                selectedStock={selectedStock}
                                toggleStock={toggleStock}
                                selectedBrands={selectedBrands}
                                toggleBrand={toggleBrand}
                                filterDiscount={filterDiscount}
                                setFilterDiscount={setFilterDiscount}
                                brands={brands}
                                clearFilters={clearFilters}
                                onClose={() => setIsMobileFiltersOpen(false)}
                            />
                        </SheetContent>
                    </Sheet>
                </div>

                <div className="flex gap-8">
                    <div className="hidden w-64 md:block">
                        <DesktopFilters
                            categories={categories}
                            selectedCategories={selectedCategories}
                            toggleCategory={toggleCategory}
                            priceRange={priceRange}
                            setPriceRange={setPriceRange}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            clearFilters={clearFilters}
                            selectedSizes={selectedSizes}
                            selectedColors={selectedColors}
                            selectedStock={selectedStock}
                            selectedBrands={selectedBrands}
                            filterDiscount={filterDiscount}
                            toggleSize={toggleSize}
                            toggleColor={toggleColor}
                            toggleStock={toggleStock}
                            toggleBrand={toggleBrand}
                            setFilterDiscount={setFilterDiscount}
                            brands={brands}
                        />
                    </div>

                    <div className="flex-1">
                        {isLoading ? (
                            <ProductSkeletonGrid />
                        ) : (
                            <ProductGrid
                                products={paginated}
                                totalPages={totalPages}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                categories={categories}
                                selectedCategories={selectedCategories}
                                searchQuery={searchQuery}
                                toggleCategory={toggleCategory}
                                clearFilters={clearFilters}
                                sortOption={sortOption}
                                setSortOption={setSortOption}
                                getCategoryNameById={getCategoryNameById}
                            />
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
