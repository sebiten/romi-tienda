import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Perfil() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex flex-col gap-4">
      <h1>Perfil</h1>
    </div>
  );
}
