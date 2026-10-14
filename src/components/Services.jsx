import heroImage from "../images/services/services-hero.png";
import facepaintingImage from "../images/services/facepainting.png";
import hairpartyMain from "../images/services/hairparty-main.png";
import hairpartyMain2 from "../images/services/hairparty-main2.png";
import hairpartyMain3 from "../images/services/hairparty-main3.png";
import hairpartyDetail1 from "../images/services/hairpartyDetail1.jpeg";
import hairpartyDetail2 from "../images/services/hairparty-detail2.jpeg";
import glitterAdultsImage from "../images/services/glitter-adults.png";

function Services({ openCotization }) {

    return (
        <main className="services">

            {/* ========================================
                BLOQUE 1 - HERO
            ======================================== */}

            <section className="services__hero">

                <div className="services__hero-content">

                    <h1 className="services__hero-title">
                        Nuestros
                        <span> Servicios</span>
                    </h1>

                    <p className="services__hero-description">
                        Diversión, creatividad y sonrisas
                        para hacer de tu evento un momento
                        inolvidable.
                    </p>

                </div>

                <div className="services__hero-image-container">

                    <img
                        className="services__hero-image"
                        src={heroImage}
                        alt="Niña sonriente con pintura facial"
                    />

                </div>

                <span className="services__hero-decoration services__hero-decoration_star">
                    ⭐
                </span>

                <span className="services__hero-decoration services__hero-decoration_heart">
                    💗
                </span>

            </section>


            {/* ========================================
                BLOQUE 2 - PINTACARITAS BÁSICO
            ======================================== */}

            <section className="services__facepainting">

                <div className="services__facepainting-image-container">

                    <img
                        className="services__facepainting-image"
                        src={facepaintingImage}
                        alt="Niño con diseño de pintura facial"
                    />

                </div>

                <div className="services__facepainting-content">

                    <h2 className="services__section-title">
                        Pinta Caritas
                        <span> Básico</span>
                    </h2>

                    <p className="services__description">
                        ¡Llenamos tu celebración de color,
                        creatividad y muchas sonrisas!
                        Nuestro servicio básico incluye un
                        espacio de pintacaritas y glitter
                        para que los pequeños disfruten
                        una experiencia especial.
                    </p>

                    <h3 className="services__subtitle">
                        ¿Qué incluye?
                    </h3>

                    <div className="services__features">

                        <div className="services__feature">
                            <span className="services__feature-icon">
                                🎨
                            </span>

                            <p>
                                Diseños de pintura
                                <br />
                                con moldes
                            </p>
                        </div>

                        <div className="services__feature">
                            <span className="services__feature-icon">
                                💎
                            </span>

                            <p>
                                Gemas de varios
                                <br />
                                diseños y colores
                            </p>
                        </div>

                        <div className="services__feature">
                            <span className="services__feature-icon">
                                ✨
                            </span>

                            <p>
                                Glitter de
                                <br />
                                varios colores
                            </p>
                        </div>

                        <div className="services__feature">
                            <span className="services__feature-icon">
                                🦋
                            </span>

                            <p>
                                Tatuajes temporales
                                <br />
                                de agua y glitter
                            </p>
                        </div>

                    </div>

                </div>

                <aside className="services__plan">

                    <span className="services__plan-icon">
                        🌟
                    </span>

                    <h3 className="services__plan-title">
                        Servicio estándar
                    </h3>

                    <p className="services__plan-highlight">
                        A partir de 2 horas
                    </p>

                    <p className="services__plan-highlight">
                        Para grupos de
                        <br />
                        20 a 30 niños
                    </p>

                    <div className="services__plan-divider"></div>

                    <p className="services__plan-description">
                        ¿Necesitas más tiempo o tienes
                        más invitados? Puedes ampliar
                        tu plan según la cantidad
                        de niños y la duración
                        de tu evento.
                    </p>

                </aside>

            </section>


            {/* ========================================
                BLOQUE 3 - HAIR PARTY
            ======================================== */}

            <section className="services__hairparty">

                <div className="services__hairparty-content">

                    <span className="services__tag">
                        Plus para tu evento
                    </span>

                    <h2 className="services__section-title">
                        Hair
                        <span> Party</span>
                        <span className="services__title-decoration">
                            💗
                        </span>
                    </h2>

                    <p className="services__description">
                        ¡Agrega todavía más color y
                        diversión a tu celebración!
                        Complementa nuestro servicio
                        de pintacaritas con una
                        experiencia de Hair Party
                        que hará tu evento
                        aún más especial.
                    </p>

                    <p className="services__hairparty-note">
                        Disponible como servicio adicional
                        al paquete de pintacaritas.
                    </p>

                    <button
                        type="button"
                        className="services__button services__button_pink"
                        onClick={openCotization}
                    >
                        Quiero agregar Hair Party
                    </button>

                </div>

                <div className="services__hairparty-gallery">

                    <img
                        className="services__hairparty-image services__hairparty-image_main"
                        src={hairpartyMain}
                        alt="Peinado creativo de Hair Party"
                    />
                     <img
                        className="services__hairparty-image services__hairparty-image_main"
                        src={hairpartyMain2}
                        alt="Peinado creativo de Hair Party"
                    />

                     <img
                        className="services__hairparty-image services__hairparty-image_main"
                        src={hairpartyMain3}
                        alt="Peinado creativo de Hair Party"
                    />

                    <div className="services__hairparty-gallery-details">

                        <img
                            className="services__hairparty-image"
                            src={hairpartyDetail1}
                            alt="Detalle de peinado creativo"
                        />

                        <img
                            className="services__hairparty-image"
                            src={hairpartyDetail2}
                            alt="Decoración de cabello para Hair Party"
                        />

                    </div>

                </div>

            </section>


            {/* ========================================
                BLOQUE 4 - GLITTER PARA ADULTOS
            ======================================== */}

            <section className="services__glitter">

                <div className="services__glitter-image-container">

                    <img
                        className="services__glitter-image"
                        src={glitterAdultsImage}
                        alt="Mujer con maquillaje de glitter"
                    />

                </div>

                <div className="services__glitter-content">

                    <h2 className="services__section-title">
                        Stand de Glitter
                        <span> para Adultos</span>
                        <span className="services__title-decoration">
                            ✨
                        </span>
                    </h2>

                    <p className="services__description">
                        ¡Porque el brillo también es
                        para los grandes!
                    </p>

                    <p className="services__description">
                        Un espacio único que aporta
                        brillo, estilo y diversión
                        a tu evento.
                    </p>

                    <p className="services__description">
                        Una experiencia especial
                        para que tus invitados
                        disfruten de un toque
                        de creatividad y glamour.
                    </p>

                    <button
                        type="button"
                        className="services__button services__button_pink"
                        onClick={openCotization}
                    >
                        Cotizar Stand de Glitter
                    </button>

                </div>

                <span className="services__glitter-decoration">
                    ⭐
                </span>

            </section>


            {/* ========================================
                BLOQUE 5 - LLAMADO A LA ACCIÓN
            ======================================== */}

            <section className="services__cta">

                <div className="services__cta-content">

                    <h2 className="services__cta-title">
                        ¿Listo para llenar tu evento
                        <span> de color y diversión?</span>
                    </h2>

                    <p className="services__cta-description">
                        Cuéntanos los detalles de tu
                        celebración y te ayudaremos
                        a crear una experiencia
                        inolvidable.
                    </p>

                </div>

                <button
                    type="button"
                    className="services__button services__button_yellow"
                    onClick={openCotization}
                >
                    Cotiza tu evento
                    <span aria-hidden="true">➜</span>
                </button>

                <span className="services__cta-decoration services__cta-decoration_star">
                    ✨
                </span>

                <span className="services__cta-decoration services__cta-decoration_heart">
                    💗
                </span>

            </section>

        </main>
    );
}

export default Services;