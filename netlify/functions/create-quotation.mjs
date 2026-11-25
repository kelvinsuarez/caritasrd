import { createClient } from "@supabase/supabase-js";

import { Resend } from "resend";
import { buildQuotationEmail } from "../../shared/quotationEmail.js";


import {
  calculateServicePrice,
  calculateTransportPrice,
  calculateAdditionalHoursPrice,
} from "../../shared/quotationPricing.js";

import { validateCoverage } from "../../shared/coverageValidation.js";
import { readFile } from "node:fs/promises";

function respond(data, status = 200) {
  return Response.json(data, { status });
}

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validQuantity(value) {
  return (
    Number.isSafeInteger(value) &&
    value >= 1 &&
    value <= 10000
  );
}


async function sendQuotationEmail({
  supabase,
  quotationId,
  email,
  fullName,
  eventType,
  eventDate,
  startTime,
  duration,
  quotationDetails,
}) {
  // El envío permanece desactivado por defecto.
  const emailEnabled =
    process.env.QUOTATION_EMAIL_ENABLED === "true";

  if (!emailEnabled) {
    return "pendiente";
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.QUOTATION_EMAIL_FROM;

  let emailStatus = "fallido";
  let emailSentAt = null;
  let emailMessageId = null;
  let emailError = null;

  try {
    if (!resendApiKey || !emailFrom) {
      throw new Error(
        "Configuración de correo electrónico incompleta."
      );
    }

    const resend = new Resend(resendApiKey);

    const { subject, html } = buildQuotationEmail({
      quotationId,
      fullName,
      eventType,
      eventDate,
      startTime,
      duration,
      quotationDetails,
    });

    const { data, error } = await resend.emails.send(
      {
        from: emailFrom,
        to: [email],
        subject,
        html,
      },
      {
        idempotencyKey: `quotation-${quotationId}`,
      }
    );

    if (error) {
      throw new Error(
        error.message || "Resend rechazó el envío."
      );
    }

    if (!data?.id) {
      throw new Error(
        "No se recibió el identificador del correo."
      );
    }

    emailStatus = "enviado";
    emailSentAt = new Date().toISOString();
    emailMessageId = data.id;

  } catch (error) {
    emailError = String(
      error?.message || "Error desconocido de envío."
    ).slice(0, 500);

    console.error(
      "Error al enviar correo de cotización:",
      quotationId
    );
  }

  // Registrar el resultado del envío en Supabase.
  try {
    const { error: updateError } = await supabase
      .from("quotations")
      .update({
        email_status: emailStatus,
        email_sent_at: emailSentAt,
        email_message_id: emailMessageId,
        email_error: emailError,
      })
      .eq("id", quotationId);

    if (updateError) {
      throw updateError;
    }

  } catch (error) {
    console.error(
      "Error al actualizar el estado del correo:",
      quotationId,
      error?.code || "UNKNOWN"
    );
  }

  return emailStatus;
}


export default async function handler(request) {
  if (request.method !== "POST") {
    return Response.json(
      {
        ok: false,
        error: "Método no permitido.",
      },
      {
        status: 405,
        headers: { Allow: "POST" },
      }
    );
  }

  try {
    // 1. Recibir la solicitud.

    const raw = await request.text();

    if (raw.length > 20000) {
      return respond(
        {
          ok: false,
          error: "Solicitud demasiado grande.",
        },
        413
      );
    }

    let form;

    try {
      form = JSON.parse(raw);
    } catch {
      return respond(
        {
          ok: false,
          error: "Formato de solicitud inválido.",
        },
        400
      );
    }

    if (
      !form ||
      typeof form !== "object" ||
      Array.isArray(form)
    ) {
      return respond(
        {
          ok: false,
          error: "Datos de cotización inválidos.",
        },
        400
      );
    }

    // 2. Validar los datos del cliente.

    const fullName = cleanText(form.fullName);
    const whatsapp = cleanText(form.whatsapp);
    const email = cleanText(form.email);

    if (
      !fullName ||
      fullName.length > 150 ||
      !/^[0-9+()\s-]{10,20}$/.test(whatsapp) ||
      email.length > 254 ||
      
      (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))

    ) {
      return respond(
        {
          ok: false,
          error: "Verifica tus datos de contacto.",
        },
        400
      );
    }

    // 3. Validar los detalles del evento.

    const eventType = cleanText(form.eventType);
    const eventDate = cleanText(form.eventDate);
    const startTime = cleanText(form.startTime);
    const duration = Number(form.duration);
    const notes = cleanText(form.notes);

    const dateParts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Santo_Domingo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());

    const getDatePart = (type) =>
      dateParts.find((part) => part.type === type)?.value;

    const today =
      `${getDatePart("year")}-${getDatePart("month")}-${getDatePart("day")}`;

    const parsedDate = new Date(`${eventDate}T00:00:00Z`);

    const validDate =
      /^\d{4}-\d{2}-\d{2}$/.test(eventDate) &&
      Number.isFinite(parsedDate.getTime()) &&
      parsedDate.toISOString().slice(0, 10) === eventDate &&
      eventDate >= today;

    if (
      !eventType ||
      eventType.length > 100 ||
      !validDate ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime) ||
      !Number.isInteger(duration) ||
      duration < 2 ||
      duration > 5 ||
      notes.length > 2000
    ) {
      return respond(
        {
          ok: false,
          error: "Verifica los detalles de tu evento.",
        },
        400
      );
    }

    // 4. Validar los servicios seleccionados.

    const allowedServices = [
      "Pintacaritas",
      "Hair Party",
      "Stand de glitter para adultos",
    ];

    const services = Array.isArray(form.services)
      ? [...new Set(form.services)]
      : [];

    if (
      services.length === 0 ||
      services.some(
        (service) => !allowedServices.includes(service)
      )
    ) {
      return respond(
        {
          ok: false,
          error: "Selecciona servicios válidos para tu cotización.",
        },
        400
      );
    }

    // 5. Validar las cantidades de participantes.

    const childrenCount = services.includes("Pintacaritas")
      ? Number(form.childrenCount)
      : null;

    const hairPartyGirls = services.includes("Hair Party")
      ? Number(form.hairPartyGirls)
      : null;

    const glitterParticipants = services.includes(
      "Stand de glitter para adultos"
    )
      ? Number(form.glitterParticipants)
      : null;

    if (
      (services.includes("Pintacaritas") &&
        !validQuantity(childrenCount)) ||
      (services.includes("Hair Party") &&
        !validQuantity(hairPartyGirls)) ||
      (services.includes("Stand de glitter para adultos") &&
        !validQuantity(glitterParticipants))
    ) {
      return respond(
        {
          ok: false,
          error: "Verifica las cantidades de participantes.",
        },
        400
      );
    }

    // 6. Validar la ubicación.

    const locationType = cleanText(form.locationType);
    const province = cleanText(form.province);
    const municipality = cleanText(form.municipality);

    if (!["santo_domingo", "interior"].includes(locationType)) {
      return respond(
        {
          ok: false,
          error: "Selecciona una ubicación válida.",
        },
        400
      );
    }

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
          ok: false,
          error: "Indica la provincia y el municipio del evento.",
        },
        400
      );
    }

    // 7. Validar las coordenadas geográficas.

    const latitude = form.latitude;
    const longitude = form.longitude;

    const validCoordinateValue = (value) =>
      (
        typeof value === "number" ||
        (typeof value === "string" && value.trim() !== "")
      ) &&
      Number.isFinite(Number(value));

    const validCoordinates =
      validCoordinateValue(latitude) &&
      validCoordinateValue(longitude) &&
      Number(latitude) >= -90 &&
      Number(latitude) <= 90 &&
      Number(longitude) >= -180 &&
      Number(longitude) <= 180;

    if (
      locationType === "santo_domingo" &&
      !validCoordinates
    ) {
      return respond(
        {
          ok: false,
          error: "Selecciona una ubicación válida en el mapa.",
        },
        400
      );
    }

    // 8. Verificar el perímetro de cobertura.

    let verifiedCoverageStatus = null;

    if (locationType === "santo_domingo") {
      try {
        const coverageFile = new URL(
          "../../shared/coverage.geojson",
          import.meta.url
        );

        const coverageText = await readFile(
          coverageFile,
          "utf8"
        );

        const coverageData = JSON.parse(coverageText);

        verifiedCoverageStatus = validateCoverage(
          coverageData,
          Number(latitude),
          Number(longitude)
        );
      } catch (error) {
        console.error(
          "Error al verificar la cobertura:",
          error
        );

        return respond(
          {
            ok: false,
            error:
              "No fue posible verificar la ubicación del evento.",
          },
          500
        );
      }

      if (
        !["inside", "outside"].includes(verifiedCoverageStatus)
      ) {
        return respond(
          {
            ok: false,
            error: "Selecciona una ubicación válida en el mapa.",
          },
          400
        );
      }
    }

    // 9. Calcular el transporte.

    const transportCost = calculateTransportPrice(
      locationType,
      verifiedCoverageStatus
    );

    if (
      !Number.isFinite(transportCost) ||
      transportCost < 0
    ) {
      return respond(
        {
          ok: false,
          error: "No se pudo determinar el costo del transporte.",
        },
        400
      );
    }

    // 10. Calcular los precios de los servicios.

    const servicePrices = {
      pintacaritas: services.includes("Pintacaritas")
        ? calculateServicePrice(
            "Pintacaritas",
            childrenCount
          )
        : 0,

      hairParty: services.includes("Hair Party")
        ? calculateServicePrice(
            "Hair Party",
            hairPartyGirls
          )
        : 0,

      glitter: services.includes("Stand de glitter para adultos")
        ? calculateServicePrice(
            "Stand de glitter para adultos",
            glitterParticipants
          )
        : 0,
    };

    const servicesSubtotal =
      servicePrices.pintacaritas +
      servicePrices.hairParty +
      servicePrices.glitter;

    // 11. Calcular las horas adicionales y el total.

    const additionalHoursCost =
      calculateAdditionalHoursPrice(duration);

    const estimatedTotal =
      servicesSubtotal +
      additionalHoursCost +
      transportCost;

    if (
      !Number.isFinite(estimatedTotal) ||
      estimatedTotal <= 0
    ) {
      return respond(
        {
          ok: false,
          error: "No se pudo calcular el total de la cotización.",
        },
        400
      );
    }

    // 12. Preparar el desglose de la cotización.

    const quotationDetails = {
      childrenCount,
      hairPartyGirls,
      glitterParticipants,
      locationType,

      province:
        locationType === "interior" ? province : null,

      municipality:
        locationType === "interior" ? municipality : null,

      latitude:
        locationType === "santo_domingo"
          ? Number(latitude)
          : null,

      longitude:
        locationType === "santo_domingo"
          ? Number(longitude)
          : null,

      coverageStatus: verifiedCoverageStatus,
      servicePrices,
      servicesSubtotal,
      additionalHoursCost,
      transportCost,
      estimatedTotal,
    };

    // 13. Establecer la conexión con Supabase.

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Configuración de Supabase incompleta.");

      return respond(
        {
          ok: false,
          error: "El servicio no está disponible temporalmente.",
        },
        500
      );
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // 14. Guardar la cotización.

    const { data, error } = await supabase
      .from("quotations")
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
        hair_party_girls: hairPartyGirls,
        glitter_participants: glitterParticipants,
        location_type: locationType,
        province: quotationDetails.province,
        municipality: quotationDetails.municipality,
        coverage_status: verifiedCoverageStatus,
        quotation_details: quotationDetails,
        estimated_total: estimatedTotal,
        notes: notes || null,
        status: "pendiente",
      })
      .select("id")
      .single();

    if (error) {
      console.error(
        "Error al guardar cotización:",
        error.code
      );

      return respond(
        {
          ok: false,
          error: "No pudimos registrar tu cotización.",
        },
        500
      );
    }

    // 15. Confirmar el registro exitoso.

    
const emailStatus = await sendQuotationEmail({
  supabase,
  quotationId: data.id,
  email,
  fullName,
  eventType,
  eventDate,
  startTime,
  duration,
  quotationDetails,
});

return respond({
  ok: true,
  quotationId: data.id,
  estimatedTotal,
  quotationDetails,
  emailStatus,
  message: "¡Tu cotización ha sido guardada exitosamente!",
}, 201);


  } catch (error) {
    console.error("Error al crear cotización:", error);

    return respond(
      {
        ok: false,
        error: "No pudimos guardar tu cotización.",
      },
      500
    );
  }
}

// Ruta pública de la función.

export const config = {
  path: "/api/create-quotation",
};
