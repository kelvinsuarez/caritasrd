import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import ReservationDetails from "./ReservationDetails";

const summaryCards = [
  { label: "Total de solicitudes", key: "total", icon: "📋", className: "total" },
  { label: "Pendientes", key: "pending", icon: "⏳", className: "pending" },
  { label: "Confirmadas", key: "confirmed", icon: "✅", className: "confirmed" },
  { label: "Completadas", key: "completed", icon: "🎉", className: "completed" },
];

export default function AdminDashboard() {
  const [status, setStatus] = useState("verificando");
  const [testResult, setTestResult] = useState("");
  const [testing, setTesting] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todas");
  const [selectedReservation, setSelectedReservation] = useState(null);

  const filteredReservations = reservations.filter((reservation) => {
    const matchesName = (reservation.full_name || "")
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase());
    const matchesStatus =
      statusFilter === "todas" || reservation.status === statusFilter;
    return matchesName && matchesStatus;
  });

  const counts = {
    total: reservations.length,
    pending: reservations.filter((item) => item.status === "pendiente").length,
    confirmed: reservations.filter((item) => item.status === "confirmada").length,
    completed: reservations.filter((item) => item.status === "completada").length,
  };

  const loadReservations = useCallback(async () => {
    setTesting(true);
    setTestResult("");

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        throw new Error("No hay una sesión activa.");
      }

      const response = await fetch("/api/get-reservations", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
        },
      });
      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "No se pudieron consultar las reservaciones.");
      }

      setReservations(result.reservations || []);
      setTestResult(
        `¡Conexión exitosa! Reservaciones recibidas: ${(result.reservations || []).length}`
      );
    } catch (error) {
      setTestResult(`Error: ${error.message}`);
    } finally {
      setTesting(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function verifyAccess() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          if (active) setStatus("sin_acceso");
          return;
        }

        const response = await fetch("/api/verify-admin", {
          headers: {
            Authorization: `Bearer ${data.session.access_token}`,
          },
        });
        const result = await response.json();
        const authorized = response.ok && result.ok && result.isAdmin;

        if (active) {
          setStatus(authorized ? "autorizado" : "sin_acceso");
          if (authorized) loadReservations();
        }
      } catch (error) {
        console.error("Error verificando acceso:", error);
        if (active) setStatus("sin_acceso");
      }
    }

    verifyAccess();
    return () => {
      active = false;
    };
  }, [loadReservations]);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.replace("/admin");
  }

  if (status === "verificando") {
    return (
      <main className="admin-dashboard admin-dashboard--loading">
        <p>Verificando acceso administrativo...</p>
      </main>
    );
  }

  if (status === "sin_acceso") {
    return <Navigate to="/admin" replace />;
  }

  return (
    <>
    <main className="admin-dashboard">
      <div className="admin-dashboard__container">
        <h1 className="admin-dashboard__title">
          🎨 Panel administrativo de Caritas_RD
        </h1>

        <section className="admin-dashboard__summary" aria-label="Resumen de reservaciones">
          {summaryCards.map((item) => (
            <div className="admin-dashboard__summary-card" key={item.key}>
              <p className="admin-dashboard__summary-label">
                {item.icon} {item.label}
              </p>
              <h2 className={`admin-dashboard__summary-value admin-dashboard__summary-value--${item.className}`}>
                {counts[item.key]}
              </h2>
            </div>
          ))}
        </section>

        <div className="admin-dashboard__actions">
          <button
            type="button"
            className="admin-dashboard__button admin-dashboard__button--refresh"
            onClick={loadReservations}
            disabled={testing}
          >
            {testing ? "Actualizando..." : "Actualizar reservaciones"}
          </button>
          {testResult && (
            <p className="admin-dashboard__feedback" role="status">
              {testResult}
            </p>
          )}
        </div>

        {reservations.length > 0 && (
          <section className="admin-dashboard__reservations">
            <h2 className="admin-dashboard__section-title">📋 Reservaciones recibidas</h2>

            <div className="admin-dashboard__filters">
              <div className="admin-dashboard__filter-field">
                <label className="admin-dashboard__visually-hidden" htmlFor="reservation-search">
                  Buscar reservaciones por cliente
                </label>
                <input
                  id="reservation-search"
                  className="admin-dashboard__search"
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="🔎 Buscar por nombre del cliente..."
                />
              </div>

              <div className="admin-dashboard__filter-field">
                <label className="admin-dashboard__filter-label" htmlFor="reservation-status-filter">
                  Filtrar por estado
                </label>
                <select
                  id="reservation-status-filter"
                  className="admin-dashboard__select"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="todas">Todas las reservaciones</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="en_revision">En revisión</option>
                  <option value="confirmada">Confirmadas</option>
                  <option value="completada">Completadas</option>
                  <option value="cancelada">Canceladas</option>
                </select>
              </div>
            </div>

            <div className="admin-dashboard__table-scroll">
              <table className="admin-dashboard__table">
                <thead>
                  <tr>
                    {["Cliente", "Fecha", "Horario", "Servicios", "Estado", "Acciones"].map((heading) => (
                      <th key={heading} scope="col">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.length === 0 ? (
                    <tr>
                      <td className="admin-dashboard__empty" colSpan={6}>
                        <div className="admin-dashboard__empty-icon">🔎</div>
                        <strong>No se encontraron reservaciones</strong>
                        <span>No hay solicitudes que coincidan con los filtros seleccionados.</span>
                      </td>
                    </tr>
                  ) : (
                    filteredReservations.map((reservation) => (
                      <tr key={reservation.id}>
                        <td>{reservation.full_name}</td>
                        <td>{reservation.event_date}</td>
                        <td>{reservation.start_time?.slice(0, 5)}</td>
                        <td>{reservation.services?.join(", ")}</td>
                        <td>
                          <span className={`admin-dashboard__status admin-dashboard__status--${reservation.status}`}>
                            {reservation.status}
                          </span>
                        </td>
                        <td>
  <button
    type="button"
    className="admin-dashboard__details-button"
    onClick={() => setSelectedReservation(reservation)}
  >
    Ver detalles
  </button>
</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <button
          type="button"
          className="admin-dashboard__button admin-dashboard__button--logout"
          onClick={handleLogout}
        >
          Cerrar sesión
        </button>
      </div>
     </main>

    {selectedReservation && (
        <ReservationDetails
        key={selectedReservation.id}
        reservation={selectedReservation}
        onClose={() => setSelectedReservation(null)}
        onStatusUpdated={async () => {
        await loadReservations();
        setSelectedReservation(null);
    }}
  />
)}
  </>
);
}
