(() => {
    "use strict";

    const CAROUSEL_VERSION = 2;

    const DEFAULT_SLIDES = [
        { id: "jersey", active: true, title: "Jersey Custom", image: "assets/Image/Carousel/jersey-carousel.png", href: "detail-produk.html?produk=jersey" },
        { id: "hoodie", active: true, title: "Hoodie Custom", image: "assets/Image/Carousel/hoodie-carousel.png", href: "detail-produk.html?produk=hoodie" },
        { id: "polo", active: true, title: "Polo Shirt", image: "assets/Image/Carousel/polo-carousel.png", href: "detail-produk.html?produk=polo" },
        { id: "korsa", active: true, title: "Korsa Custom", image: "assets/Image/Carousel/korsa-carousel.png", href: "detail-produk.html?produk=korsa" },
        { id: "rompi", active: true, title: "Rompi Custom", image: "assets/Image/Carousel/rompi-carousel.png", href: "detail-produk.html?produk=rompi" },
        { id: "kaos", active: true, title: "Kaos Custom", image: "assets/Image/Carousel/kaos-carousel.png", href: "detail-produk.html?produk=kaos" }
    ];

    const LEGACY_PRODUCT_IMAGES = new Set([
        "assets/image/jersey produk.png",
        "assets/image/hoodie produk.png",
        "assets/image/polo produk.png",
        "assets/image/korsa produk.png",
        "assets/image/rompi produk.png",
        "assets/image/kaos produk.png",
        "assets/image/new jersey.png"
    ]);

    function readSettings() {
        const defaults = {
            autoplay: true,
            interval: 4500,
            loop: true,
            showDots: true,
            slides: DEFAULT_SLIDES.map(slide => ({ ...slide }))
        };

        try {
            const saved = JSON.parse(localStorage.getItem("jidoorCarouselSettings") || "null");
            if (!saved || typeof saved !== "object") return defaults;

            const savedSlides = Array.isArray(saved.slides) && saved.slides.length
                ? saved.slides
                : null;

            let slides = savedSlides
                ? savedSlides.map((slide, index) => ({
                    ...(DEFAULT_SLIDES[index] || {}),
                    ...(slide && typeof slide === "object" ? slide : {})
                }))
                : defaults.slides;

            if (Number(saved._version || 0) < CAROUSEL_VERSION) {
                slides = slides.map((slide, index) => {
                    const base = DEFAULT_SLIDES[index] || {};
                    const image = String(slide.image || "").trim();
                    const normalized = image
                        .replace(/^(\.\.\/)+/, "")
                        .replace(/^\/+/, "")
                        .toLowerCase();

                    return {
                        ...slide,
                        image: (!image || LEGACY_PRODUCT_IMAGES.has(normalized))
                            ? base.image
                            : image
                    };
                });

                localStorage.setItem("jidoorCarouselSettings", JSON.stringify({
                    autoplay: saved.autoplay !== false,
                    interval: Math.max(1500, Number(saved.interval) || 4500),
                    loop: saved.loop !== false,
                    showDots: saved.showDots !== false,
                    slides,
                    _version: CAROUSEL_VERSION
                }));
            }

            return {
                autoplay: saved.autoplay !== false,
                interval: Math.max(1500, Number(saved.interval) || defaults.interval),
                loop: saved.loop !== false,
                showDots: saved.showDots !== false,
                slides
            };
        } catch (_) {
            return defaults;
        }
    }

    function applySlideSettings(carousel, settings) {
        const cards = [...carousel.querySelectorAll("[data-carousel-track] .produk-card")];
        const activeSlides = (settings.slides || []).filter(slide => slide && slide.active !== false);

        cards.forEach((card, index) => {
            const slide = activeSlides[index];
            const link = card.querySelector(".produk-poster-link");
            const image = link?.querySelector("img");

            if (!slide) {
                card.style.display = "none";
                return;
            }

            card.style.display = "";
            if (image && slide.image) {
                image.src = slide.image;
                image.removeAttribute("srcset");
            }
            if (link && slide.href) {
                link.href = slide.href;
            }
            if (image && slide.title) {
                image.alt = slide.title;
            }
            if (link && slide.title) {
                link.setAttribute("aria-label", `Lihat detail ${slide.title}`);
            }
        });
        return activeSlides.length;
    }

    function setupCarousel(carousel) {
        const viewport = carousel.querySelector(".produk-carousel-viewport");
        const track = carousel.querySelector("[data-carousel-track]");
        const prev = carousel.querySelector("[data-carousel-prev]");
        const next = carousel.querySelector("[data-carousel-next]");
        const dots = carousel.parentElement.querySelector("[data-carousel-dots]");

        if (!viewport || !track) return;

        let index = 0;
        let timer = null;

        function getCards() {
            return [...track.querySelectorAll(".produk-card")]
                .filter(card => getComputedStyle(card).display !== "none");
        }

        function visibleCount() {
            return 1;
        }

        function maxIndex() {
            return Math.max(0, getCards().length - visibleCount());
        }

        function renderDots() {
            if (!dots) return;

            const settings = readSettings();
            dots.style.display = settings.showDots ? "" : "none";

            if (!settings.showDots) {
                dots.innerHTML = "";
                return;
            }

            const pages = maxIndex() + 1;
            dots.innerHTML = Array.from({ length: pages }, (_, i) =>
                `<button type="button" class="${i === index ? "active" : ""}" aria-label="Tampilkan produk halaman ${i + 1}" data-dot="${i}"></button>`
            ).join("");

            dots.querySelectorAll("[data-dot]").forEach(dot => {
                dot.addEventListener("click", () => {
                    index = Number(dot.dataset.dot);
                    update();
                    restart();
                });
            });
        }

        function update() {
            const cards = getCards();
            index = Math.min(index, maxIndex());

            if (!cards.length) {
                track.style.transform = "translate3d(0, 0, 0)";
                if (prev) prev.disabled = true;
                if (next) next.disabled = true;
                if (dots) dots.innerHTML = "";
                return;
            }

            const cardWidth = cards[0].getBoundingClientRect().width || 0;
            const gap = parseFloat(getComputedStyle(track).gap || "0");
            const offset = index * (cardWidth + gap);

            track.style.transform = `translate3d(-${offset}px, 0, 0)`;
            syncViewportHeight();

            if (prev) prev.disabled = index <= 0;
            if (next) next.disabled = index >= maxIndex();

            if (dots) {
                dots.querySelectorAll("button").forEach((dot, i) => {
                    dot.classList.toggle("active", i === index);
                });
            }

            viewport.style.setProperty("--carousel-count", String(visibleCount()));
        }

        function go(delta) {
            index = Math.max(0, Math.min(maxIndex(), index + delta));
            update();
            restart();
        }

        function restart() {
            clearInterval(timer);
            const settings = readSettings();

            if (!settings.autoplay || getCards().length <= visibleCount()) return;

            timer = setInterval(() => {
                if (index >= maxIndex()) {
                    if (!settings.loop) {
                        clearInterval(timer);
                        return;
                    }
                    index = 0;
                } else {
                    index += 1;
                }
                update();
            }, settings.interval);
        }

        function syncViewportHeight() {
            const activeCard = getCards()[index];
            const image = activeCard?.querySelector(".produk-poster-link img");
            if (!image || !image.naturalWidth || !image.naturalHeight) return;

            const width = activeCard.getBoundingClientRect().width;
            const height = width * (image.naturalHeight / image.naturalWidth);
            viewport.style.height = `${Math.ceil(height)}px`;
        }

        function refresh() {
            const settings = readSettings();
            applySlideSettings(carousel, settings);
            index = Math.min(index, maxIndex());
            renderDots();

            requestAnimationFrame(() => {
                update();
                syncViewportHeight();
                restart();
            });
        }

        prev?.addEventListener("click", () => go(-1));
        next?.addEventListener("click", () => go(1));

        window.addEventListener("resize", refresh);

        carousel.addEventListener("mouseenter", () => clearInterval(timer));
        carousel.addEventListener("mouseleave", restart);

        refresh();

        document.addEventListener("jidoorCatalogUpdated", refresh);
        document.addEventListener("jidoorCarouselUpdated", refresh);
    }

    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll("[data-carousel]").forEach(setupCarousel);
    });
})();
