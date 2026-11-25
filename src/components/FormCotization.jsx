import { useState } from "react";
import CoverageMap from "./CoverageMap";
import {
  calculateServicePrice,
  calculateTransportPrice,
  calculateAdditionalHoursPrice,
} from "../../shared/quotationPricing";

const initialForm = {
  fullName: "",
  whatsapp: "",
  email: "",
  eventType: "",
  eventDate: "",
  startTime: "",
  duration: "2",
  services: [],
  childrenCount: "",
  hairPartyGirls: "",
  glitterParticipants: "",
  address: "",
  locationType: "",
  province: "",
  municipality: "",
  coverageStatus: "",
  latitude: null,
  longitude: null,
  notes: "",
  accepted: false,
};

const serviceOptions = [
  "Pintacaritas",
  "Hair Party",
  "Stand de glitter para adultos",
];




export default function FormCotization({ onReserve = null }) {

  const [form, setForm] = useState(initialForm);


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [quotationResult, setQuotationResult] = useState(null);


  const updateField = (field, value) => {
  setForm((previous) => ({
    ...previous,
    [field]: value,
  }));
};

  const toggleService = (service) => {
    setForm((previous) => ({
      ...previous,
      services: previous.services.includes(service)
        ? previous.services.filter((item) => item !== service)
        : [...previous.services, service],
    }));
  };

  
const handleCoverageChange = (location) => {
  if (isSubmitting || quotationResult) return;

  setForm((previous) => ({
    ...previous,
    coverageStatus: location.status,
    latitude: location.latitude,
    longitude: location.longitude,
  }));
};


  const servicePrices = {
  pintacaritas: form.services.includes("Pintacaritas")
    ? calculateServicePrice(
        "Pintacaritas",
        form.childrenCount
      )
    : 0,

  hairParty: form.services.includes("Hair Party")
    ? calculateServicePrice(
        "Hair Party",
        form.hairPartyGirls
      )
    : 0,

  glitter: form.services.includes(
    "Stand de glitter para adultos"
  )
    ? calculateServicePrice(
        "Stand de glitter para adultos",
        form.glitterParticipants
      )
    : 0,
};

const subtotal =
  servicePrices.pintacaritas +
  servicePrices.hairParty +
  servicePrices.glitter;


const additionalHours = Math.max(0, Number(form.duration) - 2);

const additionalHoursPrice = calculateAdditionalHoursPrice(
  form.duration
);



const transportPrice = calculateTransportPrice(
  form.locationType,
  form.coverageStatus
);


const estimatedTotal =
  transportPrice === null
    ? null
    : subtotal + additionalHoursPrice + transportPrice;

const formatPrice = (amount) => {
  if (amount === null || amount === undefined) {
    return "Pendiente de ubicación";
  }

  return `RD$${amount.toLocaleString("en-US")}`;
};

const isPositiveInteger = (value) =>
  Number.isInteger(Number(value)) &&
  Number(value) > 0 &&
  String(value).trim() !== "";

const quotationDetails = {
  childrenCount: form.services.includes("Pintacaritas")
    ? Number(form.childrenCount)
    : null,
  hairPartyGirls: form.services.includes("Hair Party")
    ? Number(form.hairPartyGirls)
    : null,
  glitterParticipants: form.services.includes(
    "Stand de glitter para adultos"
  )
    ? Number(form.glitterParticipants)
    : null,
  locationType: form.locationType,
  province:
    form.locationType === "interior"
      ? form.province.trim()
      : null,
  municipality:
    form.locationType === "interior"
      ? form.municipality.trim()
      : null,
  coverageStatus:
    form.locationType === "santo_domingo"
      ? form.coverageStatus
      : null,
  latitude:
    form.locationType === "santo_domingo"
      ? form.latitude
      : null,
  
  longitude:
    form.locationType === "santo_domingo"
      ? form.longitude
      : null,
};

const isFormValid =
  form.fullName.trim().length >= 3 &&

  /^[0-9+()\s-]{10,20}$/.test(form.whatsapp.trim()) &&
  form.email.trim().length <= 254 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) &&

  form.eventType !== "" &&
  form.eventDate !== "" &&
  form.eventDate >= new Date().toLocaleDateString("en-CA") &&
  form.startTime !== "" &&
  form.services.length > 0 &&
  (!form.services.includes("Pintacaritas") ||
    isPositiveInteger(form.childrenCount)) &&
  (!form.services.includes("Hair Party") ||
    isPositiveInteger(form.hairPartyGirls)) &&
  (!form.services.includes("Stand de glitter para adultos") ||
    isPositiveInteger(form.glitterParticipants)) &&
  (
    (form.locationType === "interior" &&
      form.province.trim().length >= 2 &&
      form.municipality.trim().length >= 2) ||
    (form.locationType === "santo_domingo" &&
      form.coverageStatus !== "" &&
      form.latitude !== null &&
      form.longitude !== null)
  ) &&
  estimatedTotal !== null &&
  form.accepted;


  const handleSubmitQuotation = async () => {
    if (!isFormValid || isSubmitting || quotationResult) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/create-quotation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          ...quotationDetails,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error || "No pudimos guardar tu cotización."
        );
      }

      setQuotationResult(data);

    } catch (error) {
      setSubmitError(
        error.message ||
        "Ocurrió un error. Por favor, inténtalo nuevamente."
      );

    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <section className="quotation-form">

<fieldset
  disabled={isSubmitting || Boolean(quotationResult)}
  style={{
    border: "none",
    padding: 0,
    margin: 0,
    minWidth: 0,
  }}
>

      <div className="quotation-form__client">
  <h3>💕 Cuéntanos sobre ti</h3>

  <div className="reservation-form__field">
    <label htmlFor="cotization-name">
      Nombre completo *
    </label>
    <input
      id="cotization-name"
      type="text"
      autoComplete="name"
      value={form.fullName}
      onChange={(e) =>
        updateField("fullName", e.target.value)
      }
      placeholder="Tu nombre y apellido"
      required
    />
  </div>

  <div className="reservation-form__field">
    <label htmlFor="cotization-whatsapp">
      Número de WhatsApp *
    </label>
    <input
      id="cotization-whatsapp"
      type="tel"
      autoComplete="tel"
      value={form.whatsapp}
      onChange={(e) =>
        updateField("whatsapp", e.target.value)
      }
      placeholder="809-000-0000"
      required
    />
  </div>

  <div className="reservation-form__field">
    <label htmlFor="cotization-email">
      Correo electrónico *
    </label>
    <input
      id="cotization-email"
      type="email"
      autoComplete="email"
      value={form.email}
      onChange={(e) =>
        updateField("email", e.target.value)
      }
      placeholder="correo@ejemplo.com"
      maxLength={254}
      required
    />
  </div>
</div>  


<div className="quotation-form__event">
  <h3>🎉 Cuéntanos sobre tu celebración</h3>

  <div className="reservation-form__field">
    <label htmlFor="cotization-event-type">
      ¿Qué tipo de celebración estás organizando? *
    </label>

    <select
      id="cotization-event-type"
      value={form.eventType}
      onChange={(e) =>
        updateField("eventType", e.target.value)
      }
      required
    >
      <option value="">Selecciona una opción</option>
      <option value="Cumpleaños infantil">
        Cumpleaños infantil
      </option>
      <option value="Actividad escolar">
        Actividad escolar
      </option>
      <option value="Evento corporativo">
        Evento corporativo
      </option>
      <option value="Celebración familiar">
        Celebración familiar
      </option>
      <option value="Otro">
        Otro tipo de celebración
      </option>
    </select>
  </div>

  <div className="reservation-form__field">
    <label htmlFor="cotization-date">
      ¿Qué día será tu evento? *
    </label>

    <input
      id="cotization-date"
      type="date"
      min={new Date().toLocaleDateString("en-CA")}
      value={form.eventDate}
      onChange={(e) =>
        updateField("eventDate", e.target.value)
      }
      required
    />
  </div>

  <div className="reservation-form__field">
    <label htmlFor="cotization-time">
      ¿A qué hora comenzará? *
    </label>

    <input
      id="cotization-time"
      type="time"
      value={form.startTime}
      onChange={(e) =>
        updateField("startTime", e.target.value)
      }
      required
    />
  </div>

</div>


      <h2>¡Cotiza tu celebración! 🎨✨</h2>

      <p>
        Personaliza los servicios de tu evento y descubre
        un presupuesto estimado.
      </p>

      <p>
        Nuestro equipo revisará tu solicitud para
        confirmar el precio definitivo.
      </p>

      <fieldset className="reservation-form__services">
        <legend>¿Qué servicios deseas cotizar?</legend>

        {serviceOptions.map((service) => (
          <label key={service}>
            <input
              type="checkbox"
              checked={form.services.includes(service)}
              onChange={() => toggleService(service)}
            />
            <span>{service}</span>
          </label>
        ))}
      </fieldset>

      <div className="reservation-form__field">
  <label htmlFor="cotization-duration">
    ¿Cuántas horas necesitas nuestros servicios?
  </label>

  <select
    id="cotization-duration"
    value={form.duration}
    onChange={(e) =>
      updateField("duration", e.target.value)
    }
  >
    <option value="2">2 horas</option>
    <option value="3">3 horas</option>
    <option value="4">4 horas</option>
    <option value="5">5 horas</option>
  </select>
</div>

      {form.services.includes("Pintacaritas") && (
  <div className="reservation-form__field">
    <label htmlFor="cotization-children">
      ¿Cuántos niños recibirán Pintacaritas?
    </label>
    <input
      id="cotization-children"
      type="number"
      min="1"
      step="1"
      value={form.childrenCount}
      onChange={(e) =>
        updateField("childrenCount", e.target.value)
      }
      placeholder="Ej. 30"
    />
  </div>
)}

{form.services.includes("Hair Party") && (
  <div className="reservation-form__field">
    <label htmlFor="cotization-hair">
      ¿Cuántas niñas recibirán Hair Party?
    </label>
    <input
      id="cotization-hair"
      type="number"
      min="1"
      step="1"
      value={form.hairPartyGirls}
      onChange={(e) =>
        updateField("hairPartyGirls", e.target.value)
      }
      placeholder="Ej. 15"
    />
    <small>
      Si también contrataste Pintacaritas, indica
      únicamente cuántas niñas recibirán Hair Party
      dentro del mismo evento.
    </small>
  </div>
)}

{form.services.includes("Stand de glitter para adultos") && (
  <div className="reservation-form__field">
    <label htmlFor="cotization-glitter">
      ¿Cuántos adultos recibirán Glitter?
    </label>
    <input
      id="cotization-glitter"
      type="number"
      min="1"
      step="1"
      value={form.glitterParticipants}
      onChange={(e) =>
        updateField("glitterParticipants", e.target.value)
      }
      placeholder="Ej. 30"
    />
  </div>
)}

<div className="reservation-form__field">
  <label htmlFor="cotization-location">
    ¿Dónde se realizará tu evento?
  </label>

  <select
    id="cotization-location"
    value={form.locationType}
    onChange={(e) => {
      const value = e.target.value;

      setForm((previous) => ({
        ...previous,
        locationType: value,
        province: "",
        municipality: "",
        coverageStatus: "",
        latitude: null,
        longitude: null,
      }));
    }}
  >
    <option value="">Selecciona una opción</option>
    <option value="santo_domingo">
      Santo Domingo
    </option>
    <option value="interior">
      Fuera de Santo Domingo / interior del país
    </option>
  </select>
</div>

{form.locationType === "santo_domingo" && (
  <div className="quotation-form__coverage">
    <h3>📍 Ubica tu celebración</h3>

    <p>
      Selecciona en el mapa el lugar donde será tu
      evento para comprobar si el transporte está
      incluido.
    </p>

    <CoverageMap
      onCoverageChange={handleCoverageChange}
    />
  </div>
)}

{form.locationType === "interior" && (
  <div className="quotation-form__interior">
    <div className="reservation-form__field">
      <label htmlFor="cotization-province">
        ¿En qué provincia será tu evento? *
      </label>

      <input
        id="cotization-province"
        type="text"
        value={form.province}
        onChange={(e) =>
          updateField("province", e.target.value)
        }
        placeholder="Ej. La Vega"
        maxLength={100}
        required
      />
    </div>

    <div className="reservation-form__field">
      <label htmlFor="cotization-municipality">
        ¿En qué municipio será tu evento? *
      </label>

      <input
        id="cotization-municipality"
        type="text"
        value={form.municipality}
        onChange={(e) =>
          updateField("municipality", e.target.value)
        }
        placeholder="Ej. Jarabacoa"
        maxLength={100}
        required
      />
    </div>

    <p className="reservation-form__notice">
      🚗 Para eventos fuera de Santo Domingo, el
      transporte tiene una tarifa inicial de RD$3,000,
      sujeta a confirmación según el destino.
    </p>
  </div>
)}

{form.services.length > 0 && (
  <div className="reservation-form__summary">
    <h3>Tu presupuesto estimado 💕</h3>

    {form.services.includes("Pintacaritas") &&
      servicePrices.pintacaritas > 0 && (
        <p>
          <strong>Pintacaritas:</strong>{" "}
          {formatPrice(servicePrices.pintacaritas)}
        </p>
      )}

    {form.services.includes("Hair Party") &&
      servicePrices.hairParty > 0 && (
        <p>
          <strong>Hair Party:</strong>{" "}
          {formatPrice(servicePrices.hairParty)}
        </p>
      )}

    {form.services.includes(
      "Stand de glitter para adultos"
    ) &&
      servicePrices.glitter > 0 && (
        <p>
          <strong>Glitter para adultos:</strong>{" "}
          {formatPrice(servicePrices.glitter)}
        </p>
      )}

    <hr />

    <p>
      <strong>Subtotal de servicios (2 horas):</strong>{" "}
      {formatPrice(subtotal)}
    </p>

    {additionalHours > 0 && (
  <p>
    <strong>
      {additionalHours}{" "}
      {additionalHours === 1
        ? "hora adicional"
        : "horas adicionales"}:
    </strong>{" "}
    {formatPrice(additionalHoursPrice)}
  </p>
)}


<hr />

<p>
  <strong>Transporte:</strong>{" "}
  {transportPrice === null
    ? "Pendiente de seleccionar ubicación"
    : form.locationType === "interior"
      ? `Desde ${formatPrice(transportPrice)}`
      : transportPrice === 0
        ? "Incluido (RD$0)"
        : formatPrice(transportPrice)}
</p>

<hr />

<p>
  <strong>Total estimado:</strong>{" "}
  {estimatedTotal === null
    ? "Pendiente de ubicación"
    : form.locationType === "interior"
      ? `Desde ${formatPrice(estimatedTotal)}`
      : formatPrice(estimatedTotal)}
</p>


    {form.services.includes("Hair Party") &&
      Number(form.hairPartyGirls) === 30 && (
        <p className="reservation-form__notice">
          ✨ Para atender a las 30 niñas durante las
          dos horas contratadas, incluiremos una
          representante adicional y una silla adicional,
          permitiendo atender a dos niñas simultáneamente.
        </p>
      )}

    <small>
      Este es un estimado preliminar que incluye 
      los servicios seleccionados y la duración del evento. 
      El transporte se calculará según la ubicación. 
      El precio definitivo estará sujeto a revisión administrativa.
    </small>
  </div>
)}


<div className="reservation-form__field">
  <label htmlFor="cotization-notes">
    💌 ¿Hay algo más que debamos saber?
  </label>

  <textarea
    id="cotization-notes"
    rows="4"
    value={form.notes}
    onChange={(e) =>
      updateField("notes", e.target.value)
    }
    placeholder="Cuéntanos cualquier detalle especial de tu celebración..."
  />

  <small>
    Este campo es opcional. Puedes incluir información
    sobre la temática, el lugar o alguna solicitud especial.
  </small>
</div>

<div className="reservation-form__acceptance">
  <label>
    <input
      type="checkbox"
      checked={form.accepted}
      onChange={(e) =>
        updateField("accepted", e.target.checked)
      }
    />

    <span>
      Entiendo que el presupuesto mostrado es
      orientativo y que Caritas RD confirmará
      el precio final, la disponibilidad y las
      condiciones del servicio antes de formalizar
      la contratación.
    </span>
  </label>
</div>
</fieldset>

{submitError && (
  <p
    className="reservation-form__notice"
    role="alert"
    style={{ color: "#B91C1C" }}
  >
    ⚠️ {submitError}
  </p>
)}

{quotationResult && (
  <div
    className="reservation-form__summary"
    role="status"
  >
    <h3>✅ ¡Tu cotización ha sido guardada!</h3>

    <p>
      Gracias por elegir Caritas RD para llenar
      tu celebración de magia, alegría y color.
    </p>

    <p>
      <strong>Número de referencia:</strong>{" "}
      {quotationResult.quotationId}
    </p>


{quotationResult.emailStatus === "enviado" ? (
  <p style={{ color: "#15803D" }}>
    📧 Hemos enviado tu presupuesto detallado al correo
    electrónico <strong>{form.email}</strong>.
    Recuerda revisar también tu bandeja de correo no deseado.
  </p>
) : quotationResult.emailStatus === "fallido" ? (
  <p style={{ color: "#B45309" }}>
    ⚠️ Tu cotización ha sido guardada correctamente,
    pero no hemos podido enviar el correo electrónico.
    Conserva tu número de referencia.
  </p>
) : (
  <p style={{ color: "#475569" }}>
    📧 Tu cotización ha sido registrada correctamente.
    El envío de tu presupuesto por correo electrónico
    está pendiente.
  </p>
)}


    <p>
      <strong>Presupuesto registrado:</strong>{" "}
      {quotationResult.quotationDetails?.locationType === "interior"
        ? "Desde "
        : ""}
      {formatPrice(quotationResult.estimatedTotal)}
    </p>

    <p>
      Nuestro equipo revisará tu solicitud para
      confirmar el precio definitivo y la
      disponibilidad del servicio.
    </p>

    <small>
      Recuerda que guardar una cotización no
      significa que tu evento esté reservado.
    </small>
  </div>
)}


{!isFormValid && (
  <p className="reservation-form__notice">
    💕 Completa los datos obligatorios, selecciona
    tus servicios, indica la ubicación del evento
    y acepta las condiciones para continuar.
  </p>
)}


<button
  type="button"
  className="reservation-form__submit"
  disabled={
    !isFormValid ||
    isSubmitting ||
    Boolean(quotationResult)
  }
  onClick={handleSubmitQuotation}
>
  {isSubmitting
    ? "⏳ Guardando tu cotización..."
    : quotationResult
      ? "✅ Cotización guardada"
      : "💖 Guardar y recibir mi cotización"}
</button>



<button
  type="button"
  className="reservation-form__submit"
  disabled={!isFormValid || isSubmitting}
  onClick={() => {
    if (typeof onReserve !== "function") return;

    onReserve({
      fullName: form.fullName,
      whatsapp: form.whatsapp,
      email: form.email,
      eventType: form.eventType,
      eventDate: form.eventDate,
      startTime: form.startTime,
      duration: form.duration,
      services: [...form.services],
      childrenCount: form.childrenCount,
      
      notes: form.notes,
      quotationDetails: {
        ...quotationDetails,
        estimatedTotal,
      },

    });
  }}
>
   Quiero reservar este evento
</button>


<p className="reservation-form__notice">
  ✨ Enviar una solicitud de cotización no
  constituye una reserva confirmada.
</p>

    </section>
  );
}