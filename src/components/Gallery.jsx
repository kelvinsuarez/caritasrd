import { useEffect, useState } from "react";

import heroImage from "../images/gallery/gallery-hero.jpeg";

import galleryImage1 from "../images/gallery/gallery-1.jpeg";
import galleryImage2 from "../images/gallery/gallery-2.jpeg";
import galleryImage3 from "../images/gallery/gallery-3.jpeg";
import galleryImage4 from "../images/gallery/gallery-4.jpeg";
import galleryImage5 from "../images/gallery/gallery-5.jpeg";
import galleryImage6 from "../images/gallery/gallery-6.jpeg";
import galleryImage7 from "../images/gallery/gallery-7.jpeg";
import galleryImage8 from "../images/gallery/gallery-8.jpeg";

const galleryImages = [
    galleryImage1,
    galleryImage2,
    galleryImage3,
    galleryImage4,
    galleryImage5,
    galleryImage6,
    galleryImage7,
    galleryImage8,
    
];

function Gallery() {

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [reduceMotion, setReduceMotion] = useState(false);

    /* ========================================
       PREFERENCIAS DE MOVIMIENTO
    ======================================== */

    useEffect(() => {
        const mediaQuery = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );

        const updateMotion = () => {
            setReduceMotion(mediaQuery.matches);
        };

        updateMotion();

        mediaQuery.addEventListener("change", updateMotion);

        return () => {
            mediaQuery.removeEventListener("change", updateMotion);
        };
    }, []);

    /* ========================================
       CARRUSEL AUTOMÁTICO
    ======================================== */

    useEffect(() => {
        if (isPaused || reduceMotion) return;

        const interval = setInterval(() => {
            setCurrentIndex((previous) =>
                (previous + 1) % galleryImages.length
            );
        }, 4000);

        return () => clearInterval(interval);
    }, [isPaused, reduceMotion]);

    const nextSlide = () => {
        setCurrentIndex((previous) =>
            (previous + 1) % galleryImages.length
        );
    };

    const previousSlide = () => {
        setCurrentIndex((previous) =>
            (previous - 1 + galleryImages.length)
            % galleryImages.length
        );
    };

    const visibleImages = [0, 1, 2].map((offset) => {
        const index =
            (currentIndex + offset) % galleryImages.length;

        return {
            src: galleryImages[index],
            index,
        };
    });

    return (
        <main className="gallery">

            {/* ========================================
                BLOQUE 1 - HERO
            ======================================== */}

            <section className="gallery__hero">

                <div className="gallery__hero-title-container">

                    <h1 className="gallery__hero-title">
                        Nuestra
                        <span> Galería</span>
                    </h1>

                </div>

                <div className="gallery__hero-content">

                    <h2 className="gallery__hero-subtitle">
                        Pequeños momentos,
                        <br />
                        grandes sonrisas
                    </h2>

                    <p className="gallery__hero-description">
                        Descubre algunos de los momentos más
                        especiales de nuestros eventos.
                        Cada sonrisa cuenta una historia llena
                        de color, creatividad y mucha diversión.
                    </p>

                </div>

                <div className="gallery__hero-image-container">

                    <img
                        className="gallery__hero-image"
                        src={heroImage}
                        alt="Niña con pintura facial"
                    />

                </div>

                <span
                    className="gallery__hero-decoration gallery__hero-decoration_heart"
                    aria-hidden="true"
                >
                    ♡
                </span>

                <span
                    className="gallery__hero-decoration gallery__hero-decoration_star"
                    aria-hidden="true"
                >
                    ⭐
                </span>

            </section>


            {/* ========================================
                BLOQUE 2 - CARRUSEL DE IMÁGENES
            ======================================== */}

            <section
                className="gallery__carousel-section"
                aria-label="Galería de fotografías"
            >

                <div className="gallery__carousel-heading">
                    Nuestras sonrisas en imágenes
                </div>

                <div
                    className="gallery__carousel"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    onFocusCapture={() => setIsPaused(true)}
                    onBlurCapture={(event) => {
                        if (
                            !event.currentTarget.contains(
                                event.relatedTarget
                            )
                        ) {
                            setIsPaused(false);
                        }
                    }}
                >

                    <button
                        type="button"
                        className="gallery__arrow gallery__arrow_left"
                        onClick={previousSlide}
                        aria-label="Fotografías anteriores"
                    >
                        &#10094;
                    </button>

                    <div className="gallery__carousel-track">

                        {visibleImages.map((image, position) => (

                            <div
                                className="gallery__carousel-item"
                                key={`${image.index}-${position}`}
                            >

                                <img
                                    src={image.src}
                                    alt={`Momento de Caritas RD ${image.index + 1}`}
                                    loading="lazy"
                                />

                            </div>

                        ))}

                    </div>

                    <button
                        type="button"
                        className="gallery__arrow gallery__arrow_right"
                        onClick={nextSlide}
                        aria-label="Fotografías siguientes"
                    >
                        &#10095;
                    </button>

                </div>

                <div className="gallery__dots">

                    {galleryImages.map((_, index) => (

                        <button
                            type="button"
                            key={index}
                            className={`gallery__dot ${
                                currentIndex === index
                                    ? "gallery__dot_active"
                                    : ""
                            }`}
                            onClick={() => setCurrentIndex(index)}
                            aria-label={`Ir a la fotografía ${index + 1}`}
                            aria-current={
                                currentIndex === index
                                    ? "true"
                                    : undefined
                            }
                        />

                    ))}

                </div>

            </section>


            {/* ========================================
                BLOQUE 3 - REELS DE INSTAGRAM
            ======================================== */}

            <section className="gallery__reels">

                <div className="gallery__reels-heading">

                    <h2 className="gallery__reels-title">
                        <span>La magia</span> en acción
                        <span className="gallery__reels-sparkle">
                            ✨
                        </span>
                    </h2>

                    <p className="gallery__reels-description">
                        Mira algunos de nuestros reels en
                        Instagram y vive la experiencia
                        <strong> Caritas RD.</strong>
                    </p>

                </div>

                <div className="gallery__reels-grid">

                    {/* REEL 1 */}
                    <div className="gallery__reel">
                         
                         <div className="gallery__reel">
                            <iframe
                                src="https://www.instagram.com/reel/DWzn2EQjpa7/embed/"
                                title="Reel de Caritas RD 1"
                                loading="lazy"
                                allowFullScreen
                            />
                        </div>

                    </div>

                    {/* REEL 2 */}
                    <div className="gallery__reel">
                        <div className="gallery__reel">
                            <iframe
                                src="https://www.instagram.com/reel/DJMh-0xO6SH/embed/"
                                title="Reel de Caritas RD 2"
                                loading="lazy"
                                allowFullScreen
                            />
                        </div>
                    </div>

                    {/* REEL 3 */}
                    <div className="gallery__reel">
                        <div className="gallery__reel">
                            <iframe
                                src="https://www.instagram.com/reel/C-0RlFLPX9z/embed/"
                                title="Reel de Caritas RD 3"
                                loading="lazy"
                                allowFullScreen
                            />
                        </div>
                    </div>

                    {/* REEL 4 */}
                    <div className="gallery__reel">
                        <div className="gallery__reel">
                            <iframe
                                src="https://www.instagram.com/reel/DZ3d9oGujKI/embed/"
                                title="Reel de Caritas RD 4"
                                loading="lazy"
                                allowFullScreen
                            />
                        </div>
                    </div>

                </div>

                <a
                    className="gallery__instagram-button"
                    href="https://www.instagram.com/caritas_rd/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <span
                        className="gallery__instagram-icon"
                        aria-hidden="true"
                    >
                        ◎
                    </span>

                    Síguenos en Instagram

                    <span aria-hidden="true">
                        ➜
                    </span>
                </a>

                <span
                    className="gallery__reels-decoration gallery__reels-decoration_heart"
                    aria-hidden="true"
                >
                    💗
                </span>

                <span
                    className="gallery__reels-decoration gallery__reels-decoration_star"
                    aria-hidden="true"
                >
                    ⭐
                </span>

            </section>

        </main>
    );
}

export default Gallery;