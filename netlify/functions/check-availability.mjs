import { createClient } from "@supabase/supabase-js";

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

const headers = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};

const respond = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers,
  });

export default async (request) => {
  // Solo permitir consultas GET.
  if (request.method !== "GET") {
    return respond(405, {
      ok: false,
      message: "Método no permitido.",
    });
  }

  try {
    const url = new URL(request.url);

    const eventDate = url.searchParams.get("date");
    const startTime = url.searchParams.get("time");
    const durationText = url.searchParams.get("duration");

    // Validar los datos recibidos.
    const validDate =
      /^\d{4}-\d{2}-\d{2}$/.test(eventDate ?? "") &&
      !Number.isNaN(Date.parse(`${eventDate}T00:00:00Z`));

    const validTime =
      /^([01]\d|2[0-3]):[0-5]\d$/.test(startTime ?? "");

    const validDuration =
      /^[2-5]$/.test(durationText ?? "");

    if (!validDate || !validTime || !validDuration) {
      return respond(400, {
        ok: false,
        message: "Fecha, hora o duración no válida.",
      });
    }

    const { data, error } = await supabase.rpc(
      "check_event_availability",
      {
        p_event_date: eventDate,
        p_start_time: startTime,
        p_duration: Number(durationText),
      }
    );

    if (error) {
      console.error("Error al consultar disponibilidad:", error);
      return respond(500, {
        ok: false,
        message: "No pudimos consultar la disponibilidad.",
      });
    }

    const result = data?.[0];

    if (!result) {
      return respond(500, {
        ok: false,
        message: "No se recibió información de disponibilidad.",
      });
    }

    return respond(200, {
      ok: true,
      available: result.is_available,
      availableTeams: result.available_teams,
      totalTeams: result.total_teams,
    });
  } catch (error) {
    console.error("Error inesperado:", error);

    return respond(500, {
      ok: false,
      message: "Ocurrió un error al consultar la disponibilidad.",
    });
  }
};

export const config = {
  path: "/api/check-availability",
};