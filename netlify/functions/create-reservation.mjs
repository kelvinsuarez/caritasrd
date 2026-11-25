import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

import {
  calculateServicePrice,
  calculateTransportPrice,
  calculateAdditionalHoursPrice,
} from "../../shared/quotationPricing.js";


import { readFile } from "node:fs/promises";

import { validateCoverage } from "../../shared/coverageValidation.js";


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


const hasQuotation = form.quotationDetails != null;

let quotation = null;

if (hasQuotation) {
  const details = form.quotationDetails;

  if (
    typeof details !== "object" ||
    Array.isArray(details) ||
    details === null
  ) {
    return respond(
      { error: "Los datos de la cotización no son válidos." },
      400
    );
  }

  const hairPartyGirls = Number(details.hairPartyGirls);
  const glitterParticipants = Number(details.glitterParticipants);
  const quotedChildren = Number(details.childrenCount);

  const locationType = details.locationType;
  const coverageStatus = details.coverageStatus;


const province =
  typeof details.province === "string"
    ? details.province.trim()
    : "";

const municipality =
  typeof details.municipality === "string"
    ? details.municipality.trim()
    : "";

if (
  locationType === "interior" &&
  (
    province.length < 2 ||
    province.length > 100 ||
    municipality.length < 2 ||
    municipality.length > 100
  )
) {
  return respond(
    {
      error:
        "Indica una provincia y un municipio válidos para el evento.",
    },
    400
  );
}


  const latitude = details.latitude;
  const longitude = details.longitude;

  const validCoordinates =
    latitude !== null &&
    latitude !== undefined &&
    latitude !== "" &&
    longitude !== null &&
    longitude !== undefined &&
    longitude !== "" &&
    Number.isFinite(Number(latitude)) &&
    Number.isFinite(Number(longitude)) &&
    Number(latitude) >= -90 &&
    Number(latitude) <= 90 &&
    Number(longitude) >= -180 &&
    Number(longitude) <= 180;

  if (locationType === "santo_domingo" && !validCoordinates) {
    return respond(
      {
        error:
          "Selecciona una ubicación válida en el mapa para continuar.",
      },
      400
    );
  }

  const validQuantity = (value) =>
    Number.isSafeInteger(value) &&
    value >= 1 &&
    value <= 10000;

  if (
    (services.includes("Pintacaritas") &&
      !validQuantity(quotedChildren)) ||
    (services.includes("Hair Party") &&
      !validQuantity(hairPartyGirls)) ||
    (services.includes("Stand de glitter para adultos") &&
      !validQuantity(glitterParticipants))
  ) {
    return respond(
      { error: "Las cantidades de la cotización no son válidas." },
      400
    );
  }

  if (
    !["santo_domingo", "interior"].includes(locationType)
  ) {
    return respond(
      { error: "La ubicación de la cotización no es válida." },
      400
    );
  }

  
  // Verificar la cobertura con el perímetro oficial del proyecto.
  let verifiedCoverageStatus = null;

  if (locationType === "santo_domingo") {
    try {
      const coverageFile = new URL(
        "../../shared/coverage.geojson",
        import.meta.url
      );

      const coverageText = await readFile(coverageFile, "utf8");
      const coverageData = JSON.parse(coverageText);

      verifiedCoverageStatus = validateCoverage(
        coverageData,
        details.latitude,
        details.longitude
      );
    } catch (error) {
      console.error("Error al verificar la cobertura:", error);

      return respond(
        {
          error:
            "No fue posible verificar la ubicación del evento. Inténtalo nuevamente.",
        },
        400
      );
    }

    if (verifiedCoverageStatus === null) {
      return respond(
        {
          error:
            "Selecciona una ubicación válida en el mapa para continuar.",
        },
        400
      );
    }
  }

  const transportCost = calculateTransportPrice(
    locationType,
    verifiedCoverageStatus
  );


  if (transportCost === null) {
    return respond(
      { error: "No se pudo determinar el transporte." },
      400
    );
  }

  const servicePrices = {
    pintacaritas: services.includes("Pintacaritas")
      ? calculateServicePrice("Pintacaritas", quotedChildren)
      : 0,

    hairParty: services.includes("Hair Party")
      ? calculateServicePrice("Hair Party", hairPartyGirls)
      : 0,

    glitter: services.includes("Stand de glitter para adultos")
      ? calculateServicePrice(
          "Stand de glitter para adultos",
          glitterParticipants
        )
      : 0,
  };

  const additionalHoursCost =
    calculateAdditionalHoursPrice(duration);

  const quotedTotal =
    servicePrices.pintacaritas +
    servicePrices.hairParty +
    servicePrices.glitter +
    additionalHoursCost +
    transportCost;

  quotation = {
    province: locationType === "interior" ? province : null,
    municipality: locationType === "interior" ? municipality : null,
    hairPartyGirls: services.includes("Hair Party")
      ? hairPartyGirls
      : null,
    glitterParticipants: services.includes(
      "Stand de glitter para adultos"
    )
      ? glitterParticipants
      : null,
    childrenCount: services.includes("Pintacaritas")
      ? quotedChildren
      : null,
    locationType,
    coverageStatus: verifiedCoverageStatus,
    servicePrices,
    additionalHoursCost,
    transportCost,
    quotedTotal,
  };
}

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
        children_count: quotation
          ? quotation.childrenCount ?? null
          : childrenCount,
        hair_party_girls: quotation?.hairPartyGirls ?? null,
        glitter_participants: quotation?.glitterParticipants ?? null,
        quotation_details: quotation ?? null,
        transport_cost: quotation?.transportCost ?? null,
        quoted_total: quotation?.quotedTotal ?? null,
        final_total: null,
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

    // Notificación al administrador después de guardar la reservación.
    // Un error de correo no debe impedir que la solicitud se registre.
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        const escapeHtml = (value) =>
          String(value ?? "").replace(/[&<>"']/g, (character) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[character]);

        const { error: emailError } = await resend.emails.send({
          from: "Caritas RD <onboarding@resend.dev>",
          to: ["k_suarez22@hotmail.com"],
          subject: "🎨 Nueva solicitud de reservación - Caritas RD",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:28px;background:#fff7fa;border-radius:16px;">
              <h1 style="color:#ec1763;text-align:center;">🎨 Caritas RD</h1>
              <h2 style="color:#0b2a4a;">¡Nueva solicitud de reservación!</h2>
              <p>Se ha registrado una nueva solicitud en nuestra plataforma.</p>

              <p><strong>Cliente:</strong> ${escapeHtml(fullName)}</p>
              <p><strong>WhatsApp:</strong> ${escapeHtml(whatsapp)}</p>
              <p><strong>Correo:</strong> ${escapeHtml(email || "No proporcionado")}</p>
              <p><strong>Tipo de evento:</strong> ${escapeHtml(eventType)}</p>
              <p><strong>Fecha:</strong> ${escapeHtml(eventDate)}</p>
              <p><strong>Hora de inicio:</strong> ${escapeHtml(startTime)}</p>
              <p><strong>Duración:</strong> ${duration} horas</p>
              <p><strong>Servicios:</strong> ${escapeHtml(services.join(", "))}</p>
              <p><strong>Cantidad de niños:</strong> ${escapeHtml(childrenCount ?? "No indicada")}</p>
              <p><strong>Dirección:</strong> ${escapeHtml(address)}</p>
              <p><strong>Temática:</strong> ${escapeHtml(form.theme || "No indicada")}</p>
              <p><strong>Edad del cumpleañero:</strong> ${escapeHtml(birthdayAge ?? "No indicada")}</p>
              <p><strong>Notas:</strong> ${escapeHtml(form.notes || "Sin observaciones")}</p>

              <p style="margin-top:24px;">
                <strong>Estado:</strong> Pendiente de revisión
              </p>

              <p style="text-align:center;margin-top:28px;">
                <a href="https://caritasrd.netlify.app/admin/dashboard"
                   style="background:#ec1763;color:white;padding:12px 22px;text-decoration:none;border-radius:8px;">
                  Ver reservaciones
                </a>
              </p>

              <p style="font-size:12px;color:#64748b;text-align:center;margin-top:28px;">
                Notificación automática de Caritas RD.
              </p>
            </div>
          `,
        });

        if (emailError) {
          console.error(
            "Resend no pudo enviar la notificación:",
            emailError
          );
        }
      } catch (emailError) {
        console.error(
          "Error al procesar la notificación:",
          emailError
        );
      }
    } else {
      console.warn(
        "Notificación omitida: RESEND_API_KEY no está configurada."
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