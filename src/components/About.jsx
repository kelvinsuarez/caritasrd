import founderImage from "../images/about/Denia.jpeg";
import heroImage from "../images/about/about-hero.jpeg";

import teamImage1 from "../images/about/Danesy.jpeg";
import teamImage2 from "../images/about/Ashley.jpeg";
import teamImage3 from "../images/about/Shantal.jpeg";
import teamImage4 from "../images/about/Yanda.jpeg";
import teamImage5 from "../images/about/Nahomy.jpeg";
import teamImage6 from "../images/about/Nicole.jpeg";

const teamMembers = [
    {
        id: 1,
        name: "Danesy",
        role: "Colaboradora",
        image: teamImage1,
    },
    {
        id: 2,
        name: "Ashley",
        role: "Colaboradora",
        image: teamImage2,
    },
    {
        id: 3,
        name: "Shantal",
        role: "Colaboradora",
        image: teamImage3,
    },
    {
        id: 4,
        name: "Yanda",
        role: "Colaboradora",
        image: teamImage4,
    },
    {
        id: 5,
        name: "Naomy",
        role: "Colaboradora",
        image: teamImage5,
    },
    {
        id: 6,
        name: "Nicole",
        role: "Colaboradora",
        image: teamImage6,
    },
];

const companyValues = [
    "Alegría",
    "Creatividad",
    "Responsabilidad",
    "Trabajo en equipo",
    "Respeto",
    "Amor por lo que hacemos",
];

const differentiators = [
    {
        id: 1,
        icon: "⭐",
        title: "Experiencia",
        description: "y profesionalismo",
    },
    {
        id: 2,
        icon: "💗",
        title: "Diseños creativos",
        description: "y personalizados",
    },
    {
        id: 3,
        icon: "👥",
        title: "Un equipo",
        description: "apasionado",
    },
    {
        id: 4,
        icon: "😊",
        title: "Compromiso",
        description: "con la satisfacción",
    },
];

