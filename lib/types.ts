export interface Product {
    id: string;
    title: string;
    description: string | null;
    price: number | null;
    images?: string[];
    sizes?: string[];
    colors?: string[];
    stock: number | null;
    category_id: string;
    created_at?: string;
    updated_at?: string;
}
