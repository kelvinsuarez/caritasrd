import { useNavigate, useLocation } from "react-router-dom";
import Logo from '../images/logo/Logo_caritas.png';


function Header({openReservation, openCotization}) {

    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path;
    };
     
    return(
        <header className="header">
            <img className="header__logo" src={Logo} alt="Logo Caritas"/>
            <nav className="nav">
                <ul className="nav__list">
                    <li
                        className={`nav__link ${isActive('/') ? 'nav__link_active' : ''}`}
                        onClick={() => navigate('/')}>Home</li>
                    <li
                        className={`nav__link ${isActive('/services') ? 'nav__link_active' : ''}`}
                        onClick={() => navigate('/services')}
                    >
                        Servicios
                    </li>
                    <li
                        className={`nav__link ${isActive('/gallery') ? 'nav__link_active' : ''}`}
                        onClick={() => navigate('/gallery')}
                    >
                        Galería
                    </li>
                    <li
                        className={`nav__link ${isActive('/info') ? 'nav__link_active' : ''}`}
                        onClick={() => navigate('/info')}
                    >
                        Sobre Nosotros
                    </li>
                    <li
                        className={`nav__link ${isActive('/contacto') ? 'nav__link_active' : ''}`}
                        onClick={() => navigate('/contacto')}
                    >
                        Contacto
                    </li>
                </ul>
            </nav>
            <div className="header__buttons">

                <button
                    className="header__button header__button_reservation"
                    onClick={openReservation}
                >
                    Reserva tu fecha
                </button>

                <button
                    className="header__button header__button_cotization"
                    onClick={openCotization}
                >
                    Cotiza tu evento
                </button>

            </div>
        </header>
    )
}

export default Header;