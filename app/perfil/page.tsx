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

  // Extraemos información relevante del usuario
  const email = user.email;
  const avatar =
    user.user_metadata?.avatar_url ||
    "https://via.placeholder.com/150"; // URL de respaldo en caso de no tener avatar
  const fullName = user.user_metadata?.full_name || "Usuario";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <div className="flex flex-col items-center">
          <img
            src={avatar}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover"
          />
          <h1 className="mt-4 text-2xl font-bold">{fullName}</h1>
          <p className="text-gray-600">{email}</p>
        </div>
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Detalles de Perfil</h2>
          <p>
            <span className="font-medium">ID de Usuario:</span> {user.id}
          </p>
          {/* Aquí puedes agregar más detalles o secciones según tus necesidades */}
        </div>
        {/* <div className="mt-6">
          <SignOutButton />
        </div> */}
      </div>
    </div>
  );
}
