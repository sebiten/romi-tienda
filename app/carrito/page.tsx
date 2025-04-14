import { createClient } from "@/utils/supabase/server";
import CartPage from "@/components/CartPage";

const Page = async ({}) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  return (
    <div>
      <CartPage user={user} />
    </div>
  );
};

export default Page;
