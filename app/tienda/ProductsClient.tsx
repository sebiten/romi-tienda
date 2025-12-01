"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import DesktopFilters from "./DesktopFilters";
import ProductGrid from "@/components/ProductGrid";
import ProductSkeletonGrid from "@/components/skeletons/ProductSkeleton";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import MobileFilters from "./MobileFilters";
import { DialogTitle } from "@radix-ui/react-dialog";

export default function ProductsClient({ products, categories }: any) {

    // -----------------------------
    // ESTADOS
    // -----------------------------
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

    const brands = ["Nike", "Adidas", "Vans", "Jordan"];

    // 🔥 AGREGADO: estado de loader
    const [isLoading, setIsLoading] = useState(false);

    // -----------------------------
    // TOGGLES
    // -----------------------------
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
            prev.includes(value)
                ? prev.filter((v) => v !== value)
                : [...prev, value]
        );
    };

    const toggleBrand = (brand: string) => {
        setSelectedBrands((prev) =>
            prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
        );
    };

    // -----------------------------
    // LOADER cuando cambian filtros
    // -----------------------------
    useEffect(() => {
        setIsLoading(true);
        const t = setTimeout(() => setIsLoading(false), 300); // 300ms — simple, suave
        return () => clearTimeout(t);
    }, [
        selectedCategories,
        priceRange,
        searchQuery,
        sortOption,
        selectedSizes,
        selectedColors,
        selectedStock,
        selectedBrands,
        filterDiscount
    ]);


    // -----------------------------
    // FILTRADO
    // -----------------------------
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
                (p) =>
                    p.title.toLowerCase().includes(q) ||
                    p.description?.toLowerCase().includes(q)
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
                if (selectedStock.includes("low_stock") && p.stock <= 5 && p.stock > 0)
                    return true;
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
                result.sort(
                    (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                );
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
                result.sort(
                    (a, b) => (b.discount || 0) - (a.discount || 0)
                );
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
        filterDiscount
    ]);

    // -----------------------------
    // PAGINACIÓN
    // -----------------------------
    const productsPerPage = 9;
    const totalPages = Math.ceil(filtered.length / productsPerPage);

    const paginated = useMemo(() => {
        const start = (currentPage - 1) * productsPerPage;
        return filtered.slice(start, start + productsPerPage);
    }, [filtered, currentPage]);

    // -----------------------------
    // OTROS
    // -----------------------------
    const toggleCategory = useCallback((id: string) => {
        setSelectedCategories((prev) =>
            prev.includes(id)
                ? prev.filter((c) => c !== id)
                : [...prev, id]
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
        return found?.name ?? "Sin categoría";
    };

    // -----------------------------
    // RENDER
    // -----------------------------
    return (
        <main className="bg-beige-50 min-h-screen py-12 px-4">
            <div className="container mx-auto max-w-7xl">

                {/* MOBILE FILTER BUTTON */}
                <div className="flex justify-between items-center mb-6 md:hidden">
                    <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
                        <SheetTrigger asChild>
                            <DialogTitle>
                                <Button
                                    variant="outline"
                                    className="md:hidden border-beige-300 text-beige-700"
                                    onClick={() => setIsMobileFiltersOpen(true)}
                                >
                                    Filtros
                                </Button>
                            </DialogTitle>
                        </SheetTrigger>

                        <SheetContent side="left" className="w-[85%] sm:w-[350px] bg-beige-50">
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

                {/* LAYOUT */}
                <div className="flex gap-8">

                    {/* DESKTOP FILTERS */}
                    <div className="hidden md:block w-64">
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

                    {/* PRODUCT GRID + LOADER */}
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
