import { createClient } from "@supabase/supabase-js";

function respond(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function validUUID(value) {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value
    )
  );
}

export default async function handler(request) {
  if (request.method !== "POST") {
    return respond(
      { ok: false, error: "Método no permitido." },
      405
    );
  }

  const authHeader =
    request.headers.get("authorization") || "";

  if (!authHeader.startsWith("Bearer ")) {
    return respond(
      { ok: false, error: "Sesión requerida." },
      401
    );
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return respond(
      { ok: false, error: "Sesión inválida." },
      401
    );
  }

  try {
    const url = process.env.SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SECRET_KEY;

    if (!url || !secretKey) {
      console.error("Faltan variables de Supabase.");

      return respond(
        { ok: false, error: "Servicio no disponible." },
        500
      );
    }

    const supabase = createClient(url, secretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Verificar la identidad del usuario.
    const { data: userData, error: userError } =
      await supabase.auth.getUser(token);

    if (userError || !userData?.user) {
      return respond(
        { ok: false, error: "Sesión no válida." },
        401
      );
    }

    // Verificar los permisos administrativos.
    const { data: admin, error: adminError } =
      await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", userData.user.id)
        .maybeSingle();

    if (adminError) {
      console.error(
        "Error verificando administrador:",
        adminError.code
      );

      return respond(
        { ok: false, error: "Error verificando permisos." },
        500
      );
    }

    if (!admin) {
      return respond(
        { ok: false, error: "Acceso no autorizado." },
        403
      );
    }

    // Leer y validar los datos recibidos.
    const raw = await request.text();

    if (raw.length > 5000) {
      return respond(
        { ok: false, error: "Solicitud demasiado grande." },
        413
      );
    }

    let body;

    try {
      body = JSON.parse(raw);
    } catch {
      return respond(
        { ok: false, error: "JSON inválido." },
        400
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return respond(
        { ok: false, error: "Datos inválidos." },
        400
      );
    }

    const { reservationId, teamId } = body;

    if (
      !validUUID(reservationId) ||
      !validUUID(teamId)
    ) {
      return respond(
        {
          ok: false,
          error: "Reservación o equipo inválido.",
        },
        400
      );
    }

    // Asignar y confirmar dentro de una
    // única operación de la base de datos.
    const { error: confirmationError } =
      await supabase.rpc(
        "confirm_reservation_with_team",
        {
          p_reservation_id: reservationId,
          p_team_id: teamId,
        }
      );

    if (confirmationError) {
  console.error("ERROR REAL DE SUPABASE:", {
    code: confirmationError.code,
    message: confirmationError.message,
    details: confirmationError.details,
    hint: confirmationError.hint,
  });

  return respond(
    {
      ok: false,
      error: "No se pudo completar la confirmación. Revisa la terminal de Netlify para conocer el motivo.",
    },
    409
  );
}

    return respond({
      ok: true,
      message:
        "¡Reservación confirmada y equipo asignado correctamente!",
    });
  } catch (error) {
    console.error(
      "Error interno confirmando reservación:",
      error
    );

    return respond(
      {
        ok: false,
        error: "Error interno del servidor.",
      },
      500
    );
  }
}

export const config = {
  path: "/api/confirm-reservation",
};