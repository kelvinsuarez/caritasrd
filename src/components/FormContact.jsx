import { useState } from "react";

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const MAX_MESSAGE_LENGTH = 500;

const encode = (data) => new URLSearchParams(data).toString();

function FormContact() {
  const [formData, setFormData] = useState(initialForm);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const isSubmitting = status === "submitting";

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (status === "success" || status === "error") {
      setStatus("idle");
      setErrorMessage("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: encode({
          "form-name": "contact",
          ...formData,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al enviar el formulario");
      }

      setStatus("success");
      setFormData(initialForm);
    } catch {
      setStatus("error");
      setErrorMessage(
        "No pudimos enviar tu mensaje. Por favor, inténtalo nuevamente."
      );
    }
  };

  return (
    <div className="form-contact">

      {/* =====================================
          ENCABEZADO
      ===================================== */}

      <div className="form-contact__heading">
        <div className="form-contact__heading-row">
          <span
            className="form-contact__heading-icon"
            aria-hidden="true"
          >
            ✉
          </span>

          <h2 className="form-contact__title">
            Déjanos un mensajito
          </h2>

          <span
            className="form-contact__heading-decoration"
            aria-hidden="true"
          >
            ✨
          </span>
        </div>

        <p className="form-contact__description">
          ¿Tienes alguna pregunta? Nos encantará ayudarte.
        </p>
      </div>

      {/* =====================================
          MENSAJES DE ESTADO
      ===================================== */}

      {status === "success" && (
        <div
          className="form-contact__alert form-contact__alert--success"
          role="status"
        >
          <span aria-hidden="true">💗</span>

          <div>
            <strong>¡Mensaje enviado!</strong>
            <p>
              Gracias por escribirnos. Muy pronto
              nos pondremos en contacto contigo.
            </p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div
          className="form-contact__alert form-contact__alert--error"
          role="alert"
        >
          <span aria-hidden="true">⚠️</span>
          <p>{errorMessage}</p>
        </div>
      )}

      {/* =====================================
          FORMULARIO
      ===================================== */}

      <form
        name="contact"
        method="POST"
        data-netlify="true"
        data-netlify-honeypot="bot-field"
        className="form-contact__form"
        onSubmit={handleSubmit}
      >
        <input
          type="hidden"
          name="form-name"
          value="contact"
        />

        {/* Campo antispam */}

        <p
          className="form-contact__honeypot"
          hidden
          aria-hidden="true"
        >
          <label>
            No completar:
            <input
              type="text"
              name="bot-field"
              tabIndex={-1}
              autoComplete="off"
            />
          </label>
        </p>

        {/* =====================================
            FILA 1: NOMBRE Y CORREO
        ===================================== */}

        <div className="form-contact__row">

          {/* Nombre */}

          <div className="form-contact__field">
            <label
              htmlFor="contact-name"
              className="form-contact__sr-only"
            >
              Tu nombre
            </label>

            <div className="form-contact__input-wrapper">
              <span
                className="form-contact__field-icon"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
                </svg>
              </span>

              <input
                id="contact-name"
                name="name"
                type="text"
                placeholder="Tu nombre *"
                className="form-contact__input"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                maxLength={100}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Correo electrónico */}

          <div className="form-contact__field">
            <label
              htmlFor="contact-email"
              className="form-contact__sr-only"
            >
              Correo electrónico
            </label>

            <div className="form-contact__input-wrapper">
              <span
                className="form-contact__field-icon"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                  />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </span>

              <input
                id="contact-email"
                name="email"
                type="email"
                placeholder="Correo electrónico *"
                className="form-contact__input"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                maxLength={150}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

        </div>

        {/* =====================================
            FILA 2: TIPO DE CONSULTA
        ===================================== */}

        <div className="form-contact__field">
          <label
            htmlFor="contact-subject"
            className="form-contact__sr-only"
          >
            Tipo de consulta
          </label>

          <div className="form-contact__input-wrapper">
            <span
              className="form-contact__field-icon"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect
                  x="4"
                  y="7"
                  width="16"
                  height="13"
                  rx="2"
                />
                <path d="M8 3v7M16 3v7M4 12h16" />
              </svg>
            </span>

            <select
              id="contact-subject"
              name="subject"
              className="form-contact__select"
              value={formData.subject}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            >
              <option value="" disabled>
                Tipo de consulta *
              </option>

              <option value="Información general">
                Información general
              </option>

              <option value="Disponibilidad de fechas">
                Disponibilidad de fechas
              </option>

              <option value="Servicios y paquetes">
                Servicios y paquetes
              </option>

              <option value="Eventos especiales">
                Eventos especiales
              </option>

              <option value="Otra consulta">
                Otra consulta
              </option>
            </select>
          </div>
        </div>

        {/* =====================================
            FILA 3: MENSAJE
        ===================================== */}

        <div className="form-contact__field">
          <label
            htmlFor="contact-message-text"
            className="form-contact__sr-only"
          >
            Tu mensaje
          </label>

          <div className="form-contact__textarea-wrapper">
            <span
              className="form-contact__field-icon form-contact__field-icon--textarea"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 5h16v12H9l-5 4V5Z" />
                <path d="M8 10h8M8 13h5" />
              </svg>
            </span>

            <textarea
              id="contact-message-text"
              name="message"
              placeholder="Tu mensaje *"
              className="form-contact__textarea"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              minLength={10}
              maxLength={MAX_MESSAGE_LENGTH}
              required
              disabled={isSubmitting}
            />

            <span className="form-contact__counter">
              {formData.message.length}/{MAX_MESSAGE_LENGTH}
            </span>
          </div>
        </div>

        {/* =====================================
            BOTÓN DE ENVÍO
        ===================================== */}

        <button
          type="submit"
          className="form-contact__submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span
                className="form-contact__spinner"
                aria-hidden="true"
              />
              Enviando mensaje...
            </>
          ) : (
            <>
              <svg
                className="form-contact__submit-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>

              <span>Enviar mensaje</span>

              <span
                className="form-contact__submit-arrow"
                aria-hidden="true"
              >
                →
              </span>
            </>
          )}
        </button>

        {/* =====================================
            PRIVACIDAD
        ===================================== */}

        <p className="form-contact__privacy">
          <span aria-hidden="true">🔒</span>
          Tus datos están seguros con nosotras.
          Solo los usaremos para responder tu mensaje.
        </p>

      </form>
    </div>
  );
}

export default FormContact;