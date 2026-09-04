(function () {
    "use strict";

    const STORAGE_KEY = "jidoorProducts";
    const CATALOG_VERSION_KEY = "jidoorCatalogVersion";
    const CATALOG_VERSION = "20260830-v3";
    const baseCatalogProducts = [
        {
            id: "kaos-custom",
            nama: "Kaos Custom",
            kategori: "Kaos",
            harga: 70000,
            material: ["Combed 24s", "Combed 30s"],
            ukuran: ["S", "M", "L", "XL", "XXL"],
            warna: ["Hitam", "Putih", "Merah", "Navy", "Abu", "Hijau Army", "Coklat", "Kuning", "Orange", "Pink"],
            gambar: "assets/Image/Kaos Produk.png",
            deskripsi: "Kaos custom Jidoor untuk kebutuhan komunitas dan kegiatan."
        },
        {
            id: "jersey-custom",
            nama: "Jersey Custom",
            kategori: "Jersey",
            harga: 90000,
            material: ["Dryfit", "Milano", "Serena"],
            ukuran: ["S", "M", "L", "XL", "XXL"],
            warna: ["Hitam", "Putih", "Merah", "Navy", "Abu", "Hijau Army", "Coklat", "Kuning", "Orange", "Pink"],
            gambar: "assets/Image/Jersey Produk.png",
            deskripsi: "Jersey custom dengan pilihan warna dan ukuran."
        },
        {
            id: "hoodie-custom",
            nama: "Hoodie Custom",
            kategori: "Hoodie",
            harga: 120000,
            material: ["Fleece", "Baby Terry"],
            ukuran: ["M", "L", "XL", "XXL"],
            warna: ["Hitam", "Putih", "Merah", "Navy", "Abu", "Hijau Army", "Coklat", "Kuning", "Orange", "Pink"],
            gambar: "assets/Image/Hoodie Produk.png",
            deskripsi: "Hoodie custom Jidoor dengan bahan nyaman."
        },
        {
            id: "polo-custom",
            nama: "Polo Shirt",
            kategori: "Polo",
            harga: 120000,
            material: ["Lacoste CVC", "Lacoste PE"],
            ukuran: ["S", "M", "L", "XL", "XXL"],
            warna: ["Hitam", "Putih", "Merah", "Navy", "Abu", "Hijau Army", "Coklat", "Kuning", "Orange", "Pink"],
            gambar: "assets/Image/Polo Produk.png",
            deskripsi: "Polo shirt custom untuk tampilan formal dan elegan."
        },
        {
            id: "korsa-custom",
            nama: "Kaos Korsa",
            kategori: "Korsa",
            harga: 80000,
            material: ["Cotton Combed"],
            ukuran: ["S", "M", "L", "XL", "XXL"],
            warna: ["Hitam", "Putih", "Merah", "Navy", "Abu", "Hijau Army", "Coklat", "Kuning", "Orange", "Pink"],
            gambar: "assets/Image/Korsa Produk.png",
            deskripsi: "Kaos korsa untuk organisasi, kelas, dan kegiatan kampus."
        },
        {
            id: "rompi-custom",
            nama: "Rompi Custom",
            kategori: "Rompi",
            harga: 110000,
            material: ["Taslan", "Drill"],
            ukuran: ["M", "L", "XL", "XXL"],
            warna: ["Hitam", "Putih", "Merah", "Navy", "Abu", "Hijau Army", "Coklat", "Kuning", "Orange", "Pink"],
            gambar: "assets/Image/Rompi Produk.png",
            deskripsi: "Rompi custom untuk kebutuhan outdoor dan kerja lapangan."
        }
    ];


    const colorMap = {
        "Putih": "#FFFFFF",
        "Hitam": "#111111",
        "Navy": "#1E3A5F",
        "Merah": "#B21F35",
        "Maroon": "#8B1E2D",
        "Abu": "#808080",
        "Hijau Army": "#4B5320",
        "Coklat": "#6B3E26",
        "Kuning": "#FFD166",
        "Orange": "#F57C00",
        "Oranye": "#F57C00",
        "Pink": "#FF5F7A"
    };

    function readProducts() {
        try {
            const raw = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );

            const stored = Array.isArray(raw) ? raw : [];
            if (
                localStorage.getItem(CATALOG_VERSION_KEY) !== CATALOG_VERSION
            ) {
                const result = [...stored];

                baseCatalogProducts.forEach(function (baseProduct) {
                    const exists = result.some(function (item) {
                        const values = [
                            item && item.id,
                            item && item.slug,
                            item && item.nama,
                            item && item.kategori
                        ].map(slug);

                        return (
                            values.includes(slug(baseProduct.id)) ||
                            values.includes(slug(baseProduct.nama)) ||
                            values.includes(slug(baseProduct.kategori))
                        );
                    });

                    if (!exists) {
                        result.push(JSON.parse(JSON.stringify(baseProduct)));
                    }
                });

                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(result)
                );
                localStorage.setItem(
                    CATALOG_VERSION_KEY,
                    CATALOG_VERSION
                );

                return result;
            }

            return stored;
        } catch (error) {
            return [];
        }
    }

    function slug(value) {
        return String(value || "")
            .toLowerCase()
            .replace(/custom|shirt/g, "")
            .replace(/[^a-z0-9]+/g, "")
            .trim();
    }

    function getKey(product) {
        const raw =
            product.id ||
            product.slug ||
            product.nama ||
            "";

        return slug(raw);
    }

    function getLegacyKey(product) {
        const candidates = [
            product && product.kategori,
            product && product.nama,
            product && product.slug,
            product && product.id
        ]
            .filter(Boolean)
            .map(slug);

        for (const value of candidates) {
            if (value.includes("kaos")) return "kaos";
            if (value.includes("jersey")) return "jersey";
            if (value.includes("hoodie")) return "hoodie";
            if (value.includes("polo")) return "polo";
            if (value.includes("korsa")) return "korsa";
            if (value.includes("rompi")) return "rompi";
        }

        return candidates[0] || "";
    }

    function imageForUser(path) {
        if (!path) {
            return "";
        }

        return String(path)
            .replace(/^\.\.\//, "")
            .replace(/^\/+/, "");
    }

    const defaultCatalogImages = {
        kaos: "assets/Image/Kaos Produk.png",
        jersey: "assets/Image/Jersey Produk.png",
        hoodie: "assets/Image/Hoodie Produk.png",
        polo: "assets/Image/Polo Produk.png",
        korsa: "assets/Image/Korsa Produk.png",
        rompi: "assets/Image/Rompi Produk.png"
    };

    function catalogImageFor(product) {
        const key = getLegacyKey(product);
        const savedMain =
            product && product.photos && product.photos.main
                ? product.photos.main
                : product && product.gambar;

        const saved = imageForUser(savedMain);
        if (saved) return saved;

        return defaultCatalogImages[key] || defaultCatalogImages.kaos;
    }

    function formatRupiah(value) {
        const number = Number(value) || 0;

        return "Rp " + number.toLocaleString("id-ID");
    }

    function findByKey(key) {
        const normalized = slug(key);

        return readProducts().find(function (product) {
            return (
                getKey(product) === normalized ||
                getLegacyKey(product) === normalized
            );
        });
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function categoryClass(category) {
        const value = String(category || "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

        return value || "lainnya";
    }

    function syncCatalogCards() {
        const posterTrack = document.querySelector(".produk-carousel-track .produk-poster-link");
        const isHomePosterCarousel = !!posterTrack && !!document.querySelector("[data-carousel-track]");
        if (isHomePosterCarousel) return;

        const grid = document.querySelector(".produk-grid");
        const products = readProducts();

        if (!grid || !products.length) {
            return;
        }

        grid.innerHTML = products
            .filter(function (product) {
                return product.aktif !== false;
            })
            .map(function (product) {
                const key = getKey(product);
                const image = catalogImageFor(product);

                const material =
                    Array.isArray(product.material) &&
                    product.material.length
                        ? product.material.join(" / ")
                        : "Pilihan bahan tersedia";

                return `
                    <div
                        class="produk-card ${categoryClass(product.kategori)}"
                        data-product-key="${escapeHtml(key)}"
                        data-category="${escapeHtml(
                            categoryClass(product.kategori)
                        )}"
                    >
                        <img
                            src="${escapeHtml(image)}"
                            alt="${escapeHtml(
                                product.nama || "Produk Jidoor"
                            )}"
                            onerror="this.onerror=null;this.src='${escapeHtml(defaultCatalogImages[getLegacyKey(product)] || defaultCatalogImages.kaos)}'"
                        >

                        <div class="produk-content">
                            <h3>
                                ${escapeHtml(
                                    product.nama || "Produk Jidoor"
                                )}
                            </h3>

                            <p>
                                Bahan: ${escapeHtml(material)}
                            </p>

                            <span class="tag">
                                ${escapeHtml(
                                    product.kategori || "Lainnya"
                                )}
                            </span>

                            <a
                                href="detail-produk.html?produk=${encodeURIComponent(
                                    key
                                )}"
                                class="btn-produk"
                            >
                                Custom Sekarang
                            </a>
                        </div>
                    </div>
                `;
            })
            .join("");

        document.dispatchEvent(
            new CustomEvent("jidoorCatalogUpdated")
        );
    }

    function syncDetailPage() {
        const params =
            new URLSearchParams(window.location.search);

        const key = params.get("produk");

        if (!key) {
            return;
        }

        const product = findByKey(key);

        if (!product || product.aktif === false) {
            return;
        }

        window.jidoorActiveProduct = product;

        const name =
            document.getElementById("namaProduk");

        const image =
            document.getElementById("gambarProduk");

        const material =
            document.getElementById("bahan");

        const price =
            document.getElementById("harga");

        const description =
            document.querySelector(".product-description");

        const colorLabel =
            document.getElementById("kodeWarna");

        const colorGrid =
            document.querySelector(".color-grid");

        const sizes =
            Array.isArray(product.ukuran) &&
            product.ukuran.length
                ? product.ukuran
                : ["S", "M", "L", "XL"];

        const materials =
            Array.isArray(product.material) &&
            product.material.length
                ? product.material
                : [];

        const colors =
            Array.isArray(product.warna) &&
            product.warna.length
                ? product.warna
                : [];

        if (name) {
            name.textContent =
                product.nama || "Produk Jidoor";
        }

        if (image) {
            image.src = catalogImageFor(product);
            image.onerror = function () {
                this.onerror = null;
                this.src = defaultCatalogImages.kaos;
            };
        }

        if (description && product.deskripsi) {
            description.textContent =
                product.deskripsi;
        }

        if (material && materials.length) {
            material.innerHTML =
                materials
                    .map(function (item) {
                        return `
                            <option value="${escapeHtml(item)}">
                                ${escapeHtml(item)}
                            </option>
                        `;
                    })
                    .join("");

            material.dispatchEvent(
                new Event("change")
            );
        }

        if (price) {
            price.textContent =
                formatRupiah(product.harga);
        }

        if (colorGrid && colors.length) {
            colorGrid.innerHTML =
                colors
                    .map(function (nameColor, index) {
                        const hex =
                            colorMap[nameColor] ||
                            "#CCCCCC";

                        const active =
                            index === 0
                                ? " active"
                                : "";

                        return `
                            <button
                                type="button"
                                class="color-item${active}"
                                data-color-name="${escapeHtml(
                                    nameColor
                                )}"
                                style="background-color: ${hex};"
                                title="${escapeHtml(
                                    nameColor
                                )}"
                                aria-label="Pilih warna ${escapeHtml(
                                    nameColor
                                )}"
                            ></button>
                        `;
                    })
                    .join("");

            if (colorLabel) {
                colorLabel.textContent =
                    colors[0];
            }

            colorGrid
                .querySelectorAll(".color-item")
                .forEach(function (item) {
                    item.addEventListener(
                        "click",
                        function () {
                            if (
                                typeof window.pilihWarna ===
                                "function"
                            ) {
                                window.pilihWarna(
                                    this.dataset.colorName,
                                    this
                                );
                            }
                        }
                    );
                });
        }

        window.jidoorProductSizes = sizes;
        window.jidoorProductMaterials = materials;

        document.dispatchEvent(
            new CustomEvent("jidoorProductReady", {
                detail: {
                    product: product,
                    sizes: sizes
                }
            })
        );
    }

    window.jidoorProductSync = {
        readProducts,
        findByKey,
        formatRupiah,
        getKey
    };

    function refreshFromAdminData() {
        syncCatalogCards();
        syncDetailPage();
    }

    document.addEventListener(
        "DOMContentLoaded",
        function () {
            refreshFromAdminData();
        }
    );

    window.addEventListener("storage", function (event) {
        if (event.key === STORAGE_KEY) {
            refreshFromAdminData();
        }
    });
})();
