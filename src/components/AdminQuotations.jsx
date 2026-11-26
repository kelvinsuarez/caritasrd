import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";


const quotationStatusLabels = {
  pendiente: "Pendiente",
  en_evaluacion: "En evaluación",
  aceptada: "Aceptada",
  rechazada: "Rechazada",
};

const emailStatusLabels = {
  pendiente: "Pendiente de envío",
  enviado: "Correo enviado",
  fallido: "Error de envío",
};

const emailStatusIcons = {
  pendiente: "⏳",
  enviado: "📧",
  fallido: "⚠️",
};


function formatDate(value) {
  if (!value) return "No especificada";

  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return date.toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatPrice(value) {
  if (value === null || value === undefined) {
    return "No disponible";
  }

  return `RD$${Number(value).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  })}`;
}

function formatTime(value) {
  if (!value) return "No especificada";

  const [hours, minutes] = value.split(":");
  const hour = Number(hours);

  const period = hour >= 12 ? "p. m." : "a. m.";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minutes} ${period}`;
}


function formatDateTime(value) {
  if (!value) return "No disponible";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return date.toLocaleString("es-DO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Santo_Domingo",
  });
}



export default function AdminQuotations({ onClose }) {
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalQuotations, setTotalQuotations] = useState(0);
    const [expandedQuotationId, setExpandedQuotationId] = useState(null);


  useEffect(() => {
    const controller = new AbortController();

    async function loadQuotations() {
      setLoading(true);
      setError("");

      try {
        const { data, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError || !data.session) {
          throw new Error(
            "No hay una sesión administrativa activa."
          );
        }

        const response = await fetch(
          `/api/get-quotations?page=${page}&limit=25`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${data.session.access_token}`,
            },
            signal: controller.signal,
          }
        );

        const result = await response.json();

        if (!response.ok || !result.ok) {
          throw new Error(
            result.error ||
              "No se pudieron consultar las cotizaciones."
          );
        }

        if (controller.signal.aborted) return;

        setQuotations(result.quotations || []);
        setTotalPages(result.pagination.totalPages);
        setTotalQuotations(result.pagination.total);
      } catch (error) {
        if (controller.signal.aborted) return;

        setError(error.message);
        setQuotations([]);
        setTotalPages(0);
        setTotalQuotations(0);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadQuotations();

    return () => controller.abort();
  }, [page]);
  
    function toggleQuotation(id) {
    setExpandedQuotationId((currentId) =>
      currentId === id ? null : id
    );
  }
  return (
    <div className="admin-quotations__overlay">
      <section
        className="admin-quotations"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-quotations-title"
      >
        {/* Encabezado del módulo */}

        <header className="admin-quotations__header">
          <div className="admin-quotations__heading">
            <h2
              id="admin-quotations-title"
              className="admin-quotations__title"
            >
              📋 Cotizaciones recibidas
            </h2>

            <p className="admin-quotations__description">
              Consulta y gestiona las cotizaciones de nuestros clientes.
            </p>
          </div>

          <button
            type="button"
            className="admin-quotations__close"
            onClick={onClose}
            aria-label="Cerrar cotizaciones"
          >
            ✕
          </button>
        </header>

        {/* Contenido del módulo */}

        
<div className="admin-quotations__body">

  {/* Estado de carga */}

  {loading && (
    <div className="admin-quotations__empty" role="status">
      <span className="admin-quotations__empty-icon">
        ⏳
      </span>

      <h3>Cargando cotizaciones...</h3>

      <p>
        Estamos consultando las solicitudes recibidas.
      </p>
    </div>
  )}

  {/* Error de consulta */}

  {!loading && error && (
    <div className="admin-quotations__empty" role="alert">
      <span className="admin-quotations__empty-icon">
        ⚠️
      </span>

      <h3>No pudimos cargar las cotizaciones</h3>

      <p>{error}</p>
    </div>
  )}

  {/* Sin cotizaciones registradas */}

  {!loading && !error && quotations.length === 0 && (
    <div className="admin-quotations__empty">
      <span className="admin-quotations__empty-icon">
        📭
      </span>

      <h3>No hay cotizaciones registradas</h3>

      <p>
        Las nuevas cotizaciones de nuestros clientes
        aparecerán aquí automáticamente al consultar.
      </p>
    </div>
  )}

  {/* Cotizaciones disponibles */}

  {!loading && !error && quotations.length > 0 && (
    <div className="admin-quotations__list">

      <p className="admin-quotations__count">
        Total de cotizaciones: {totalQuotations}
      </p>

      
{quotations.map((quotation) => (
  <article
    key={quotation.id}
    className="admin-quotations__item"
  >
    <div className="admin-quotations__item-header">
      <div className="admin-quotations__item-info">
        <h3 className="admin-quotations__customer">
          {quotation.full_name}
        </h3>

        <p className="admin-quotations__event">
          {quotation.event_type}
        </p>

        <p className="admin-quotations__date">
          📅 {formatDate(quotation.event_date)}
        </p>
      </div>

      <span
        className={`admin-quotations__status admin-quotations__status--${quotation.status}`}
      >
        {quotationStatusLabels[quotation.status] ||
            quotation.status}
      </span>
    </div>

    <div className="admin-quotations__budget">
      <span className="admin-quotations__budget-label">
        Presupuesto estimado
      </span>

      <strong className="admin-quotations__budget-value">
        {quotation.estimated_total != null &&
        quotation.location_type === "interior"
          ? "Desde "
          : ""}
        {formatPrice(quotation.estimated_total)}
      </strong>
    </div>

    <button
      type="button"
      className="admin-quotations__expand"
      onClick={() => toggleQuotation(quotation.id)}
      aria-expanded={expandedQuotationId === quotation.id}
      aria-controls={`quotation-details-${quotation.id}`}
    >
      {expandedQuotationId === quotation.id
        ? "Ocultar detalles ▲"
        : "Ver detalles de cotización ▼"}
    </button>

    <div
      id={`quotation-details-${quotation.id}`}
      className="admin-quotations__details"
      hidden={expandedQuotationId !== quotation.id}
    >
      <h4>Información de contacto</h4>

      <p>WhatsApp: {quotation.whatsapp}</p>

      <p>
        Correo: {quotation.email || "No proporcionado"}
      </p>

      <h4>Información del evento</h4>

      <p>Horario: {formatTime(quotation.start_time)}</p>

      <p>Duración: {quotation.duration} horas</p>

      <p>Provincia: {quotation.province || "No especificada"}</p>

      <p>Municipio: {quotation.municipality || "No especificado"}</p>


{/* Servicios cotizados */}

<h4>Servicios cotizados</h4>

<div className="admin-quotations__services">
  {quotation.services?.includes("Pintacaritas") && (
    <div className="admin-quotations__service">
      <div className="admin-quotations__service-info">
        <strong>🎨 Pintacaritas</strong>

        <span>
          {quotation.quotation_details?.childrenCount ?? "—"} niños
        </span>
      </div>

      <strong>
        {formatPrice(
          quotation.quotation_details?.servicePrices?.pintacaritas
        )}
      </strong>
    </div>
  )}

  {quotation.services?.includes("Hair Party") && (
    <div className="admin-quotations__service">
      <div className="admin-quotations__service-info">
        <strong>🎀 Hair Party</strong>

        <span>
          {quotation.quotation_details?.hairPartyGirls ?? "—"} niñas
        </span>
      </div>

      <strong>
        {formatPrice(
          quotation.quotation_details?.servicePrices?.hairParty
        )}
      </strong>
    </div>
  )}

 
{quotation.services?.includes("Stand de glitter para adultos") && (
  <div className="admin-quotations__service">
    <div className="admin-quotations__service-info">
      <strong>✨ Stand de glitter para adultos</strong>

      <span>
        {quotation.quotation_details?.glitterParticipants ?? "—"} participantes
      </span>
    </div>

    <strong>
      {formatPrice(
        quotation.quotation_details?.servicePrices?.glitter
      )}
    </strong>
  </div>
)}

</div>

{/* Desglose del presupuesto */}

<h4>Desglose del presupuesto</h4>

<div className="admin-quotations__breakdown">
  <div className="admin-quotations__breakdown-row">
    <span>Subtotal de servicios</span>

    <strong>
      {formatPrice(
        quotation.quotation_details?.servicesSubtotal
      )}
    </strong>
  </div>

  <div className="admin-quotations__breakdown-row">
    <span>Horas adicionales</span>

    <strong>
      {formatPrice(
        quotation.quotation_details?.additionalHoursCost
      )}
    </strong>
  </div>

  <div className="admin-quotations__breakdown-row">
    <span>Transporte</span>

    <strong>
      {quotation.location_type === "interior" &&
      quotation.quotation_details?.transportCost != null
        ? "Desde "
        : ""}

      {formatPrice(
        quotation.quotation_details?.transportCost
      )}
    </strong>
  </div>

  <div className="admin-quotations__breakdown-total">
    <span>Presupuesto original estimado</span>

    <strong>
      {quotation.location_type === "interior" &&
      quotation.estimated_total != null
        ? "Desde "
        : ""}

      {formatPrice(quotation.estimated_total)}
    </strong>
  </div>
</div>

{quotation.location_type === "interior" && (
  <p className="admin-quotations__transport-note">
    ℹ️ El costo de transporte al interior está sujeto
    a confirmación según la ubicación del evento.
  </p>
)}


  
<h4>Observaciones</h4>

<p>{quotation.notes || "Sin observaciones"}</p>

{/* Seguimiento del correo electrónico */}

<h4>Seguimiento del correo electrónico</h4>


<div
  className={`admin-quotations__email admin-quotations__email--${
    quotation.email_status || "desconocido"
  }`}
>
  <div className="admin-quotations__email-status">
    <span>
      {emailStatusIcons[quotation.email_status] || "📧"}
    </span>

    <strong>
      {emailStatusLabels[quotation.email_status] ||
        quotation.email_status ||
        "Estado no disponible"}
    </strong>
  </div>

  <div className="admin-quotations__email-info">
    <p>
      <strong>Destinatario:</strong>{" "}
      {quotation.email || "No proporcionado"}
    </p>

    <p>
      <strong>Fecha y hora del envío:</strong>{" "}
      {formatDateTime(quotation.email_sent_at)}
    </p>

    {quotation.email_message_id && (
      <p>
        <strong>ID del mensaje:</strong>{" "}
        {quotation.email_message_id}
      </p>
    )}

    {quotation.email_status === "pendiente" && (
      <p className="admin-quotations__email-note">
        La cotización está registrada, pero el correo
        electrónico todavía no ha sido enviado.
      </p>
    )}

    {quotation.email_status === "enviado" && (
      <p className="admin-quotations__email-note">
        La solicitud de envío del correo electrónico
        fue procesada correctamente.
      </p>
    )}

{quotation.email_status === "fallido" && (
  <p className="admin-quotations__email-error">
    {quotation.email_error ||
      "Ocurrió un error durante el envío del correo."}
  </p>
)}
  </div>
</div>

{/* Cierre de los detalles expandibles */}
</div>

  </article>
))}
    </div>
  )}

</div>

      </section>
    </div>
  );
}
