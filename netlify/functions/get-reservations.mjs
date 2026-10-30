import { createClient } from "@supabase/supabase-js";

export default async function handler(request) {
  if (request.method !== "GET") {
    return Response.json(
      { ok: false, error: "Método no permitido" },
      { status: 405 }
    );
  }

  const authHeader =
    request.headers.get("authorization") || "";

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

    // Verificar la identidad del usuario.
    const { data: userData, error: userError } =
      await supabase.auth.getUser(token);

    if (userError || !userData?.user) {
      return Response.json(
        { ok: false, error: "Sesión no válida" },
        { status: 401 }
      );
    }

    // Comprobar los permisos administrativos.
    const { data: admin, error: adminError } =
      await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", userData.user.id)
        .maybeSingle();

    if (adminError) {
      console.error(
        "Error verificando administrador:",
        adminError
      );

      return Response.json(
        { ok: false, error: "Error verificando permisos" },
        { status: 500 }
      );
    }

    if (!admin) {
      return Response.json(
        { ok: false, error: "Acceso no autorizado" },
        { status: 403 }
      );
    }

    // Obtener las reservaciones, de las más recientes
    // a las más antiguas.
    const { data: reservations, error: queryError } =
      await supabase
        .from("reservations")
        .select(`
            id,
            full_name,
            whatsapp,
            email,
            event_type,
            event_date,
            start_time,
            end_time,
            duration,
            services,
            children_count,
            address,
            theme,
            birthday_age,
            notes,
            photo_authorization,
            status,
            created_at,
            team_assignments (
                team_id,
                teams (
                    id,
                    name
                )
            )
        `)
        .order("created_at", { ascending: false })
        .limit(100);

    if (queryError) {
      console.error(
        "Error consultando reservaciones:",
        queryError
      );

      return Response.json(
        { ok: false, error: "No se pudieron cargar las reservaciones" },
        { status: 500 }
      );
    }

    return Response.json({
      ok: true,
      reservations: reservations || [],
    });
  } catch (error) {
    console.error(
      "Error interno consultando reservaciones:",
      error
    );

    return Response.json(
      { ok: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export const config = {
  path: "/api/get-reservations",
};