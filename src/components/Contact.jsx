import { useState } from "react";
import FormContact from "./FormContact";

import contactHero from "../images/contact/contact-hero.jpeg";
import contactForm from "../images/contact/contact-form.jpg";

import {
  FaWhatsapp,
  FaInstagram,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";

const contactMethods = [
  {
    id: "whatsapp",
    icon: <FaWhatsapp />,
    title: "WhatsApp",
    description: "¡Escríbenos! Estamos felices de ayudarte.",
    linkText: "Enviar mensaje",
    href: "https://wa.me/18090000000",
    className: "contact__card--whatsapp",
  },
  {
    id: "instagram",
    icon: <FaInstagram />,
    title: "Instagram",
    description: "Síguenos y descubre toda nuestra magia.",
    linkText: "Visitar Instagram",
    href: "https://www.instagram.com/caritas_rd/",
    className: "contact__card--instagram",
  },
  {
    id: "email",
    icon: <FaEnvelope />,
    title: "Correo electrónico",
    description: "Para consultas y solicitudes especiales.",
    linkText: "Enviar correo",
    href: "mailto:correo@ejemplo.com",
    className: "contact__card--email",
  },
  {
    id: "location",
    icon: <FaMapMarkerAlt />,
    title: "Zona de servicio",
    description: "Llevamos alegría hasta tu celebración.",
    linkText: "Consultar cobertura",
    href: "#contact-message",
    className: "contact__card--location",
  },
];

const faqs = [
  {
    question: "¿Con cuánto tiempo debo reservar?",
    answer:
      "Te recomendamos reservar con minimo una semana de anticipación para asegurar la disponibilidad de la fecha de tu evento. Puedes escribirnos para consultar los espacios disponibles.",
  },
  {
    question: "¿Se trasladan también hasta el interior?",
    answer:
      "¡Sí! Llevamos nuestros servicios hasta el lugar de tu celebración. La disponibilidad y los posibles costos de traslado dependen del lugar.",
  },
  {
    question: "¿Cuánto dura el servicio de pintacaritas?",
    answer:
      "La duración depende del paquete contratado y de las necesidades de tu evento. Contáctanos y te ayudaremos a elegir la mejor opción.",
  },
  {
    question: "¿Puedo combinar varios servicios en mi evento?",
    answer:
      "¡Por supuesto! Podemos ayudarte a combinar diferentes experiencias para que tu celebración sea todavía más especial.",
  },
  {
    question: "¿Cómo puedo solicitar una cotización?",
    answer:
      "Puedes utilizar nuestro formulario de cotización o escribirnos directamente por WhatsApp. Cuéntanos la fecha, el lugar y los servicios que necesitas.",
  },
];

function Contact({ openReservation, openCotization }) {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq((previous) =>
      previous === index ? null : index
    );
  };

  return (
    <main className="contact">

      {/* =========================
          HERO / ENCABEZADO
      ========================= */}

      <section className="contact__hero">
        <div className="contact__hero-content">
          <span className="contact__eyebrow">
            💗 Estamos aquí para ti
          </span>

          <h1 className="contact__hero-title">
            ¡Hablemos de tu
            <span> próxima fiesta!</span>
          </h1>

          <p className="contact__hero-description">
            Estamos listas para llenar tu celebración de
            colores, sonrisas y momentos inolvidables.
            ¡Cuéntanos qué tienes en mente!
          </p>

        </div>

        <div className="contact__hero-visual">
          <div className="contact__hero-image-wrapper">
            <img
              src={contactHero}
              alt="Niña feliz con maquillaje artístico infantil"
              className="contact__hero-image"
            />
          </div>

          <span
            className="contact__hero-star"
            aria-hidden="true"
          >
            ⭐
          </span>

          <span
            className="contact__hero-heart"
            aria-hidden="true"
          >
            💗
          </span>

          <div className="contact__hero-sticker">
            ¡La magia comienza
            <span>con un hola!</span>
            ✨
          </div>
        </div>
      </section>


      {/* =========================
          MEDIOS DE CONTACTO
      ========================= */}

      <section className="contact__methods">
        <div className="contact__section-heading">
          <h2 className="contact__section-title">
             <span>Contáctanos</span>
          </h2>

          <p>
            Elige tu forma favorita de comunicarte
            con nosotras.
          </p>
        </div>

        <div className="contact__cards">
          {contactMethods.map((method) => (
            <article
              key={method.id}
              className={`contact__card ${method.className}`}
            >
              <div
                className="contact__card-icon"
                aria-hidden="true"
              >
                {method.icon}
              </div>

              <h3>{method.title}</h3>

              <p>{method.description}</p>

              <a
                href={method.href}
                className="contact__card-link"
                target={
                  method.id === "instagram" ||
                  method.id === "whatsapp"
                    ? "_blank"
                    : undefined
                }
                rel={
                  method.id === "instagram" ||
                  method.id === "whatsapp"
                    ? "noopener noreferrer"
                    : undefined
                }
              >
                {method.linkText}
                <span aria-hidden="true"> →</span>
              </a>
            </article>
          ))}
        </div>
      </section>


      {/* =========================
          FORMULARIO DE CONTACTO
      ========================= */}

      <section
        className="contact__message-section"
        id="contact-message"
      >
        <div className="contact__message-layout">

          <div className="contact__message-form">
            <FormContact />
          </div>

          <div className="contact__message-visual">
            <div className="contact__message-image-wrapper">
              <img
                src={contactForm}
                alt="Niño sonriente con pintacaritas de tigre"
                className="contact__message-image"
              />
            </div>

            <div className="contact__message-sticker">
              ¡Nos encanta
              <span>escucharte!</span>
              💕
            </div>

            <span
              className="contact__message-star"
              aria-hidden="true"
            >
              ✨
            </span>
          </div>

        </div>
      </section>


      {/* =========================
          PREGUNTAS FRECUENTES
      ========================= */}

      <section className="contact__faq">
        <div className="contact__section-heading">
          <span className="contact__section-eyebrow">
            Resolvemos tus dudas
          </span>

          <h2 className="contact__section-title">
            Preguntas
            <span> frecuentes</span>
          </h2>

          <p>
            Aquí encontrarás respuestas a algunas de
            las preguntas que más nos hacen.
          </p>
        </div>

        <div className="contact__faq-list">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;

            return (
              <div
                className={`contact__faq-item ${
                  isOpen ? "contact__faq-item--open" : ""
                }`}
                key={faq.question}
              >
                <h3 className="contact__faq-question">
                  <button
                    type="button"
                    className="contact__faq-toggle"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                    aria-controls={`contact-faq-${index}`}
                  >
                    <span>{faq.question}</span>

                    <span
                      className="contact__faq-icon"
                      aria-hidden="true"
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                </h3>

                <div
                  id={`contact-faq-${index}`}
                  className="contact__faq-answer"
                  hidden={!isOpen}
                >
                  <p>{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>

        <p className="contact__faq-footer">
          ¿Tienes otra pregunta?
          <a href="#contact-message">
            ¡Escríbenos, estaremos felices de ayudarte!
          </a>
        </p>
      </section>


      {/* =========================
          LLAMADO FINAL A LA ACCIÓN
      ========================= */}

      <section className="contact__cta">
        <span
          className="contact__cta-decoration contact__cta-decoration--star"
          aria-hidden="true"
        >
          ⭐
        </span>

        <div className="contact__cta-content">
          <span className="contact__cta-eyebrow">
            🎨 Momentos llenos de magia
          </span>

          <h2>
            ¡Hagamos que tu fiesta
            <span> sea inolvidable!</span>
          </h2>

          <p>
            Cada celebración merece un toque especial
            de alegría, creatividad y mucho color.
          </p>

          <div className="contact__cta-buttons">
            <button
              type="button"
              className="contact__cta-button contact__cta-button--reservation"
              onClick={openReservation}
            >
              Reserva tu fecha
              <span aria-hidden="true"> 💗</span>
            </button>

            <button
              type="button"
              className="contact__cta-button contact__cta-button--cotization"
              onClick={openCotization}
            >
              Cotiza tu evento
              <span aria-hidden="true"> ✨</span>
            </button>
          </div>
        </div>

        <span
          className="contact__cta-decoration contact__cta-decoration--heart"
          aria-hidden="true"
        >
          💕
        </span>
      </section>

    </main>
  );
}

export default Contact;