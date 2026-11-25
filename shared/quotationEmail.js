
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatPrice(amount) {
  return `RD$${Number(amount).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("es-DO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function formatTime(value) {
  const [hours, minutes] = value.split(":").map(Number);
  const period = hours >= 12 ? "p. m." : "a. m.";
  const hour = hours % 12 || 12;

  return `${hour}:${String(minutes).padStart(2, "0")} ${period}`;
}

function priceRow(label, amount) {
  return `
    <tr>
      <td style="padding:10px 0;color:#475569;">
        ${escapeHtml(label)}
      </td>
      <td style="padding:10px 0;text-align:right;font-weight:bold;">
        ${escapeHtml(amount)}
      </td>
    </tr>
  `;
}

export function buildQuotationEmail({
  quotationId,
  fullName,
  eventType,
  eventDate,
  startTime,
  duration,
  quotationDetails,
}) {
  const details = quotationDetails;
  const prices = details.servicePrices;
  const isInterior = details.locationType === "interior";

  const websiteUrl = "https://caritasrd.netlify.app";
  const logoUrl = `${websiteUrl}/email/Logo_caritas.png`;

  const location = isInterior
    ? `${details.municipality}, ${details.province}`
    : "Santo Domingo";

  const serviceRows = [
    prices.pintacaritas > 0
      ? priceRow(
          `Pintacaritas (${details.childrenCount} niños)`,
          formatPrice(prices.pintacaritas)
        )
      : "",

    prices.hairParty > 0
      ? priceRow(
          `Hair Party (${details.hairPartyGirls} niñas)`,
          formatPrice(prices.hairParty)
        )
      : "",

    prices.glitter > 0
      ? priceRow(
          `Glitter para adultos (${details.glitterParticipants} participantes)`,
          formatPrice(prices.glitter)
        )
      : "",
  ].join("");

  
const additionalHours = Number(duration) - 2;

const additionalHoursRow =
  details.additionalHoursCost > 0
    ? priceRow(
        additionalHours === 1
          ? "Hora adicional (1 hora)"
          : `Horas adicionales (${additionalHours} horas)`,
        formatPrice(details.additionalHoursCost)
      )
    : "";


  const transportLabel = isInterior
    ? `Desde ${formatPrice(details.transportCost)}`
    : details.transportCost === 0
      ? "Incluido (RD$0)"
      : formatPrice(details.transportCost);

  const totalLabel =
    `${isInterior ? "Desde " : ""}${formatPrice(details.estimatedTotal)}`;

  const subject =
    "🎨 ¡Tu cotización de Caritas RD está lista!";

  const html = `
    <!DOCTYPE html>
    <html lang="es">

    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tu cotización de Caritas RD</title>
    </head>

    <body style="margin:0;padding:20px;background:#fff7fa;font-family:Arial,sans-serif;color:#0b2a4a;">

      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #fce7f3;">

        <!-- Encabezado con logo oficial -->

        <div style="background:#ffffff;padding:30px 20px;text-align:center;color:#ec1763;border-bottom:4px solid #ec1763;">

          <img
            src="${logoUrl}"
            alt="Caritas RD"
            width="220"
            style="display:block;width:220px;max-width:100%;height:auto;margin:0 auto;"
          />

          <p style="margin:15px 0 0;font-size:16px;font-weight:bold;color:#ec1763;">
            ¡Magia, alegría y color!
          </p>

        </div>

        <!-- Contenido principal -->

        <div style="padding:25px;">

          <h2 style="color:#ec1763;text-align:center;">
            ¡Tu celebración comienza aquí! 🎉
          </h2>

          <p style="line-height:1.7;">
            ¡Hola, ${escapeHtml(fullName)}!
          </p>

          <p style="line-height:1.7;color:#475569;">
            Gracias por elegir Caritas RD. Hemos preparado
            un presupuesto personalizado para llenar
            tu celebración de momentos inolvidables.
          </p>

          <!-- Detalles del evento -->

          <div style="background:#fff7fa;padding:18px;border-radius:12px;margin:25px 0;">

            <h3 style="color:#ec1763;margin-top:0;">
               Detalles de tu celebración
            </h3>

            <p>
              <strong>Evento:</strong>
              ${escapeHtml(eventType)}
            </p>

            <p>
              <strong>Fecha:</strong>
              ${escapeHtml(formatDate(eventDate))}
            </p>

            <p>
              <strong>Hora:</strong>
              ${escapeHtml(formatTime(startTime))}
            </p>

            <p>
              <strong>Duración:</strong>
              ${escapeHtml(duration)} horas
            </p>

            <p>
              <strong>Ubicación:</strong>
              ${escapeHtml(location)}
            </p>

          </div>

          <!-- Desglose de precios -->

          <h3 style="color:#ec1763;">
            🎨 Tu presupuesto personalizado
          </h3>

          <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px;">

            ${serviceRows}

            ${priceRow(
              "Subtotal de servicios (2 horas)",
              formatPrice(details.servicesSubtotal)
            )}

            ${additionalHoursRow}

            ${priceRow("Transporte", transportLabel)}

          </table>

          <!-- Total estimado -->

          <div style="background:#fff0f5;padding:22px;border-radius:12px;text-align:center;margin:20px 0;">

            <p style="margin:0;color:#475569;">
              Total estimado
            </p>

            <h2 style="color:#ec1763;font-size:30px;margin:10px 0;">
              ${escapeHtml(totalLabel)}
            </h2>

          </div>

          <!-- Referencia de la cotización -->

          <div style="padding:15px;background:#f8fafc;border-radius:10px;">

            <p style="margin:0;font-size:12px;color:#475569;">
              Número de referencia:
            </p>

            <p style="margin-bottom:0;font-size:12px;overflow-wrap:anywhere;">
              ${escapeHtml(quotationId)}
            </p>

          </div>

          <!-- Condiciones de la cotización -->

          <p style="font-size:13px;color:#64748b;line-height:1.7;">
            Este presupuesto es preliminar y está sujeto
            a confirmación de disponibilidad, ubicación,
            precio definitivo y condiciones del servicio.
            Guardar una cotización no constituye una
            reserva confirmada.
          </p>

          <!-- Botón de reserva -->

          <div style="text-align:center;margin:30px 0;">

            <a href="${websiteUrl}"
               style="display:inline-block;background:#ec1763;color:#ffffff;padding:15px 25px;border-radius:25px;text-decoration:none;font-weight:bold;">

              🎉 Quiero reservar mi evento

            </a>

          </div>

          <p style="text-align:center;color:#ec1763;font-weight:bold;">
            ¡Creamos sonrisas, pintamos recuerdos!
          </p>

        </div>

        <!-- Pie del correo -->

        <div style="background:#0b2a4a;color:#ffffff;padding:20px;text-align:center;font-size:12px;">

          <strong>Caritas RD</strong>

          <p>
            Pintacaritas · Hair Party · Glitter
          </p>

          <p>
            República Dominicana
          </p>

          <a href="${websiteUrl}"
             style="color:#ffffff;text-decoration:underline;">
            Visita nuestra página web
          </a>

        </div>

      </div>

    </body>
    </html>
  `;

  return { subject, html };
}
