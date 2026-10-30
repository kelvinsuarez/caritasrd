import { useState } from "react";

const weekDays = ["L", "M", "M", "J", "V", "S", "D"];

export default function AdminCalendar({
  reservations = [],
  onViewDetails,
}) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();

    return new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );
  });

  const [selectedDate, setSelectedDate] = useState(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const firstDay =
    (new Date(year, month, 1).getDay() + 6) % 7;

  const formatDate = (day) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const reservationsByDate = reservations.reduce(
    (result, reservation) => {
      const date = reservation.event_date;

      if (date) {
        if (!result[date]) {
          result[date] = [];
        }

        result[date].push(reservation);
      }

      return result;
    },
    {}
  );

  const changeMonth = (direction) => {
    setCurrentMonth(
      new Date(year, month + direction, 1)
    );

    setSelectedDate(null);
  };

  const selectedReservations = selectedDate
    ? [...(reservationsByDate[selectedDate] || [])].sort(
        (a, b) =>
          (a.start_time || "").localeCompare(
            b.start_time || ""
          )
      )
    : [];

  const calendarDays = [
    ...Array(firstDay).fill(null),
    ...Array.from(
      { length: daysInMonth },
      (_, index) => index + 1
    ),
  ];

  return (
    <section
      className="admin-calendar"
      aria-label="Calendario de eventos"
    >
      <div className="admin-calendar__header">
        <h2 className="admin-calendar__title">
          📅 Calendario de eventos
        </h2>

        <div className="admin-calendar__navigation">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label="Mes anterior"
          >
            ‹
          </button>

          <span>
            {currentMonth.toLocaleDateString("es-DO", {
              month: "long",
              year: "numeric",
            })}
          </span>

          <button
            type="button"
            onClick={() => changeMonth(1)}
            aria-label="Mes siguiente"
          >
            ›
          </button>
        </div>
      </div>

      <div className="admin-calendar__grid">
        {weekDays.map((day, index) => (
          <div
            className="admin-calendar__weekday"
            key={index}
          >
            {day}
          </div>
        ))}

        {calendarDays.map((day, index) => {
          if (day === null) {
            return (
              <div
                className="admin-calendar__empty-day"
                key={`empty-${index}`}
              />
            );
          }

          const date = formatDate(day);
          const events = reservationsByDate[date] || [];

          const eventStatuses = [
            ...new Set(events.map((event) => event.status)),
          ];

          return (
            <button
              key={date}
              type="button"
              className={`admin-calendar__day ${
                selectedDate === date
                  ? "admin-calendar__day--selected"
                  : ""
              }`}
              onClick={() => setSelectedDate(date)}
              aria-label={`${date}: ${events.length} reservaciones`}
              aria-pressed={selectedDate === date}
            >
              <span>{day}</span>

              {events.length > 0 && (
  <>
    <span className="admin-calendar__count">
      {events.length}
    </span>

    <span
      className="admin-calendar__status-dots"
      aria-hidden="true"
    >
      {eventStatuses.map((status) => (
        <span
          key={status}
          className={`admin-calendar__status-dot admin-calendar__status-dot--${status}`}
        />
      ))}
    </span>
  </>
)}
            </button>
          );
        })}
      </div>

      <div
  className="admin-calendar__legend"
  aria-label="Significado de los colores"
>
  <span className="admin-calendar__legend-item">
    <i className="admin-calendar__status-dot admin-calendar__status-dot--pendiente" />
    Pendiente
  </span>

  <span className="admin-calendar__legend-item">
    <i className="admin-calendar__status-dot admin-calendar__status-dot--en_revision" />
    En revisión
  </span>

  <span className="admin-calendar__legend-item">
    <i className="admin-calendar__status-dot admin-calendar__status-dot--confirmada" />
    Confirmada
  </span>

  <span className="admin-calendar__legend-item">
    <i className="admin-calendar__status-dot admin-calendar__status-dot--completada" />
    Completada
  </span>

  <span className="admin-calendar__legend-item">
    <i className="admin-calendar__status-dot admin-calendar__status-dot--cancelada" />
    Cancelada
  </span>
</div>

      {selectedDate && (
        <div className="admin-calendar__events">
          <h3>Eventos del {selectedDate}</h3>

          {selectedReservations.length === 0 ? (
            <p>No hay reservaciones para esta fecha.</p>
          ) : (
            selectedReservations.map((reservation) => (
              <div
                className="admin-calendar__event"
                key={reservation.id}
              >
                <div>
                  <strong>{reservation.full_name}</strong>

                  <p>
                    🕒{" "}
                    {reservation.start_time?.slice(0, 5) ||
                      "Sin horario"}
                  </p>

                  <p>Estado: {reservation.status}</p>
                </div>

                <button
                  type="button"
                  className="admin-dashboard__details-button"
                  onClick={() => onViewDetails(reservation)}
                >
                  Ver detalles
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}