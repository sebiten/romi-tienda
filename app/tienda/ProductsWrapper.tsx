import ProductsClient from "./ProductsClient";

export default function ProductsWrapper({ products, categories }: any) {
    return <ProductsClient products={products} categories={categories} />;
}
