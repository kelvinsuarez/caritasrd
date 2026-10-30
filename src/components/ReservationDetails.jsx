import { useEffect, useState } from "react";

export default function ReservationDetails({
  reservation,
  onClose,
  onStatusUpdated,
}) {

     const [newStatus, setNewStatus] = useState(
        reservation?.status ?? "pendiente"
     );
  const [saving, setSaving] = useState(false);
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [teamsError, setTeamsError] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState(false);

    const assignment = reservation?.team_assignments;

    const assignedTeam = Array.isArray(assignment)
        ? assignment[0]?.teams ?? null
        : assignment?.teams ?? null;
  

  async function loadAvailableTeams() {
  if (!reservation || loadingTeams) return;

  setLoadingTeams(true);
  setTeamsError("");
  setTeams([]);
  setSelectedTeamId("");

  try {
    const { supabase } = await import("../lib/supabaseClient");

    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      throw new Error("Tu sesión ha expirado.");
    }

    const params = new URLSearchParams({
      date: reservation.event_date,
      time: reservation.start_time.slice(0, 5),
      duration: String(reservation.duration),
    });

    const response = await fetch(
      `/api/get-available-teams?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(
        result.error || "No se pudo consultar la disponibilidad."
      );
    }

    setTeams(result.teams || []);
  } catch (error) {
    setTeamsError(error.message);
  } finally {
    setLoadingTeams(false);
  }
}

async function handleCompleteReservation() {
  if (
    !reservation ||
    reservation.status !== "confirmada" ||
    saving
  ) {
    return;
  }

  const confirmed = window.confirm(
    "¿Confirmas que este evento ya fue realizado?\n\n" +
    "La reservación cambiará a Completada y " +
    "conservará su equipo asignado."
  );

  if (!confirmed) return;

  setSaving(true);
  setSaveMessage("");
  setSaveError(false);

  try {
    const { supabase } = await import("../lib/supabaseClient");

    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      throw new Error(
        "Tu sesión ha expirado. Inicia sesión nuevamente."
      );
    }

    const response = await fetch(
      "/api/update-reservation-status",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.session.access_token}`,
        },
        body: JSON.stringify({
          reservationId: reservation.id,
          status: "completada",
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(
        result.error ||
        "No se pudo completar la reservación."
      );
    }

    setSaveMessage(
      "¡Evento marcado como completado correctamente!"
    );

    if (onStatusUpdated) {
      await onStatusUpdated();
    }
  } catch (error) {
    setSaveError(true);
    setSaveMessage(
      error instanceof Error
        ? error.message
        : "No se pudo completar la reservación."
    );
  } finally {
    setSaving(false);
  }
}

async function handleConfirmReservation() {
  if (!reservation || !selectedTeamId || confirming) return;

  const selectedTeam = teams.find(
    (team) => team.id === selectedTeamId
  );

  if (!selectedTeam?.available) {
    setTeamsError(
      "El equipo seleccionado no está disponible. Consulta nuevamente."
    );
    return;
  }

  const confirmed = window.confirm(
    `¿Deseas asignar ${selectedTeam.name} y confirmar esta reservación?\n\nEsta acción comprometerá la disponibilidad del equipo.`
  );

  if (!confirmed) return;

  setConfirming(true);
  setTeamsError("");
  setSaveMessage("");

  try {
    const { supabase } = await import("../lib/supabaseClient");

    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      throw new Error(
        "Tu sesión ha expirado. Inicia sesión nuevamente."
      );
    }

    const response = await fetch("/api/confirm-reservation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.session.access_token}`,
      },
      body: JSON.stringify({
        reservationId: reservation.id,
        teamId: selectedTeamId,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(
        result.error || "No se pudo confirmar la reservación."
      );
    }

    setSaveMessage(
      "¡Reservación confirmada y equipo asignado correctamente!"
    );
    setSaveError(false);

    if (onStatusUpdated) {
      await onStatusUpdated();
    }
  } catch (error) {
    setTeamsError(
      error instanceof Error
        ? error.message
        : "No se pudo confirmar la reservación."
    );

    // La disponibilidad pudo cambiar mientras se confirmaba.
    setTeams([]);
    setSelectedTeamId("");
  } finally {
    setConfirming(false);
  }
}


  async function handleSaveStatus() {
    if (!reservation || saving) return;

    if (newStatus === reservation.status) {
      setSaveMessage("No hay cambios pendientes.");
      setSaveError(false);
      return;
    }

    setSaving(true);
    setSaveMessage("");
    setSaveError(false);

    try {
      const { supabase } = await import("../lib/supabaseClient");

      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        throw new Error("Tu sesión ha expirado. Inicia sesión nuevamente.");
      }

      const response = await fetch("/api/update-reservation-status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.session.access_token}`,
        },
        body: JSON.stringify({
          reservationId: reservation.id,
          status: newStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(
          result.error || "No se pudo actualizar la reservación."
        );
      }

      setSaveMessage("¡Estado actualizado correctamente!");
      setSaveError(false);

      if (onStatusUpdated) {
        await onStatusUpdated();
      }
    } catch (error) {
      setSaveMessage(error.message);
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!reservation) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [reservation, onClose]);

  if (!reservation) return null;

  function displayValue(value) {
    if (value === null || value === undefined || value === "") {
      return "No especificado";
    }

    return value;
  }

  function displayBoolean(value) {
    if (value === true || value === "si") {
        return "Sí";
    }

    if (value === false || value === "no") {
        return "No";
    }

    return "No especificado";
  }

  function formatTime(time) {
    return time ? time.slice(0, 5) : "No especificado";
  }

  const fields = [
    ["Nombre del cliente", reservation.full_name],
    ["WhatsApp", reservation.whatsapp],
    ["Correo electrónico", reservation.email],
    ["Tipo de evento", reservation.event_type],
    ["Fecha del evento", reservation.event_date],
    ["Hora de inicio", formatTime(reservation.start_time)],
    ["Hora de finalización", formatTime(reservation.end_time)],
    ["Duración", reservation.duration],
    [
      "Servicios solicitados",
      Array.isArray(reservation.services)
        ? reservation.services.join(", ")
        : reservation.services,
    ],
    ["Cantidad de niños", reservation.children_count],
    ["Dirección", reservation.address],
    ["Temática", reservation.theme],
    ["Edad del cumpleañero", reservation.birthday_age],
    ["Observaciones", reservation.notes],
    ["Estado", reservation.status],
    [
      "Autorización de fotografías",
      displayBoolean(reservation.photo_authorization),
    ],
  ];

  return (
    <div
      className="reservation-details__overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="reservation-details__modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reservation-details-title"
      >
        <header className="reservation-details__header">
          <div>
            <h2 id="reservation-details-title">
              🎨 Detalles de la reservación
            </h2>

            <p>
              Información registrada por el cliente
            </p>
          </div>

          <button
            type="button"
            className="reservation-details__close"
            onClick={onClose}
            aria-label="Cerrar detalles"
          >
            ×
          </button>
        </header>

        <div className="reservation-details__body">
          {fields.map(([label, value]) => (
            <div
              className="reservation-details__field"
              key={label}
            >
              <span className="reservation-details__label">
                {label}
              </span>

              <span className="reservation-details__value">
                {displayValue(value)}
              </span>
            </div>
          ))}
        </div>

        <div className="reservation-details__management">
  <h3>Gestionar reservación</h3>

  {reservation.status === "confirmada" ? (
    <div className="reservation-details__status-summary">
      <p>
        <strong>Estado actual:</strong>{" "}
        <span className="reservation-details__status-confirmed">
          ✓ Confirmada
        </span>
      </p>
      {reservation.status === "completada" && (
        <p>
            <strong>Equipo responsable:</strong>{" "}
            {assignedTeam?.name ?? "No identificado"}
        </p>
      )}

      <p>
        <strong>Equipo responsable:</strong>{" "}
        {assignedTeam?.name ?? "No identificado"}
      </p>

      <p className="reservation-details__notice">
        Esta reservación ya está confirmada y tiene un equipo
        asignado. No es necesario volver a confirmarla.
        <button
  type="button"
  className="reservation-details__complete-button"
  onClick={handleCompleteReservation}
  disabled={saving}
>
  {saving
    ? "Actualizando evento..."
    : "✓ Marcar evento como completado"}
</button>

{saveMessage && (
  <p
    role="status"
    className={
      saveError
        ? "reservation-details__message reservation-details__message--error"
        : "reservation-details__message"
    }
  >
    {saveMessage}
  </p>
)}
      </p>
    </div>
  ) : reservation.status === "completada" ||
    reservation.status === "cancelada" ? (
    
        <div className="reservation-details__status-summary">
  <p>
    <strong>Estado actual:</strong>{" "}
    {reservation.status === "completada"
      ? "Completada"
      : "Cancelada"}
  </p>

  {reservation.status === "completada" && (
    <p>
      <strong>Equipo responsable:</strong>{" "}
      {assignedTeam?.name ?? "No identificado"}
    </p>
  )}

  <p className="reservation-details__notice">
    Esta reservación tiene un estado final y no admite
    modificaciones desde esta sección.
  </p>
</div>
  ) : (
    <>
      <label
        className="reservation-details__management-label"
        htmlFor="reservation-new-status"
      >
        Cambiar estado
      </label>

      <select
        id="reservation-new-status"
        className="reservation-details__management-select"
        value={newStatus}
        onChange={(event) => {
          setNewStatus(event.target.value);
          setSaveMessage("");
        }}
        disabled={saving}
      >
        <option value="pendiente">Pendiente</option>
        <option value="en_revision">En revisión</option>
        <option value="confirmada" disabled>
          Confirmada — usar asignación de equipo
        </option>
        <option value="cancelada">Cancelada</option>
      </select>

      <button
        type="button"
        className="reservation-details__save-button"
        onClick={handleSaveStatus}
        disabled={
          saving ||
          newStatus === reservation.status
        }
      >
        {saving ? "Guardando..." : "Guardar cambios"}
      </button>

      {saveMessage && (
        <p
          role="status"
          className={
            saveError
              ? "reservation-details__message reservation-details__message--error"
              : "reservation-details__message"
          }
        >
          {saveMessage}
        </p>
      )}
    </>
  )}
</div>
    {["pendiente", "en_revision"].includes(reservation.status) && (
        <div className="reservation-details__teams">

  <h3>🎨 Disponibilidad de equipos</h3>

  <p className="reservation-details__teams-description">
    Consulta qué equipos pueden atender este evento.
  </p>

  <button
    type="button"
    className="reservation-details__check-button"
    onClick={loadAvailableTeams}
    disabled={loadingTeams}
  >
    {loadingTeams
      ? "Consultando disponibilidad..."
      : "Consultar equipos disponibles"}
  </button>

  {teamsError && (
    <p className="reservation-details__message reservation-details__message--error">
      {teamsError}
    </p>
  )}

  {teams.length > 0 && (
    <div className="reservation-details__teams-list">
      {teams.map((team) => (
        <label
          key={team.id}
          className="reservation-details__team-option"
        >
          <input
            type="radio"
            name="selected-team"
            value={team.id}
            checked={selectedTeamId === team.id}
            onChange={() => setSelectedTeamId(team.id)}
            disabled={!team.available}
          />

          <span className="reservation-details__team-name">
            {team.name}
          </span>

          <span
            className={
              team.available
                ? "reservation-details__team-status reservation-details__team-status--available"
                : "reservation-details__team-status reservation-details__team-status--busy"
            }
          >
            {team.available ? "Disponible" : "Ocupado"}
          </span>
        </label>
      ))}
    </div>
  )}

  {reservation.status !== "confirmada" &&
  reservation.status !== "cancelada" &&
  reservation.status !== "completada" && (
    <button
      type="button"
      className="reservation-details__confirm-button"
      onClick={handleConfirmReservation}
      disabled={
        !selectedTeamId ||
        loadingTeams ||
        confirming ||
        saving
      }
    >
      {confirming
        ? "Confirmando reservación..."
        : "Asignar equipo y confirmar"}
    </button>
        )}
    </div>
)}
        <footer className="reservation-details__footer">
          <button
            type="button"
            className="reservation-details__button"
            onClick={onClose}
          >
            Cerrar
          </button>
        </footer>
      </section>
    </div>
  );
}