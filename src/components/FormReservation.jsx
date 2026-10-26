import { useState } from "react";

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
  address: "",
  theme: "",
  birthdayAge: "",
  notes: "",
  accepted: false,
  photoAuthorization: "",
};

const serviceOptions = [
  "Pintacaritas",
  "Hair Party",
  "Stan de glitter para adultos",
  "Otros servicios",
];

const eventTypes = [
  "Cumpleaños infantil",
  "Actividad escolar",
  "Evento familiar",
  "Evento corporativo",
  "Otro",
];

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getEndTime(startTime, duration) {
  if (!startTime) return "";

  const [hours, minutes] = startTime.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + Number(duration) * 60;

  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;

  return `${String(endHours).padStart(2, "0")}:${String(
    endMinutes
  ).padStart(2, "0")}`;
}

export default function FormReservation() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));
  };

  const toggleService = (service) => {
    setForm((previous) => ({
      ...previous,
      services: previous.services.includes(service)
        ? previous.services.filter((item) => item !== service)
        : [...previous.services, service],
    }));

    setErrors((previous) => ({
      ...previous,
      services: "",
    }));
  };

  const validateStep = () => {
    const nextErrors = {};

    if (step === 1) {
      if (!form.fullName.trim()) {
        nextErrors.fullName = "Escribe tu nombre completo.";
      }

      if (!/^[0-9+()\s-]{10,20}$/.test(form.whatsapp.trim())) {
        nextErrors.whatsapp = "Introduce un teléfono válido.";
      }

      if (
        form.email.trim() &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
      ) {
        nextErrors.email = "Introduce un correo válido.";
      }

      if (!form.eventType) {
        nextErrors.eventType = "Selecciona el tipo de celebración.";
      }
    }

    if (step === 2) {
      if (!form.eventDate || form.eventDate < getToday()) {
        nextErrors.eventDate = "Selecciona una fecha válida.";
      }

      if (!form.startTime) {
        nextErrors.startTime = "Selecciona la hora de inicio.";
      }

      if (form.services.length === 0) {
        nextErrors.services = "Selecciona al menos un servicio.";
      }

      if (!form.address.trim()) {
        nextErrors.address = "Indica dónde se realizará el evento.";
      }

      if (
        form.childrenCount &&
        (!Number.isInteger(Number(form.childrenCount)) ||
          Number(form.childrenCount) < 1)
      ) {
        nextErrors.childrenCount = "Introduce una cantidad válida.";
      }
      if (step === 3 && !form.photoAuthorization) {
  nextErrors.photoAuthorization =
    "Selecciona Sí o No para continuar.";
}
    }

    if (step === 3) {
      if (!form.accepted) {
        nextErrors.accepted =
          "Debes autorizar el uso de tus datos.";
      }

      if (!["si", "no"].includes(form.photoAuthorization)) {
        nextErrors.photoAuthorization =
          "Debes seleccionar Sí o No para continuar.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((previous) => Math.min(previous + 1, 3));
    }
  };

  const previousStep = () => {
    setErrors({});
    setStep((previous) => Math.max(previous - 1, 1));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateStep()) return;

    // Próximo paso:
    // Enviar la solicitud a nuestra función segura
    // y guardarla en Supabase.

    console.log("Solicitud preparada:", form);

    // Todavía no mostramos confirmación de envío,
    // porque no existe una conexión al servidor.
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="reservation-form__success">
        <h3>¡Solicitud recibida! 🎉</h3>
        <p>
          Pronto nos comunicaremos contigo para confirmar
          los detalles de tu celebración.
        </p>
      </div>
    );
  }

  return (
    <form
      className="reservation-form"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="reservation-form__progress">
        <div className="reservation-form__progress-labels">
          <span>Datos personales</span>
          <span>Tu evento</span>
          <span>Confirmación</span>
        </div>

        <div className="reservation-form__progress-track">
          <div
            className="reservation-form__progress-fill"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <p>Paso {step} de 3</p>
      </div>

      {step === 1 && (
        <div className="reservation-form__step">
          <h3>¡Queremos conocerte! 💕</h3>
          <p>Cuéntanos cómo podemos comunicarnos contigo.</p>

          <div className="reservation-form__field">
            <label htmlFor="reservation-name">
              Nombre completo *
            </label>
            <input
              id="reservation-name"
              type="text"
              autoComplete="name"
              value={form.fullName}
              onChange={(e) =>
                updateField("fullName", e.target.value)
              }
              placeholder="Tu nombre y apellido"
            />
            {errors.fullName && (
              <small className="reservation-form__error">
                {errors.fullName}
              </small>
            )}
          </div>

          <div className="reservation-form__field">
            <label htmlFor="reservation-whatsapp">
              Número de WhatsApp *
            </label>
            <input
              id="reservation-whatsapp"
              type="tel"
              autoComplete="tel"
              value={form.whatsapp}
              onChange={(e) =>
                updateField("whatsapp", e.target.value)
              }
              placeholder="809-000-0000"
            />
            {errors.whatsapp && (
              <small className="reservation-form__error">
                {errors.whatsapp}
              </small>
            )}
          </div>

          <div className="reservation-form__field">
            <label htmlFor="reservation-email">
              Correo electrónico (opcional)
            </label>
            <input
              id="reservation-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) =>
                updateField("email", e.target.value)
              }
              placeholder="correo@ejemplo.com"
            />
            {errors.email && (
              <small className="reservation-form__error">
                {errors.email}
              </small>
            )}
          </div>

          <div className="reservation-form__field">
            <label htmlFor="reservation-event-type">
              Tipo de celebración *
            </label>
            <select
              id="reservation-event-type"
              value={form.eventType}
              onChange={(e) =>
                updateField("eventType", e.target.value)
              }
            >
              <option value="">Selecciona una opción</option>
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.eventType && (
              <small className="reservation-form__error">
                {errors.eventType}
              </small>
            )}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="reservation-form__step">
          <h3>¡Cuéntanos sobre tu fiesta! 🎈</h3>
          <p>Organicemos los detalles de tu celebración.</p>

          <div className="reservation-form__row">
            <div className="reservation-form__field">
              <label htmlFor="reservation-date">
                Fecha del evento *
              </label>
              <input
                id="reservation-date"
                type="date"
                min={getToday()}
                value={form.eventDate}
                onChange={(e) =>
                  updateField("eventDate", e.target.value)
                }
              />
              {errors.eventDate && (
                <small className="reservation-form__error">
                  {errors.eventDate}
                </small>
              )}
            </div>

            <div className="reservation-form__field">
              <label htmlFor="reservation-time">
                Hora de inicio *
              </label>
              <input
                id="reservation-time"
                type="time"
                value={form.startTime}
                onChange={(e) =>
                  updateField("startTime", e.target.value)
                }
              />
              {errors.startTime && (
                <small className="reservation-form__error">
                  {errors.startTime}
                </small>
              )}
            </div>
          </div>

          <div className="reservation-form__field">
            <label htmlFor="reservation-duration">
              Duración del servicio *
            </label>
            <select
              id="reservation-duration"
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

          {form.startTime && (
            <p className="reservation-form__schedule">
              Horario solicitado: {form.startTime} a{" "}
              {getEndTime(form.startTime, form.duration)}
            </p>
          )}

          <fieldset className="reservation-form__services">
            <legend>Servicios que deseas contratar *</legend>

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

            {errors.services && (
              <small className="reservation-form__error">
                {errors.services}
              </small>
            )}
          </fieldset>

          <div className="reservation-form__field">
            <label htmlFor="reservation-children">
              Cantidad aproximada de niños
            </label>
            <input
              id="reservation-children"
              type="number"
              min="1"
              step="1"
              value={form.childrenCount}
              onChange={(e) =>
                updateField("childrenCount", e.target.value)
              }
              placeholder="Ej. 15"
            />
            {errors.childrenCount && (
              <small className="reservation-form__error">
                {errors.childrenCount}
              </small>
            )}
          </div>

          <div className="reservation-form__field">
            <label htmlFor="reservation-address">
              Dirección o sector del evento *
            </label>
            <textarea
              id="reservation-address"
              rows="3"
              value={form.address}
              onChange={(e) =>
                updateField("address", e.target.value)
              }
              placeholder="Sector, dirección y referencias"
            />
            {errors.address && (
              <small className="reservation-form__error">
                {errors.address}
              </small>
            )}
          </div>

          <div className="reservation-form__notice">
            📅 La disponibilidad será verificada antes de
            confirmar tu reserva.
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="reservation-form__step">
          <h3>¡Ya casi terminamos! ✨</h3>
          <p>Revisa los detalles de tu solicitud.</p>

          <div className="reservation-form__summary">
            <p><strong>Nombre:</strong> {form.fullName}</p>
            <p><strong>WhatsApp:</strong> {form.whatsapp}</p>
            <p><strong>Celebración:</strong> {form.eventType}</p>
            <p><strong>Fecha:</strong> {form.eventDate}</p>
            <p>
              <strong>Horario:</strong> {form.startTime} -{" "}
              {getEndTime(form.startTime, form.duration)}
            </p>
            <p>
              <strong>Servicios:</strong>{" "}
              {form.services.join(", ")}
            </p>
            <p><strong>Lugar:</strong> {form.address}</p>
          </div>

          <div className="reservation-form__row">
            <div className="reservation-form__field">
              <label htmlFor="reservation-theme">
                Temática de la fiesta
              </label>
              <input
                id="reservation-theme"
                value={form.theme}
                onChange={(e) =>
                  updateField("theme", e.target.value)
                }
                placeholder="Ej. Princesas"
              />
            </div>

            <div className="reservation-form__field">
              <label htmlFor="reservation-age">
                Edad del festejado
              </label>
              <input
                id="reservation-age"
                type="number"
                min="0"
                max="120"
                value={form.birthdayAge}
                onChange={(e) =>
                  updateField("birthdayAge", e.target.value)
                }
                placeholder="Ej. 5"
              />
            </div>
          </div>

          <div className="reservation-form__field">
            <label htmlFor="reservation-notes">
              Comentarios adicionales
            </label>
            <textarea
              id="reservation-notes"
              rows="3"
              value={form.notes}
              onChange={(e) =>
                updateField("notes", e.target.value)
              }
              placeholder="Cuéntanos cualquier detalle especial..."
            />
          </div>

          <label className="reservation-form__consent">
            <input
              type="checkbox"
              checked={form.accepted}
              onChange={(e) =>
                updateField("accepted", e.target.checked)
              }
            />
            <span>
              Autorizo a Caritas RD a utilizar mis datos
              para gestionar esta solicitud y contactarme.
            </span>
          </label>

          <div className="reservation-form__field">
          <label>
            ¿Estaría de acuerdo con el uso de fotografías y videos de los
            participantes de la actividad para su publicación
            en las páginas oficiales de Caritas_RD? *
          </label>

          <div className="reservation-form__photo-options">
          <label>
          <input
            type="radio"
            name="photoAuthorization"
            value="si"
            checked={form.photoAuthorization === "si"}
            onChange={(e) =>
              updateField("photoAuthorization", e.target.value)
            }
          />
            Sí
          </label>

          <label>
             <input
                type="radio"
                name="photoAuthorization"
                value="no"
                checked={form.photoAuthorization === "no"}
                onChange={(e) =>
                    updateField("photoAuthorization", e.target.value)
                }
             />
               No
             </label>
          </div>

  {errors.photoAuthorization && (
    <small className="reservation-form__error">
      {errors.photoAuthorization}
    </small>
  )}
</div>

          {errors.accepted && (
            <small className="reservation-form__error">
              {errors.accepted}
            </small>
          )}

          <div className="reservation-form__notice">
             Esta solicitud no confirma automáticamente
            tu reserva. Nuestro equipo se comunicará
            contigo para validar disponibilidad.
          </div>
        </div>
      )}

      <div className="reservation-form__actions">
        {step > 1 ? (
          <button
            type="button"
            className="reservation-form__back"
            onClick={previousStep}
          >
            ← Anterior
          </button>
        ) : (
          <span />
        )}

        {step < 3 ? (
          <button
            type="button"
            className="reservation-form__next"
            onClick={nextStep}
          >
            Siguiente →
          </button>
        ) : (
          <button
            type="submit"
            className="reservation-form__submit"
            disabled={
                !form.accepted ||
                !["si", "no"].includes(form.photoAuthorization)
                }
        >
            Revisar solicitud
          </button>
        )}
      </div>
    </form>
  );
}