function About({ openReservation }) {
    return (
        <main className="about">

            {/* =====================================
                HERO - SOBRE NOSOTROS
            ===================================== */}

            <section className="about__hero">

                <div className="about__hero-content">

                    <h1 className="about__hero-title">
                        Sobre
                        <span>Nosotros</span>
                    </h1>

                    <p className="about__hero-description">
                        En Caritas RD creemos que cada sonrisa
                        puede transformar un momento en
                        un recuerdo inolvidable.
                    </p>

                </div>

                <div className="about__hero-image-container">

                    <img
                        src={heroImage}
                        alt="Niñas disfrutando de nuestros servicios de pintacaritas"
                        className="about__hero-image"
                    />

                    <div className="about__hero-sticker">
                        Más que maquillaje...
                        <span>Creamos sonrisas ✨</span>
                    </div>

                </div>

                <span className="about__decoration about__decoration_star">
                    ⭐
                </span>

                <span className="about__decoration about__decoration_heart">
                    💗
                </span>

            </section>


            {/* =====================================
                MISIÓN, VISIÓN Y VALORES
            ===================================== */}

            <section className="about__identity">

                <article className="about__identity-card about__identity-card_mission">

                    <div className="about__identity-icon">
                        🎯
                    </div>

                    <h2 className="about__identity-title">
                        Nuestra Misión
                    </h2>

                    <p className="about__identity-description">
                        Llevar alegría, creatividad y color
                        a cada evento, creando experiencias
                        inolvidables para niños y familias.
                    </p>

                </article>


                <article className="about__identity-card about__identity-card_vision">

                    <div className="about__identity-icon">
                        👁️
                    </div>

                    <h2 className="about__identity-title">
                        Nuestra Visión
                    </h2>

                    <p className="about__identity-description">
                        Ser la empresa líder en animación
                        infantil y maquillaje artístico en
                        República Dominicana, reconocida
                        por nuestra calidad, creatividad
                        y calidez humana.
                    </p>

                </article>


                <article className="about__identity-card about__identity-card_values">

                    <div className="about__identity-icon">
                        💛
                    </div>

                    <h2 className="about__identity-title">
                        Nuestros Valores
                    </h2>

                    <ul className="about__values-list">

                        {companyValues.map((value) => (
                            <li key={value}>
                                <span aria-hidden="true">♡</span>
                                {value}
                            </li>
                        ))}

                    </ul>

                </article>

            </section>


            {/* =====================================
                NUESTRA FUNDADORA - DENIA
            ===================================== */}

            <section className="about__founder">

                <div className="about__founder-image-container">

                    <img
                        src={founderImage}
                        alt="Denia, fundadora de Caritas RD"
                        className="about__founder-image"
                    />

                    <span className="about__founder-crown" aria-hidden="true">
                        👑
                    </span>

                </div>


                <div className="about__founder-content">

                    <span className="about__founder-label">
                        NUESTRA FUNDADORA
                    </span>

                    <h2 className="about__founder-title">
                        Denia <span>♡</span>
                    </h2>

                    <p className="about__founder-description">
                        Hola, soy Denia, la fundadora de Caritas RD.
                        Desde siempre he creído en el poder de una
                        sonrisa para iluminar el mundo.
                    </p>

                    <p className="about__founder-description">
                        Mi pasión por el maquillaje artístico y
                        la animación infantil nació del deseo de
                        crear momentos mágicos que los niños
                        recuerden para siempre.
                    </p>

                </div>


                <blockquote className="about__founder-quote">

                    <span className="about__quote-icon" aria-hidden="true">
                        “
                    </span>

                    <p>
                        Cada niño es único,
                        y mi mayor satisfacción
                        es ver sus ojos brillar
                        cuando se miran al espejo.
                    </p>

                    <cite>
                        — Denia 💗
                    </cite>

                </blockquote>

            </section>


            {/* =====================================
                NUESTRO EQUIPO
            ===================================== */}

            <section className="about__team">

                <div className="about__section-heading">

                    <h2 className="about__section-title">
                        Nuestro <span>Equipo</span>
                        <span className="about__title-star"> ⭐</span>
                    </h2>

                    <p className="about__section-description">
                        Somos un grupo de chicas apasionadas,
                        creativas y comprometidas con hacer de
                        cada evento una experiencia especial.
                    </p>

                </div>


                <div className="about__team-grid">

                    {teamMembers.map((member) => (

                        <article
                            className="about__team-card"
                            key={member.id}
                        >

                            <div className="about__team-image-container">

                                <img
                                    src={member.image}
                                    alt={`${member.name}, colaboradora de Caritas RD`}
                                    className="about__team-image"
                                    loading="lazy"
                                />

                            </div>

                            <div className="about__team-info">

                                <h3 className="about__team-name">
                                    {member.name}
                                </h3>

                                <p className="about__team-role">
                                    {member.role}
                                </p>

                            </div>

                        </article>

                    ))}

                </div>


                <p className="about__team-message">
                    Juntas hacemos realidad momentos mágicos
                    <span> ♡</span>
                </p>

            </section>


            {/* =====================================
                QUÉ NOS HACE DIFERENTES
            ===================================== */}

            <section className="about__difference">

                <div className="about__section-heading">

                    <h2 className="about__section-title">
                        ¿Qué nos hace <span>diferentes?</span>
                    </h2>

                    <p className="about__section-description">
                        Nos enfocamos en los detalles, en la calidad
                        de nuestro trabajo y en la felicidad
                        de cada niño.
                    </p>

                </div>


                <div className="about__difference-grid">

                    {differentiators.map((item) => (

                        <article
                            className="about__difference-card"
                            key={item.id}
                        >

                            <span
                                className="about__difference-icon"
                                aria-hidden="true"
                            >
                                {item.icon}
                            </span>

                            <div className="about__difference-content">

                                <h3>{item.title}</h3>

                                <p>{item.description}</p>

                            </div>

                        </article>

                    ))}

                </div>

            </section>


            {/* =====================================
                CTA - RESERVAR EVENTO
            ===================================== */}

            <section className="about__cta">

                <div className="about__cta-heading">

                    <h2 className="about__cta-title">
                        ¡Hagamos juntos
                        <span>tu próximo evento!</span>
                    </h2>

                </div>


                <div className="about__cta-content">

                    <p>
                        Estamos listos para llevar color,
                        alegría y mucha diversión a ese
                        momento especial.
                    </p>

                    <button
                        type="button"
                        className="about__cta-button"
                        onClick={openReservation}
                    >
                        🎉 Reserva tu Fiesta
                        <span aria-hidden="true">→</span>
                    </button>

                </div>

                <span className="about__cta-star" aria-hidden="true">
                    ⭐
                </span>

            </section>

        </main>
    );
}

export default About;