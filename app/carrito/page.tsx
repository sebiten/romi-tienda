import { createClient } from "@/utils/supabase/server";
import CartPage from "@/components/CartPage";

const Page = async ({}) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Tareas pendientes:

  // 1. Obtener el ID del usuario:
  //    - Utilizar este ID para asociar el pedido al carrito.

  // 2. Subir la orden a la base de datos:
  //    - Verificar que la orden se guarde correctamente, que se relacione con el usuario y las dos tablas de orders orders_items.

  // 3. Gestión de pedidos:
  //    - Implementar la funcionalidad de envío o
  //    - Mostrar los pedidos en un panel de pedidos.

  // 4. Panel de administración:
  //    - Desarrollar un panel para que el admin pueda confirmar los pedidos.
  //    - Permitir al admin ver los pedidos pendientes y confirmados.
  //    - Implementar la funcionalidad de marcar un pedido como confirmado.


  // logramos crear el layuout de admin, donde se ven los pedidos pendientes y confirmados, pero no se puede marcar un pedido como confirmado.
  //    - Implementar la funcionalidad de marcar un pedido como confirmado.
  //    - Implementar la funcionalidad ver los pedidos por parte de los usuarios.

  return (
    <div>
      <CartPage user={user} />
    </div>
  );
};

export default Page;
