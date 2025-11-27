"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  MoreVertical,
  Eye,
  CheckCircle,
  AlertCircle,
  Package,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

// Tipos para los pedidos y sus detalles
interface OrderItem {
  id: string;
  product_id: string;
  order_id: string;
  quantity: number;
  price: number;
  product_title?: string;
  product_size?: string;
  product_color?: string;
}

interface Order {
  id: string;
  user_id: string;
  status: "pendiente" | "procesando" | "pagado" | "cancelado";
  created_at: string;
  updated_at: string;
  total: number;
  shipping_address: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  tracking_number?: string;
  items?: OrderItem[];
  payment_status?: "pagado" | "pendiente";
}

export default function AdminOrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isProcessingOpen, setIsProcessingOpen] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pendiente");

  const supabase = createClient();

  // Cargar pedidos
  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        setOrders(data || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(
          "No se pudieron cargar los pedidos. Por favor, intenta de nuevo."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  // Filtrar pedidos según la pestaña activa y la búsqueda
  const filteredOrders = orders.filter((order) => {
    // Filtrar por estado
    if (activeTab !== "todos" && order.status !== activeTab) return false;

    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.id.toLowerCase().includes(query) ||
        order.customer_name.toLowerCase().includes(query) ||
        order.customer_email.toLowerCase().includes(query) ||
        (order.tracking_number &&
          order.tracking_number.toLowerCase().includes(query))
      );
    }

    return true;
  });

  // Cargar detalles de un pedido
  const loadOrderDetails = async (order: Order) => {
    try {
      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select(
          `
          *,
          products:product_id (
            title,
            sizes,
            colors
          )
        `
        )
        .eq("order_id", order.id);

      if (itemsError) throw itemsError;

      // Formatear los items con la información del producto
      const formattedItems = items.map((item) => ({
        ...item,
        product_title: item.products?.title || "Producto no disponible",
        product_size: item.products?.sizes || "N/A",
        product_color: item.products?.colors || "N/A",
      }));

      setSelectedOrder({
        ...order,
        items: formattedItems,
      });

      setIsDetailsOpen(true);
    } catch (err) {
      console.error("Error loading order details:", err);
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles del pedido",
        variant: "destructive",
      });
    }
  };

  // Procesar un pedido
  const processOrder = async () => {
    if (!selectedOrder) return;

    try {
      setProcessingOrder(true);

      // 1. Actualizar el estado del pedido a "procesando"
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "procesando",
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedOrder.id);

      if (updateError) throw updateError;

      // 2. Descontar el stock de los productos
      if (selectedOrder.items && selectedOrder.items.length > 0) {
        for (const item of selectedOrder.items) {
          // Obtener el stock actual
          const { data: product, error: productError } = await supabase
            .from("products")
            .select("stock")
            .eq("id", item.product_id)
            .single();

          if (productError) {
            console.error(
              `Error fetching product ${item.product_id}:`,
              productError
            );
            continue;
          }

          if (!product) continue;

          // Calcular el nuevo stock
          const newStock = Math.max(0, (product.stock || 0) - item.quantity);

          // Actualizar el stock
          const { error: stockError } = await supabase
            .from("products")
            .update({ stock: newStock })
            .eq("id", item.product_id);

          if (stockError) {
            console.error(
              `Error updating stock for product ${item.product_id}:`,
              stockError
            );
          }
        }
      }

      // 3. Actualizar la UI
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === selectedOrder.id
            ? { ...order, status: "procesando" }
            : order
        )
      );

      toast({
        title: "Pedido procesado",
        description: `El pedido #${selectedOrder.id.slice(-6)} ha sido procesado correctamente y el stock ha sido actualizado.`,
      });

      // 4. Cerrar el diálogo
      setIsProcessingOpen(false);
      setSelectedOrder(null);
    } catch (err) {
      console.error("Error processing order:", err);
      toast({
        title: "Error",
        description:
          "No se pudo procesar el pedido. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setProcessingOrder(false);
    }
  };

  // Formatear fecha con manejo de errores
  const formatDate = (dateString: string) => {
    if (!dateString) return "Fecha no disponible";

    try {
      const date = new Date(dateString);

      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return "Fecha inválida";
      }

      return new Intl.DateTimeFormat("es-MX", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return "Error en formato de fecha";
    }
  };

  // Renderizar el badge de estado
  const renderStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "pendiente":
        return (
          <Badge
            variant="outline"
            className="bg-amber-100 text-amber-700 border-amber-200"
          >
            Pendiente
          </Badge>
        );
      case "procesando":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-700 border-blue-200"
          >
            Procesando
          </Badge>
        );
      case "pagado":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-700 border-green-200"
          >
            pagado
          </Badge>
        );
      case "cancelado":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-700 border-red-200"
          >
            Cancelado
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-700 border-gray-200"
          >
            {status}
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-10 h-10 text-beige-500 animate-spin mr-2" />
        <span className="text-beige-600">Cargando pedidos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-white border-beige-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="text-center py-6">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-beige-800 mb-2">
              Error al cargar los pedidos
            </h3>
            <p className="text-beige-600 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-beige-700 hover:bg-beige-800 text-beige-50"
            >
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white border-beige-200 shadow-sm mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl text-beige-800">Pedidos</CardTitle>
              <CardDescription>
                Gestiona los pedidos de tus clientes
              </CardDescription>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-beige-500" />
              <Input
                type="text"
                placeholder="Buscar pedidos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 border-beige-200 bg-beige-50 focus:border-beige-300 w-full"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs
            defaultValue="pendiente"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="bg-beige-100 text-beige-700 p-0 h-auto mb-4">
              <TabsTrigger
                value="pendiente"
                className="py-2 px-4 data-[state=active]:bg-white data-[state=active]:text-beige-800 data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-beige-700"
              >
                Pendientes
              </TabsTrigger>
              <TabsTrigger
                value="pagado"
                className="py-2 px-4 data-[state=active]:bg-white data-[state=active]:text-beige-800 data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-beige-700"
              >
                Pagados
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">

              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 bg-beige-50/50 rounded-lg border border-beige-100">
                  <Package className="w-12 h-12 text-beige-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-beige-800 mb-1">
                    No hay pedidos{" "}
                    {activeTab !== "todos" ? activeTab + "s" : ""}
                  </h3>
                  <p className="text-beige-600">
                    {activeTab === "pendiente"
                      ? "No hay pedidos pendientes para procesar."
                      : activeTab === "procesando"
                        ? "No hay pedidos en proceso actualmente."
                        : activeTab === "pagados"
                          ? "No hay pedidos pagados."
                          : "No se encontraron pedidos con los filtros actuales."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-beige-50/70 hover:bg-beige-50">
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow
                          key={order.id}
                          className="hover:bg-beige-50/50"
                        >
                          <TableCell className="font-medium">
                            #{order.id.slice(-6)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{order.user_id}</div>
                              <div className="text-sm text-beige-600">
                                {order.payment_status}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(order.created_at)}</TableCell>
                          <TableCell>
                            ${order.total.toLocaleString("es-AR")}
                          </TableCell>
                          <TableCell>
                            {renderStatusBadge(order.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Abrir menú</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="bg-white border-beige-200"
                              >
                                <DropdownMenuItem
                                  onClick={() => loadOrderDetails(order)}
                                  className="cursor-pointer text-beige-700 focus:text-beige-800 focus:bg-beige-50"
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  <span>Ver detalles</span>
                                </DropdownMenuItem>

                                {order.status === "pendiente" && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setIsProcessingOpen(true);
                                    }}
                                    className="cursor-pointer text-beige-700 focus:text-beige-800 focus:bg-beige-50"
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    <span>Procesar pedido</span>
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Diálogo de detalles del pedido */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="bg-white border-beige-200 sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-beige-800">
              Detalles del Pedido #{selectedOrder?.id.slice(-6)}
            </DialogTitle>
            <DialogDescription>
              {selectedOrder?.created_at
                ? formatDate(selectedOrder.created_at)
                : "Fecha no disponible"}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-beige-700 mb-1">
                    Cliente
                  </h4>
                  <p className="text-beige-800">
                    {selectedOrder.customer_name}
                  </p>
                  <p className="text-sm text-beige-600">
                    {selectedOrder.customer_email}
                  </p>
                  {selectedOrder.customer_phone && (
                    <p className="text-sm text-beige-600">
                      {selectedOrder.customer_phone}
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-beige-700 mb-1">
                    Dirección de envío
                  </h4>
                  <p className="text-sm text-beige-800 whitespace-pre-line">
                    {selectedOrder.shipping_address}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-beige-700 mb-2">
                  Productos
                </h4>
                <div className="border rounded-md border-beige-200 divide-y divide-beige-100">
                  {selectedOrder.items?.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium text-beige-800">
                          {item.product_title}
                        </p>
                        <div className="text-xs text-beige-600 mt-1">
                          <span>Talla: {item.product_size}</span>
                          <span className="mx-2">•</span>
                          <span>Color: {item.product_color}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-beige-800">
                          ${item.price.toLocaleString("es-MX")}
                        </p>
                        <p className="text-xs text-beige-600">
                          Cantidad: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-beige-100 pt-4">
                <div className="flex justify-between text-beige-600">
                  <span>Subtotal</span>
                  <span>
                    ${(selectedOrder.total - 150).toLocaleString("es-MX")}
                  </span>
                </div>
                <div className="flex justify-between text-beige-600 mt-1">
                  <span>Envío</span>
                  <span>$2500.00</span>
                </div>
                <div className="flex justify-between font-medium text-beige-800 text-lg mt-2">
                  <span>Total</span>
                  <span>${selectedOrder.total.toLocaleString("es-MX")}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div>
                  <span className="text-sm text-beige-600 mr-2">Estado:</span>
                  {renderStatusBadge(selectedOrder.status)}
                </div>

                {selectedOrder.status === "pendiente" && (
                  <Button
                    onClick={() => {
                      setIsDetailsOpen(false);
                      setIsProcessingOpen(true);
                    }}
                    className="bg-beige-700 hover:bg-beige-800 text-beige-50"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Procesar pedido
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para procesar pedido */}
      <Dialog open={isProcessingOpen} onOpenChange={setIsProcessingOpen}>
        <DialogContent className="bg-white border-beige-200">
          <DialogHeader>
            <DialogTitle className="text-beige-800">
              Procesar Pedido
            </DialogTitle>
            <DialogDescription>
              Al procesar este pedido, se descontará el stock de los productos.
            </DialogDescription>
          </DialogHeader>

          <p className="text-beige-600">
            ¿Estás seguro de que deseas procesar el pedido #
            {selectedOrder?.id.slice(-6)}? Esta acción actualizará el inventario
            y no se puede deshacer.
          </p>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsProcessingOpen(false)}
              className="border-beige-200 text-beige-700"
              disabled={processingOrder}
            >
              Cancelar
            </Button>
            <Button
              onClick={processOrder}
              className="bg-beige-700 hover:bg-beige-800 text-beige-50"
              disabled={processingOrder}
            >
              {processingOrder ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirmar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
