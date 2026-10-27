import { createClient } from "@supabase/supabase-js";

const allowedEventTypes = new Set([
  "Cumpleaños infantil",
  "Actividad escolar",
  "Evento familiar",
  "Evento corporativo",
  "Otro",
]);

const allowedServices = new Set([
  "Pintacaritas",
  "Hair Party",
  "Stand de glitter para adultos",
  "Otros servicios",
]);

function respond(data, status = 200) {
  return Response.json(data, { status });
}

function cleanText(value, maxLength = 500) {
  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : "";
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T12:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

function validTime(value) {
  return (
    typeof value === "string" &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
  );
}

export default async function handler(request) {
  if (request.method !== "POST") {
    return respond({ error: "Método no permitido." }, 405);
  }

  try {
    const raw = await request.text();

    if (raw.length > 20000) {
      return respond({ error: "Solicitud demasiado grande." }, 413);
    }

    let form;

    try {
      form = JSON.parse(raw);
    } catch {
      return respond({ error: "Datos JSON inválidos." }, 400);
    }

    if (!form || typeof form !== "object" || Array.isArray(form)) {
      return respond({ error: "Datos inválidos." }, 400);
    }

    const fullName = cleanText(form.fullName, 150);
    const whatsapp = cleanText(form.whatsapp, 30);
    const email = cleanText(form.email, 254);
    const eventType = cleanText(form.eventType, 80);
    const eventDate = form.eventDate;
    const startTime = form.startTime;
    const duration = Number(form.duration);
    const address = cleanText(form.address, 500);

    const services = Array.isArray(form.services)
        ? form.services
        : [];

        const validServices =
        services.length > 0 &&
        services.every(
            (service) =>
            typeof service === "string" &&
            allowedServices.has(service)
        );

    const childrenCount =
      form.childrenCount === "" ||
      form.childrenCount === null ||
      form.childrenCount === undefined
        ? null
        : Number(form.childrenCount);

    const birthdayAge =
      form.birthdayAge === "" ||
      form.birthdayAge === null ||
      form.birthdayAge === undefined
        ? null
        : Number(form.birthdayAge);

    if (
      !fullName ||
      !/^[+()\d\s-]{7,30}$/.test(whatsapp) ||
      (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ||
      !allowedEventTypes.has(eventType) ||
      !validDate(eventDate) ||
      !validTime(startTime) ||
      !Number.isInteger(duration) ||
      duration < 2 ||
      duration > 5 ||
      !validServices ||
      !address ||
      form.accepted !== true ||
      !["si", "no"].includes(form.photoAuthorization)
    ) {
      return respond(
        { error: "Revisa los campos obligatorios del formulario." },
        400
      );
    }

    if (
      (childrenCount !== null &&
        (!Number.isInteger(childrenCount) ||
          childrenCount < 0 ||
          childrenCount > 10000)) ||
      (birthdayAge !== null &&
        (!Number.isInteger(birthdayAge) ||
          birthdayAge < 0 ||
          birthdayAge > 120))
    ) {
      return respond(
        { error: "La cantidad de niños o la edad no es válida." },
        400
      );
    }

    const url = process.env.SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SECRET_KEY;

    if (!url || !secretKey) {
      console.error("Faltan variables de entorno.");
      return respond(
        { error: "El servicio no está disponible temporalmente." },
        500
      );
    }

    const supabase = createClient(url, secretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data, error } = await supabase
      .from("reservations")
      .insert({
        full_name: fullName,
        whatsapp,
        email: email || null,
        event_type: eventType,
        event_date: eventDate,
        start_time: startTime,
        duration,
        services,
        children_count: childrenCount,
        address,
        theme: cleanText(form.theme, 150) || null,
        birthday_age: birthdayAge,
        notes: cleanText(form.notes, 2000) || null,
        accepted: true,
        photo_authorization: form.photoAuthorization,
        status: "pendiente",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error al guardar reservación:", error.code);
      return respond(
        { error: "No se pudo registrar la solicitud." },
        500
      );
    }

    return respond(
      {
        ok: true,
        reservationId: data.id,
        message:
          "¡Recibimos tu solicitud! Nos comunicaremos contigo para confirmar la disponibilidad.",
      },
      201
    );
  } catch (error) {
    console.error("Error al procesar reservación:", error);
    return respond(
      { error: "Ocurrió un error al procesar la solicitud." },
      500
    );
  }
}

export const config = {
  path: "/api/create-reservation",
};