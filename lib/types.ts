export interface ProductVariant {
  color: string;
  size: string; // "XS" | "S" | "M" | "L" | "XL" | "XXL"
  stock: number;
}

export interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  images: string[] | undefined;

  // Compatibilidad con productos viejos
  sizes?: string[];
  colors?: string[];
  stock: number | null;

  // Nuevo: variantes color+talle+stock
  variants?: ProductVariant[];

  category_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  quantity: number;
  image: string;

  // Variante seleccionada
  size: string;
  color: string;
  variantStock?: number; // opcional

  product_id: string;
}

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;

  size?: string;
  color?: string;
  price?: number;

  product?: Product;
};

export type Profile = {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  user_phone?: string;
};

export type Order = {
  id: string;
  user_id: string;
  created_at: string;
  status: string;
  shipping_cost?: number;
  payment_method?: string;
  shipping_address?: string;
  notes?: string;

  profiles?: Profile;
  items?: OrderItem[];
};
