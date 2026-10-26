import { useEffect, useId, useRef } from "react";

export default function EventModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}) {
  const titleId = useId();
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "Tab" && modalRef.current) {
        const elements = Array.from(
          modalRef.current.querySelectorAll(
            'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]'
          )
        );

        if (!elements.length) return;

        const first = elements[0];
        const last = elements[elements.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="event-modal__overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        ref={modalRef}
        className="event-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="event-modal__header">
          <div>
            <span className="event-modal__eyebrow">
              ✨ Caritas RD
            </span>

            <h2 id={titleId}>{title}</h2>

            {subtitle && <p>{subtitle}</p>}
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            className="event-modal__close"
            onClick={onClose}
            aria-label="Cerrar formulario"
          >
            ×
          </button>
        </div>

        <div className="event-modal__body">
          {children}
        </div>
      </section>
    </div>
  );
}