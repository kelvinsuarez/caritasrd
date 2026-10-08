import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import Logo from "../images/logo/Logo_caritas.png";

function Header({ openReservation, openCotization }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const headerRef = useRef(null);

    const closeMenu = () => setMenuOpen(false);

    useEffect(() => {
        if (!menuOpen) return;

        const handleOutsideClick = (event) => {
            if (!headerRef.current?.contains(event.target)) {
                closeMenu();
            }
        };

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                closeMenu();
            }
        };

        document.addEventListener("pointerdown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("pointerdown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [menuOpen]);

    const links = [
        { path: "/", label: "Home" },
        { path: "/services", label: "Servicios" },
        { path: "/gallery", label: "Galería" },
        { path: "/info", label: "Sobre Nosotros" },
        { path: "/contacto", label: "Contacto" },
    ];

    return (
        <header className="header" ref={headerRef}>
            <NavLink
                to="/"
                className="header__logo-link"
                onClick={closeMenu}
                aria-label="Ir al inicio"
            >
                <img
                    className="header__logo"
                    src={Logo}
                    alt="Logo Caritas"
                />
            </NavLink>

            <nav
                id="caritas-navigation"
                className={`nav ${menuOpen ? "nav_open" : ""}`}
                aria-label="Navegación principal"
            >
                <ul className="nav__list">
                    {links.map(({ path, label }) => (
                        <li key={path}>
                            <NavLink
                                to={path}
                                end={path === "/"}
                                className={({ isActive }) =>
                                    `nav__link ${
                                        isActive ? "nav__link_active" : ""
                                    }`
                                }
                                onClick={closeMenu}
                            >
                                {label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="header__buttons">
                <button
                    type="button"
                    className="header__button header__button_reservation"
                    onClick={() => {
                        closeMenu();
                        openReservation();
                    }}
                >
                    Reserva tu fecha
                </button>

                <button
                    type="button"
                    className="header__button header__button_cotization"
                    onClick={() => {
                        closeMenu();
                        openCotization();
                    }}
                >
                    Cotiza tu evento
                </button>
            </div>

            <button
                type="button"
                className={`header__menu-toggle ${
                    menuOpen ? "header__menu-toggle_open" : ""
                }`}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={menuOpen}
                aria-controls="caritas-navigation"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>
        </header>
    );
}

export default Header;