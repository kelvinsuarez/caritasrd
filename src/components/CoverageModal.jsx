import { useEffect } from "react";
import CoverageMap from "./CoverageMap";

export default function CoverageModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="coverage-modal__overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="coverage-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Consultar cobertura de Caritas RD"
      >
        <div className="coverage-modal__header">
          <div>
            <h2>¿Llegamos hasta tu fiesta? 💗</h2>
            <p>
              Descubre nuestra zona de transporte incluido.
            </p>
            <p>
              Fuera de este rango, podemos ofrecerte transporte con un costo adicional.
            </p>
          </div>

          <button
            type="button"
            className="coverage-modal__close"
            onClick={onClose}
            aria-label="Cerrar mapa"
          >
            ×
          </button>
        </div>

        <CoverageMap />
      </div>
    </div>
  );
}