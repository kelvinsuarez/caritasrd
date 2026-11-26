
import { createClient } from "@supabase/supabase-js";

function respond(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export default async function handler(request) {
  // Permitir únicamente solicitudes GET.
  if (request.method !== "GET") {
    return Response.json(
      {
        ok: false,
        error: "Método no permitido.",
      },
      {
        status: 405,
        headers: {
          Allow: "GET",
          "Cache-Control": "no-store",
        },
      }
    );
  }

  try {
    // Verificar que exista un token de sesión.
    const authorization =
      request.headers.get("authorization") || "";

    const match = authorization.match(/^Bearer\s+(\S+)$/i);

    if (!match) {
      return respond(
        {
          ok: false,
          error: "No autorizado.",
        },
        401
      );
    }

    const token = match[1];

    // Configuración privada de Supabase.
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseSecretKey) {
      console.error("Configuración de Supabase incompleta.");

      return respond(
        {
          ok: false,
          error: "Servicio temporalmente no disponible.",
        },
        500
      );
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseSecretKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // Validar la sesión del usuario.
    const { data: userData, error: userError } =
      await supabase.auth.getUser(token);

    if (userError || !userData?.user) {
      return respond(
        {
          ok: false,
          error: "Sesión inválida o expirada.",
        },
        401
      );
    }

    // Comprobar que el usuario sea administrador.
    const { data: adminData, error: adminError } =
      await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", userData.user.id)
        .maybeSingle();

    if (adminError) {
      console.error(
        "Error al verificar administrador:",
        adminError.code
      );

      return respond(
        {
          ok: false,
          error: "No fue posible verificar los permisos.",
        },
        500
      );
    }

    if (!adminData) {
      return respond(
        {
          ok: false,
          error: "Acceso restringido a administradores.",
        },
        403
      );
    }

    // Configurar la paginación.
    const url = new URL(request.url);

    const page = Number(
      url.searchParams.get("page") ?? "1"
    );

    const limit = Number(
      url.searchParams.get("limit") ?? "25"
    );

    if (
      !Number.isSafeInteger(page) ||
      page < 1 ||
      page > 10000 ||
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      return respond(
        {
          ok: false,
          error: "Parámetros de paginación inválidos.",
        },
        400
      );
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Consultar las cotizaciones registradas.
    
// Consultar las cotizaciones registradas.
const { data, error, count } = await supabase
  .from("quotations")
  .select(
    `
      id,
      created_at,
      full_name,
      whatsapp,
      email,
      event_type,
      event_date,
      start_time,
      duration,
      services,
      children_count,
      hair_party_girls,
      glitter_participants,
      location_type,
      province,
      municipality,
      coverage_status,
      quotation_details,
      estimated_total,
      notes,
      status,
      email_status,
      email_sent_at,
      email_message_id,
      email_error
    `,
    {
      count: "exact",
    }
  )
  .order("created_at", {
    ascending: false,
  })
  .order("id", {
    ascending: false,
  })
  .range(from, to);


    
if (error) {
  console.error(
    "Error al consultar cotizaciones:",
    {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    }
  );


      return respond(
        {
          ok: false,
          error: "No fue posible consultar las cotizaciones.",
        },
        500
      );
    }

    // Devolver los resultados al panel administrativo.
    return respond({
      ok: true,
      quotations: data || [],
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    });

  } catch (error) {
    console.error(
      "Error inesperado al consultar cotizaciones:",
      error?.name || "UNKNOWN"
    );

    return respond(
      {
        ok: false,
        error: "Ocurrió un error al consultar las cotizaciones.",
      },
      500
    );
  }
}

export const config = {
  path: "/api/get-quotations",
};
