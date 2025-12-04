// ----------------------------
// PRODUCT VARIANTS
// ----------------------------
export interface ProductVariant {
  color: string;
  size: string; // XS | S | M | L | XL | etc.
  stock: number;
}

// ----------------------------
// PRODUCT
// ----------------------------
export interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  images: string[] | undefined;

  // Productos viejos sin variantes
  sizes?: string[];
  colors?: string[];
  stock: number | null;

  // Productos nuevos con variantes
  variants?: ProductVariant[];

  category_id: string;
  created_at?: string;
  updated_at?: string;
}

// ----------------------------
// CART ITEM
// ----------------------------
export interface CartItem {
  id: string;
  name: string;

  price: number;
  originalPrice: number;

  quantity: number;
  image: string;

  size: string;
  color: string;

  // stock de la variante seleccionada
  variantStock?: number;

  product_id: string;
}

// ----------------------------
// ORDER ITEM
// ----------------------------
export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;

  quantity: number;

  size?: string;
  color?: string;

  // Guardamos unit price por item
  unit_price?: number;

  // precio total (opcional)
  price?: number;

  product?: Product;
};

// ----------------------------
// PROFILE (TABLA PROFILES)
// ----------------------------
export type Profile = {
  id: string;
  username: string | null;

  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;

  user_phone?: string | null;
};

// ----------------------------
// ORDER (TABLA ORDERS)
// ----------------------------
export type Order = {
  id: string;
  user_id: string;
  created_at: string;
  order_status: string;
  // Estado del pedido
  status: string; // "pending", "paid", "cancelled", etc.
  discount?: number | null;
  shipping_amount?: number | null;
  // Totales
  total?: number | null;
  shipping_cost?: number | null;

  // Método de pago
  payment_method?: string | null;

  // Campos nuevos de ENVÍO
  shipping_name?: string | null;
  shipping_phone?: string | null;
  shipping_address?: string | null;
  shipping_city?: string | null;
  shipping_province?: string | null;
  shipping_cp?: string | null;

  // Notas del cliente
  notes?: string | null;

  // Mercado Pago
  mp_preference_id?: string | null;
  mp_payment_id?: string | null;

  payment_status?: string | null; // approved, rejected, pending
  payment_status_detail?: string | null; // detalle técnico
  payment_raw?: any; // JSON crudo del pago MP

  // Relaciones
  profiles?: Profile;
  items?: OrderItem[];
};
