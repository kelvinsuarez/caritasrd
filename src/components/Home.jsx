import heroImage from '../images/hero/hero-caritas.png';

function Home({ openReservation, openCotization }) {

    return (
        <main className="home">

            <section className="home__hero">

                {/* IMAGEN - LADO IZQUIERDO */}
                <div className="home__image-container">

                    <img
                        className="home__image"
                        src={heroImage}
                        alt="Niña durante una sesión de pintura facial"
                    />

                </div>


                {/* TEXTO - LADO DERECHO */}
                <div className="home__content">

                    <h1 className="home__title">
                        Más que
                        <span> pintacaritas,</span>

                        <strong>
                            creamos
                            <span> sonrisas</span>
                        </strong>
                    </h1>


                    <p className="home__description">
                        Hacemos cada evento más especial
                        <br />
                        con arte, color y mucha diversión.
                    </p>


                    <div className="home__buttons">

                        <button
                            className="home__button home__button_reservation"
                            onClick={openReservation}
                        >
                            Reserva tu fecha
                        </button>


                        <button
                            className="home__button home__button_cotization"
                            onClick={openCotization}
                        >
                            Cotiza tu evento
                        </button>

                    </div>

                </div>

            </section>


            <section className="home__benefits">

                <div className="home__benefit">
                    <span className="home__benefit-icon">⭐</span>
                    <p>
                        Para todo
                        <br />
                        tipo de eventos
                    </p>
                </div>


                <div className="home__benefit">
                    <span className="home__benefit-icon">💗</span>
                    <p>
                        Diseños
                        <br />
                        personalizados
                    </p>
                </div>


               <div className="home__benefit">
                <span className="home__benefit-icon">💎</span>
                    <p>
                        Materiales seguros
                        <br />
                        y de alta calidad
                    </p>
                </div>


                <div className="home__benefit">
                    <span className="home__benefit-icon home__benefit-icon_crown">
                        <span className="home__crown home__crown_center">👑</span>
                        <span className="home__crown home__crown_left">👑</span>
                        <span className="home__crown home__crown_right">👑</span>
                    </span>
                    <p>
                        Diversión para
                        <br />
                        todas las edades
                    </p>
                </div>

            </section>

        </main>
    );
}

export default Home;