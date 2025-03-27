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

export interface CartItem {
    id: string
    name: string
    price: number
    originalPrice: number
    quantity: number
    image: string
    size: string
    color: string
    product_id: string
  }
  export interface OrderItem {
    id: string
    product_id: string
    order_id: string
    quantity: number
    price: number
    size?: string
    color?: string
    product?: {
      title: string
      sizes: string[]
      colors: string[]
    }
  }
  
  export interface Order {
    id: string
    user_id: string
    status: "pendiente" | "procesando" | "completado" | "cancelado"
    created_at: string
    updated_at: string
    total: number
    shipping_address: string
    customer_name: string
    customer_email: string
    customer_phone?: string
    tracking_number?: string
    payment_status?: "pagado" | "pendiente"
  }
  
  