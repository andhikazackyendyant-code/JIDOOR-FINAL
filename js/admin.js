(function () {
    "use strict";

    const loginUser = getLoginUser();

    if (!loginUser || loginUser.role !== "admin") {
        window.location.replace("../login.html");
        return;
    }

    const STORAGE = {
        orders: "riwayatPesanan",
        lastOrder: "pesananTerakhir",
        products: "jidoorProducts",
        site: "jidoorSiteSettings",
        studio: "jidoorStudioSettings",
        media: "jidoorMedia",
        carousel: "jidoorCarouselSettings",
        activity: "jidoorAdminActivity"
    };

    const CAROUSEL_CONFIG_VERSION = 2;

    const CAROUSEL_DEFAULTS = {
        autoplay: true,
        interval: 4500,
        loop: true,
        showDots: true,
        slides: [
            { id:"jersey", active:true, title:"Jersey Custom", description:"Dryfit, Milano, dan Serena untuk kebutuhan olahraga.", image:"assets/Image/Carousel/jersey-carousel.png", href:"detail-produk.html?produk=jersey" },
            { id:"hoodie", active:true, title:"Hoodie Custom", description:"Fleece dan Baby Terry yang nyaman untuk komunitas.", image:"assets/Image/Carousel/hoodie-carousel.png", href:"detail-produk.html?produk=hoodie" },
            { id:"polo", active:true, title:"Polo Shirt", description:"Lacoste CVC dan Lacoste PE untuk tampilan rapi.", image:"assets/Image/Carousel/polo-carousel.png", href:"detail-produk.html?produk=polo" },
            { id:"korsa", active:true, title:"Korsa Custom", description:"American Drill dan Ripstop untuk organisasi dan lapangan.", image:"assets/Image/Carousel/korsa-carousel.png", href:"detail-produk.html?produk=korsa" },
            { id:"rompi", active:true, title:"Rompi Custom", description:"Canvas dan Taslan untuk kebutuhan outdoor.", image:"assets/Image/Carousel/rompi-carousel.png", href:"detail-produk.html?produk=rompi" },
            { id:"kaos", active:true, title:"Kaos Custom", description:"Combed 24s dan 30s untuk pemakaian sehari-hari.", image:"assets/Image/Carousel/kaos-carousel.png", href:"detail-produk.html?produk=kaos" }
        ]
    };

    const OPTION_DEFAULTS = {
        colors: [
            ["Hitam", "#111111"], ["Putih", "#FFFFFF"],
            ["Navy", "#1E2F4F"], ["Merah", "#B21F35"],
            ["Abu", "#808080"], ["Hijau Army", "#4B5320"],
            ["Coklat", "#6B3E26"], ["Kuning", "#FFD166"],
            ["Orange", "#F57C00"], ["Pink", "#FF6380"]
        ],
        sizes: ["S", "M", "L", "XL", "XXL", "XXXL"],
        sleeves: ["Pendek", "Panjang"],
        materials: {
            Kaos: ["Combed 24s", "Combed 30s"],
            Jersey: ["Dryfit", "Milano", "Serena"],
            Hoodie: ["Fleece", "Baby Terry"],
            Polo: ["Lacoste CVC", "Lacoste PE"],
            Korsa: ["American Drill", "Ripstop", "Cotton Combed"],
            Rompi: ["Canvas Premium", "Taslan", "Drill"]
        },
        designOptions: ["Upload Logo", "Upload Gambar", "Tambah Teks", "Ikon Cepat", "Logo Cepat"]
    };

    window.jidoorAdmin = {
        getOrders, saveOrders,
        getProducts, saveProducts,
        getSettings, saveSettings,
        getStudio, saveStudio,
        getMedia, saveMedia,
        getCarousel, saveCarousel,
        getOptions, saveOptions,
        logActivity, getActivities,
        getDefaultOptions: () => clone(OPTION_DEFAULTS),
        rupiah, statusClass, productName,
        normalizeImageSource,
        readFileAsDataUrl,
        escapeHtml,
        STORAGE
    };

    setupAdminIdentity();
    setupSidebar();
    setupActiveMenu();

    function getLoginUser() {
        try {
            const value = JSON.parse(localStorage.getItem("loginUser") || "null");
            return value && typeof value === "object" ? value : null;
        } catch (_) {
            return null;
        }
    }

    function safeRead(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            if (raw === null) return clone(fallback);
            const value = JSON.parse(raw);
            return value;
        } catch (_) {
            return clone(fallback);
        }
    }

    function safeWrite(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error("Jidoor Admin: gagal menyimpan", key, error);
            return false;
        }
    }

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function getOrders() {
        const orders = safeRead(STORAGE.orders, []);
        const result = Array.isArray(orders) ? orders : [];
        const latest = safeRead(STORAGE.lastOrder, null);

        if (latest && latest.id && !result.some((item) => item && item.id === latest.id)) {
            result.unshift(latest);
        }
        return result;
    }

    function saveOrders(orders) {
        return safeWrite(STORAGE.orders, Array.isArray(orders) ? orders : []);
    }

    function getProducts() {
        const products = safeRead(STORAGE.products, []);
        return Array.isArray(products) ? products : [];
    }

    function saveProducts(products) {
        const ok = safeWrite(STORAGE.products, Array.isArray(products) ? products : []);
        if (ok) logActivity("Produk diperbarui");
        return ok;
    }

    function getSettings() {
        const value = safeRead(STORAGE.site, {});
        return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    }

    function saveSettings(settings) {
        return safeWrite(STORAGE.site, settings && typeof settings === "object" ? settings : {});
    }

    function getStudio() {
        const value = safeRead(STORAGE.studio, {});
        return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    }

    function saveStudio(settings) {
        const ok = safeWrite(STORAGE.studio, settings && typeof settings === "object" ? settings : {});
        if (ok) logActivity("Design Studio diperbarui");
        return ok;
    }

    function getMedia() {
        const value = safeRead(STORAGE.media, {});
        return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    }

    function saveMedia(media) {
        return safeWrite(STORAGE.media, media && typeof media === "object" ? media : {});
    }

    function getCarousel() {
        const saved = safeRead(STORAGE.carousel, {});
        const value = saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};

        const savedSlides = Array.isArray(value.slides) && value.slides.length
            ? value.slides
            : null;

        let slides;
        if (!savedSlides) {
            slides = clone(CAROUSEL_DEFAULTS.slides);
        } else if (Number(value._version || 0) < CAROUSEL_CONFIG_VERSION) {
            const legacyProductImages = new Set([
                "assets/image/jersey produk.png",
                "assets/image/hoodie produk.png",
                "assets/image/polo produk.png",
                "assets/image/korsa produk.png",
                "assets/image/rompi produk.png",
                "assets/image/kaos produk.png",
                "assets/image/new jersey.png"
            ]);

            slides = savedSlides.map((slide, index) => {
                const base = CAROUSEL_DEFAULTS.slides[index] || {};
                const result = {
                    ...base,
                    ...(slide && typeof slide === "object" ? slide : {})
                };

                const image = String(result.image || "").trim();
                const normalized = image
                    .replace(/^\.\.\//, "")
                    .replace(/^\/+/, "")
                    .toLowerCase();

                if (!image || legacyProductImages.has(normalized)) {
                    result.image = base.image;
                }

                return result;
            });
            
            safeWrite(STORAGE.carousel, {
                autoplay: value.autoplay !== false,
                interval: Math.max(1500, Number(value.interval) || CAROUSEL_DEFAULTS.interval),
                loop: value.loop !== false,
                showDots: value.showDots !== false,
                slides,
                _version: CAROUSEL_CONFIG_VERSION
            });
        } else {
            slides = savedSlides.map((slide, index) => ({
                ...(CAROUSEL_DEFAULTS.slides[index] || {}),
                ...(slide && typeof slide === "object" ? slide : {})
            }));
        }

        return {
            autoplay: value.autoplay !== false,
            interval: Math.max(1500, Number(value.interval) || CAROUSEL_DEFAULTS.interval),
            loop: value.loop !== false,
            showDots: value.showDots !== false,
            slides
        };
    }

    function saveCarousel(settings) {
        return safeWrite(
            STORAGE.carousel,
            {
                ...(settings && typeof settings === "object" ? settings : clone(CAROUSEL_DEFAULTS)),
                _version: CAROUSEL_CONFIG_VERSION
            }
        );
    }

    function getOptions() {
        const saved = safeRead("jidoorCatalogOptions", {});
        const options = {
            colors: Array.isArray(saved.colors) ? saved.colors : [],
            sizes: Array.isArray(saved.sizes) ? saved.sizes : [],
            sleeves: Array.isArray(saved.sleeves) ? saved.sleeves : [],
            materials: saved.materials && typeof saved.materials === "object" ? saved.materials : {},
            designOptions: Array.isArray(saved.designOptions) ? saved.designOptions : []
        };

        if (!options.colors.length) options.colors = clone(OPTION_DEFAULTS.colors);
        if (!options.sizes.length) options.sizes = clone(OPTION_DEFAULTS.sizes);
        if (!options.sleeves.length) options.sleeves = clone(OPTION_DEFAULTS.sleeves);
        if (!options.designOptions.length) options.designOptions = clone(OPTION_DEFAULTS.designOptions);

        Object.keys(OPTION_DEFAULTS.materials).forEach((category) => {
            if (!Array.isArray(options.materials[category]) || !options.materials[category].length) {
                options.materials[category] = clone(OPTION_DEFAULTS.materials[category]);
            }
        });

        return options;
    }

    function saveOptions(options) {
        return safeWrite("jidoorCatalogOptions", options);
    }

    function logActivity(message) {
        const activities = safeRead(STORAGE.activity, []);
        const list = Array.isArray(activities) ? activities : [];
        list.unshift({
            message: String(message || "Perubahan admin"),
            at: new Date().toISOString()
        });
        safeWrite(STORAGE.activity, list.slice(0, 30));
    }

    function getActivities() {
        const activities = safeRead(STORAGE.activity, []);
        return Array.isArray(activities) ? activities : [];
    }

    function setupAdminIdentity() {
        document.querySelectorAll("[data-admin-name]").forEach((element) => {
            element.textContent = loginUser.nama || "Admin";
        });
    }

    function setupSidebar() {
        const button = document.getElementById("menuButton");
        const sidebar = document.getElementById("adminSidebar");
        if (!button || !sidebar) return;
        button.addEventListener("click", () => sidebar.classList.toggle("open"));
    }

    function setupActiveMenu() {
        const currentPage = window.location.pathname.split("/").pop();
        document.querySelectorAll(".admin-nav a").forEach((link) => {
            if (link.getAttribute("href") === currentPage) link.classList.add("active");
        });
    }

    function normalizeImageSource(value) {
        const source = String(value || "").trim();
        if (!source) return "";
        if (/^(data:|blob:|https?:\/\/)/i.test(source)) return source;
        return source.replace(/^(\.\.\/)+/, "").replace(/^\/+/, "");
    }

    function readFileAsDataUrl(file, maxMb = 2) {
        return new Promise((resolve, reject) => {
            if (!file || !file.type.startsWith("image/")) {
                reject(new Error("File harus berupa gambar."));
                return;
            }
            if (file.size > maxMb * 1024 * 1024) {
                reject(new Error(`Ukuran file maksimal ${maxMb} MB.`));
                return;
            }
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("File gagal dibaca."));
            reader.readAsDataURL(file);
        });
    }

    function rupiah(value) {
        const number = parseInt(String(value ?? 0).replace(/[^0-9]/g, ""), 10) || 0;
        return "Rp " + number.toLocaleString("id-ID");
    }

    function statusClass(status) {
        const value = String(status || "").toLowerCase();
        if (value.includes("selesai") || value.includes("berhasil")) return "badge-success";
        if (value.includes("batal")) return "badge-cancel";
        if (value.includes("menunggu") || value.includes("belum")) return "badge-pending";
        return "badge-process";
    }

    function productName(order) {
        const items = order?.items || order?.produk || order?.products || [];
        const item = Array.isArray(items) ? items[0] : items;
        return item?.nama || item?.name || item?.produk || order?.produk || "Produk Pesanan";
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;").replace(/</g, "&lt;")
            .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    window.adminLogout = function () {
        localStorage.removeItem("loginUser");
        window.location.replace("../login.html");
    };
})();
