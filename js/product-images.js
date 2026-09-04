(function () {
    "use strict";

    const catalogImages = {
        kaos: "assets/Image/Kaos Produk.png",
        jersey: "assets/Image/New Jersey.png",
        hoodie: "assets/Image/Hoodie Produk.png",
        polo: "assets/Image/Polo Produk.png",
        korsa: "assets/Image/Korsa Produk.png",
        rompi: "assets/Image/Rompi Produk.png"
    };

    const detailImages = {
        kaos: [
            "assets/Image/Detail/kaos-front.jpg?v=20260830-detail",
            "assets/Image/Detail/kaos-back.jpg?v=20260830-detail",
            "assets/Image/Detail/kaos-detail.jpg?v=20260830-detail",
            "assets/Image/Detail/kaos-material.jpg?v=20260830-detail"
        ],
        jersey: [
            "assets/Image/Detail/jersey-front.jpg?v=20260830-detail",
            "assets/Image/Detail/jersey-back.jpg?v=20260830-detail",
            "assets/Image/Detail/jersey-detail.jpg?v=20260830-detail",
            "assets/Image/Detail/jersey-material.jpg?v=20260830-detail"
        ],
        hoodie: [
            "assets/Image/Detail/hoodie-front.jpg?v=20260830-detail",
            "assets/Image/Detail/hoodie-back.jpg?v=20260830-detail",
            "assets/Image/Detail/hoodie-detail.jpg?v=20260830-detail",
            "assets/Image/Detail/hoodie-material.jpg?v=20260830-detail"
        ],
        polo: [
            "assets/Image/Detail/polo-front.jpg?v=20260830-detail",
            "assets/Image/Detail/polo-back.jpg?v=20260830-detail",
            "assets/Image/Detail/polo-detail.jpg?v=20260830-detail",
            "assets/Image/Detail/polo-material.jpg?v=20260830-detail"
        ],
        korsa: [
            "assets/Image/Detail/korsa-front.jpg?v=20260830-detail",
            "assets/Image/Detail/korsa-back.jpg?v=20260830-detail",
            "assets/Image/Detail/korsa-detail.jpg?v=20260830-detail",
            "assets/Image/Detail/korsa-material.jpg?v=20260830-detail"
        ],
        rompi: [
            "assets/Image/Detail/rompi-front.jpg?v=20260830-detail",
            "assets/Image/Detail/rompi-back.jpg?v=20260830-detail",
            "assets/Image/Detail/rompi-detail.jpg?v=20260830-detail",
            "assets/Image/Detail/rompi-material.jpg?v=20260830-detail"
        ]
    };

    function normalize(value) {
        return String(value || "")
            .toLowerCase()
            .replace(/custom|shirt/g, "")
            .replace(/[^a-z0-9]+/g, "");
    }

    function getCategory(item) {
        const values = [
            item && item.kategori,
            item && item.category,
            item && item.produk,
            item && item.nama,
            item && item.productId,
            item && item.slug,
            item && item.id
        ];

        for (const value of values) {
            const key = normalize(value);

            if (key.includes("hoodie")) return "hoodie";
            if (key.includes("jersey")) return "jersey";
            if (key.includes("polo")) return "polo";
            if (key.includes("korsa")) return "korsa";
            if (key.includes("rompi")) return "rompi";
            if (key.includes("kaos")) return "kaos";
        }

        return "kaos";
    }

    function readAdminProducts() {
        try {
            const value = JSON.parse(localStorage.getItem("jidoorProducts") || "[]");
            return Array.isArray(value) ? value : [];
        } catch (_) {
            return [];
        }
    }

    function findAdminProduct(item) {
        if (!item) return null;
        if (typeof item === "object") return item;
        const key = normalize(item);
        return readAdminProducts().find(function (product) {
            return [product && product.id, product && product.slug, product && product.nama, product && product.kategori]
                .some(function (value) { return normalize(value) === key || normalize(value).includes(key) || key.includes(normalize(value)); });
        }) || null;
    }

    function userImage(path) {
        const value = String(path || "").trim();
        if (!value) return "";
        if (/^(data:|blob:|https?:\/\/)/i.test(value)) return value;
        return value.replace(/^(\.\.\/)+/, "").replace(/^\/+/, "");
    }

    function resolve(item) {
        const product = findAdminProduct(item);
        if (product && product.aktif !== false && product.gambar) {
            return userImage(product.gambar);
        }
        return catalogImages[getCategory(item)] || catalogImages.kaos;
    }

    function resolveDetail(item) {
        const product = findAdminProduct(item);
        const key = normalize(product ? product.kategori : item);
        const defaults = detailImages;
        const fallback = Object.keys(defaults).find(function (name) { return key.includes(name); }) || "kaos";

        if (product && product.photos && typeof product.photos === "object") {
            const photos = product.photos;
            const values = [photos.front, photos.back, photos.detail, photos.material].map(userImage);
            const base = defaults[fallback] || defaults.kaos;
            return base.map(function (src, index) { return values[index] || src; });
        }

        return defaults[fallback] || defaults.kaos;
    }

    window.jidoorProductImages = {
        catalog: catalogImages,
        detail: detailImages,
        getCategory: getCategory,
        resolve: resolve,
        resolveDetail: resolveDetail
    };
})();
