import { createClient } from "@supabase/supabase-js";

const allowedStatuses = new Set([
  "pendiente",
  "en_revision",
  "confirmada",
  "completada",
  "cancelada",
]);

function respond(data, status = 200) {
  return Response.json(data, { status });
}

export default async function handler(request) {
  if (request.method !== "PATCH") {
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

    // 1. Verificar la sesión del usuario.

    const { data: userData, error: userError } =
      await supabase.auth.getUser(token);

    if (userError || !userData?.user) {
      return respond(
        { ok: false, error: "Sesión no válida." },
        401
      );
    }

    // 2. Verificar que sea administrador.

    const { data: admin, error: adminError } =
      await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", userData.user.id)
        .maybeSingle();

    if (adminError) {
      console.error(
        "Error verificando permisos:",
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

    // 3. Leer y validar la solicitud.

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

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return respond(
        { ok: false, error: "Datos inválidos." },
        400
      );
    }

    const { reservationId, status } = body;

    const validId =
      typeof reservationId === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        reservationId
      );

    if (!validId || !allowedStatuses.has(status)) {
      return respond(
        { ok: false, error: "Reservación o estado inválido." },
        400
      );
    }

    // 4. Consultar el estado actual.

    const { data: reservation, error: lookupError } =
      await supabase
        .from("reservations")
        .select("id, status, event_date, start_time, duration")
        .eq("id", reservationId)
        .maybeSingle();

    if (lookupError) {

      console.error(
        "Error consultando reservación:",
        lookupError.code
      );

      return respond(
        { ok: false, error: "No se pudo consultar la reservación." },
        500
      );
    }

    if (!reservation) {
      return respond(
        { ok: false, error: "Reservación no encontrada." },
        404
      );
    }

    if (
  reservation.status === "completada" ||
  reservation.status === "cancelada"
) {
  return respond(
    {
      ok: false,
      error:
        "Esta reservación tiene un estado final " +
        "y no admite modificaciones.",
    },
    409
  );
}
    

    // La confirmación requiere validar y asignar
    // un equipo disponible. Se implementará aparte.

    if (
      status === "confirmada" &&
      reservation.status !== "confirmada"
    ) {
      return respond(
        {
          ok: false,
          error:
            "Para confirmar una reservación primero debemos validar y asignar un equipo disponible.",
        },
        409
      );
    }

    // Evitar modificaciones de eventos ya confirmados
    // hasta integrar la gestión de asignaciones.

    if (
  reservation.status === "confirmada" &&
  status !== "confirmada" &&
  status !== "completada"
) {
  return respond(
    {
      ok: false,
      error:
        "Una reservación confirmada solo puede marcarse como completada desde esta función. Otros cambios requieren un proceso especial.",
    },
    409
  );
}

if (
  status === "completada" &&
  reservation.status !== "confirmada"
) {
  return respond(
    {
      ok: false,
      error:
        "Solo se puede completar una reservación previamente confirmada.",
    },
    409
  );
}

if (status === "completada") {
  const eventDate = reservation.event_date;
  const startTime = reservation.start_time;
  const duration = Number(reservation.duration);

  const [year, month, day] = eventDate
    .split("-")
    .map(Number);

  const [hours, minutes, seconds = 0] = startTime
    .split(":")
    .map(Number);

  const eventEndTime = Date.UTC(
    year,
    month - 1,
    day,
    hours + 4 + duration,
    minutes,
    seconds
  );

  if (Date.now() < eventEndTime) {
    return respond(
      {
        ok: false,
        error:
          "Este evento todavía no ha finalizado. " +
          "Podrás marcarlo como completado después " +
          "de su hora de finalización.",
      },
      409
    );
  }
}

    // 5. Actualizar solamente el estado.
    // Se comprueba el estado anterior para detectar
    // modificaciones realizadas desde otra sesión.

    const { data: updated, error: updateError } =
      await supabase
        .from("reservations")
        .update({ status })
        .eq("id", reservationId)
        .eq("status", reservation.status)
        .select("id, status, event_date, start_time, duration")
        .maybeSingle();

    if (updateError) {
      console.error(
        "Error actualizando reservación:",
        updateError.code
      );

      return respond(
        { ok: false, error: "No se pudo actualizar el estado." },
        500
      );
    }

    if (!updated) {
      return respond(
        {
          ok: false,
          error:
            "La reservación cambió mientras la editabas. Actualiza los datos e inténtalo nuevamente.",
        },
        409
      );
    }

    return respond({
      ok: true,
      message: "Estado actualizado correctamente.",
      reservation: updated,
    });
  } catch (error) {
    console.error(
      "Error interno actualizando reservación:",
      error
    );

    return respond(
      { ok: false, error: "Error interno del servidor." },
      500
    );
  }
}

export const config = {
  path: "/api/update-reservation-status",
};