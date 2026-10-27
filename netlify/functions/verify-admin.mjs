import { createClient } from "@supabase/supabase-js";

export default async function handler(request) {
  if (request.method !== "GET") {
    return Response.json(
      { ok: false, error: "Método no permitido" },
      { status: 405 }
    );
  }

  const authHeader = request.headers.get("authorization") || "";

  if (!authHeader.startsWith("Bearer ")) {
    return Response.json(
      { ok: false, error: "Sesión requerida" },
      { status: 401 }
    );
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return Response.json(
      { ok: false, error: "Sesión inválida" },
      { status: 401 }
    );
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SECRET_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // Verificamos el token con Supabase Auth.
    const { data: userData, error: userError } =
      await supabase.auth.getUser(token);

    if (userError || !userData?.user) {
      return Response.json(
        { ok: false, error: "Sesión no válida" },
        { status: 401 }
      );
    }

    // Comprobamos que el usuario tenga permiso administrativo.
    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (adminError) {
      console.error("Error verificando administrador:", adminError);

      return Response.json(
        { ok: false, error: "No se pudo verificar el acceso" },
        { status: 500 }
      );
    }

    if (!admin) {
      return Response.json(
        { ok: false, error: "Acceso no autorizado" },
        { status: 403 }
      );
    }

    return Response.json({
      ok: true,
      isAdmin: true,
    });
  } catch (error) {
    console.error("Error de verificación:", error);

    return Response.json(
      { ok: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export const config = {
  path: "/api/verify-admin",
};