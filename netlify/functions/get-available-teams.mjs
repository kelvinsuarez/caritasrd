import { createClient } from "@supabase/supabase-js";

function respond(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) {
    return false;
  }

  const date = new Date(`${value}T12:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

function validTime(value) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value ?? "");
}

function toMinutes(time) {
  const [hours, minutes] = time.slice(0, 5).split(":").map(Number);
  return hours * 60 + minutes;
}

export default async function handler(request) {
  if (request.method !== "GET") {
    return respond(
      { ok: false, error: "Método no permitido." },
      405
    );
  }

  const authHeader = request.headers.get("authorization") || "";

  if (!authHeader.startsWith("Bearer ")) {
    return respond(
      { ok: false, error: "Sesión requerida." },
      401
    );
  }

  try {
    const token = authHeader.slice(7).trim();

    if (!token) {
      return respond(
        { ok: false, error: "Sesión inválida." },
        401
      );
    }

    const url = process.env.SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SECRET_KEY;

    if (!url || !secretKey) {
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

    // Verificar identidad.
    const { data: userData, error: userError } =
      await supabase.auth.getUser(token);

    if (userError || !userData?.user) {
      return respond(
        { ok: false, error: "Sesión no válida." },
        401
      );
    }

    // Verificar permisos administrativos.
    const { data: admin, error: adminError } =
      await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", userData.user.id)
        .maybeSingle();

    if (adminError) {
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

    const params = new URL(request.url).searchParams;

    const date = params.get("date");
    const time = params.get("time");
    const duration = Number(params.get("duration"));

    if (
      !validDate(date) ||
      !validTime(time) ||
      !Number.isInteger(duration) ||
      duration < 2 ||
      duration > 5
    ) {
      return respond(
        { ok: false, error: "Fecha, hora o duración inválida." },
        400
      );
    }

    // Consultar los equipos activos.
    const { data: teams, error: teamsError } =
      await supabase
        .from("teams")
        .select("id, name, active")
        .eq("active", true)
        .order("name");

    if (teamsError) {
      return respond(
        { ok: false, error: "No se pudieron consultar los equipos." },
        500
      );
    }

    // Consultar las asignaciones de eventos confirmados.
    const { data: assignments, error: assignmentsError } =
      await supabase
        .from("team_assignments")
        .select(`
          team_id,
          reservations!inner (
            event_date,
            start_time,
            duration,
            status
          )
        `)
        .in("reservations.status", ["confirmada", "completada"]);

    if (assignmentsError) {
      console.error(
        "Error consultando asignaciones:",
        assignmentsError.code
      );

      return respond(
        { ok: false, error: "No se pudo consultar la disponibilidad." },
        500
      );
    }

    const requestedStart = toMinutes(time);
    const requestedEnd = requestedStart + duration * 60;

    const result = (teams || []).map((team) => {
      const occupied = (assignments || []).some((assignment) => {
        if (assignment.team_id !== team.id) {
          return false;
        }

        const reservation = assignment.reservations;

        if (!reservation) return false;

        // Comparar instantes absolutos para contemplar
        // eventos que terminen después de medianoche.
        const existingStart = Date.parse(
          `${reservation.event_date}T${reservation.start_time.slice(0, 5)}:00Z`
        );

        const requestedStartDate = Date.parse(
          `${date}T${time}:00Z`
        );

        const existingEnd =
          existingStart + Number(reservation.duration) * 3600000;

        const requestedEndDate =
          requestedStartDate + duration * 3600000;

        const buffer = 45 * 60000;

        return (
          requestedStartDate < existingEnd + buffer &&
          requestedEndDate + buffer > existingStart
        );
      });

      return {
        id: team.id,
        name: team.name,
        available: !occupied,
      };
    });

    return respond({
      ok: true,
      teams: result,
      availableTeams: result.filter((team) => team.available).length,
    });
  } catch (error) {
    console.error("Error consultando equipos:", error);

    return respond(
      { ok: false, error: "Error interno del servidor." },
      500
    );
  }
}

export const config = {
  path: "/api/get-available-teams",
};