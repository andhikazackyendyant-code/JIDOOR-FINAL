(() => {
    "use strict";

    const defaultProducts = {
        kaos: {
            name: "Kaos Custom",
            image: "assets/img/kaos-custom-front.png",
            mask: "assets/img/kaos-custom-front-mask.png",
            price: 70000,
            productId: "kaos-custom"
        },
        jersey: {
            name: "Jersey Custom",
            image: "assets/img/jersey-custom-front.png",
            mask: "assets/img/jersey-custom-front-mask.png",
            price: 90000,
            productId: "jersey-custom"
        },
        hoodie: {
            name: "Hoodie Custom",
            image: "assets/img/hoodie-custom-front.png",
            mask: "assets/img/hoodie-custom-front-mask.png",
            price: 120000,
            productId: "hoodie-custom"
        },
        polo: {
            name: "Polo Shirt",
            image: "assets/img/polo-shirt-front.png",
            mask: "assets/img/polo-shirt-front-mask.png",
            price: 120000,
            productId: "polo-custom"
        },
        korsa: {
            name: "Kaos Korsa",
            image: "assets/img/kaos-korsa-front.png",
            mask: "assets/img/kaos-korsa-front-mask.png",
            price: 80000,
            productId: "korsa-custom"
        },
        rompi: {
            name: "Rompi Custom",
            image: "assets/img/rompi-custom-front.png",
            mask: "assets/img/rompi-custom-front-mask.png",
            price: 110000,
            productId: "rompi-custom"
        }
    };

    const defaultColors = [
        ["Hitam", "#000000"],
        ["Putih", "#FFFFFF"],
        ["Merah", "#B21F35"],
        ["Navy", "#1E3A5F"],
        ["Abu", "#808080"],
        ["Hijau Army", "#4B5320"],
        ["Coklat", "#6B3E26"],
        ["Kuning", "#FFD166"],
        ["Orange", "#F57C00"],
        ["Pink", "#FF6380"]
    ];

    function readCatalogOptions() {
        try {
            const saved = JSON.parse(localStorage.getItem("jidoorCatalogOptions") || "{}");
            return {
                sizes: Array.isArray(saved.sizes) && saved.sizes.length ? saved.sizes : ["S", "M", "L", "XL"],
                sleeves: Array.isArray(saved.sleeves) && saved.sleeves.length ? saved.sleeves : ["Pendek", "Panjang"],
                colors: Array.isArray(saved.colors) ? saved.colors : []
            };
        } catch (_) {
            return { sizes: ["S", "M", "L", "XL"], sleeves: ["Pendek", "Panjang"], colors: [] };
        }
    }

    function readStudioSettings() {
        try {
            const data = JSON.parse(
                localStorage.getItem("jidoorStudioSettings") || "{}"
            );

            const settings =
                data && typeof data === "object" ? data : {};

            const products = JSON.parse(
                JSON.stringify(defaultProducts)
            );

            Object.keys(products).forEach(function (key) {
                const customPath = settings.mockup?.[key];

                if (customPath) {
                    const normalized = normalizeUserPath(customPath);
                    // Only use browser-safe bundled paths/data URLs. This prevents
                    // an old Windows/local path from blanking the preview.
                    if (normalized.startsWith("assets/") ||
                        normalized.startsWith("data:") ||
                        normalized.startsWith("blob:") ||
                        normalized.startsWith("http://") ||
                        normalized.startsWith("https://")) {
                        products[key].image = normalized;
                    }
                }
            });

            let adminColors = [];
            try {
                const catalog = JSON.parse(localStorage.getItem("jidoorCatalogOptions") || "{}");
                adminColors = Array.isArray(catalog.colors) ? catalog.colors : [];
            } catch (_) {
                adminColors = [];
            }

            const mergedSettingColors = [
                ...(Array.isArray(settings.colors) ? settings.colors : []),
                ...adminColors.map(function (color) {
                    return { nama: color?.[0], hex: color?.[1] };
                })
            ];

            const customColors = mergedSettingColors
                .filter(function (color) {
                        return (
                            color &&
                            color.nama &&
                            /^#[0-9A-Fa-f]{6}$/.test(color.hex || "")
                        );
                    })
                    .map(function (color) {
                        return [
                            String(color.nama).trim().toLowerCase() === "oranye"
                                ? "Orange"
                                : String(color.nama),
                            String(color.hex).toUpperCase()
                        ];
                    });

            const colors = [...defaultColors];
            customColors.forEach(function (color) {
                const exists = colors.some(function (baseColor) {
                    return String(baseColor[0]).toLowerCase() ===
                        String(color[0]).toLowerCase();
                });
                if (!exists) colors.push(color);
            });

            return {
                products,
                colors
            };
        } catch (error) {
            return {
                products: defaultProducts,
                colors: defaultColors
            };
        }
    }

    function normalizeUserPath(path) {
        const value = String(path || "").trim();

        if (!value) return "";

        if (
            value.startsWith("data:") ||
            value.startsWith("blob:") ||
            value.startsWith("http://") ||
            value.startsWith("https://")
        ) {
            return value;
        }

        return value
            .replace(/^(\.\.\/)+/, "")
            .replace(/^\/+/, "");
    }

    function syncAdminProductData(productMap) {
        try {
            const saved = JSON.parse(
                localStorage.getItem("jidoorProducts") || "[]"
            );

            if (!Array.isArray(saved)) return;

            saved.forEach(function (item) {
                if (!item || item.aktif === false) return;

                const key = Object.keys(productMap).find(function (candidate) {
                    return (
                        productMap[candidate].productId === item.id ||
                        productMap[candidate].name.toLowerCase() ===
                            String(item.nama || "").toLowerCase()
                    );
                });

                if (!key) return;

                productMap[key].name = item.nama || productMap[key].name;
                productMap[key].price = Number(item.harga) || productMap[key].price;

                if (item.gambar) {
                    const image = normalizeUserPath(item.gambar);
                    if (image) productMap[key].catalogImage = image;
                }

                // Tipe lengan yang dipilih Admin dapat dikontrol per produk.
                // Jika produk belum memiliki pengaturan khusus, editor tetap
                // memakai daftar sleeve global yang sudah ada.
                if (Array.isArray(item.lengan) && item.lengan.length) {
                    productMap[key].sleeves = item.lengan.map(String);
                }
            });
        } catch (error) {
            console.warn("Data produk Admin tidak dapat disinkronkan.", error);
        }
    }

    const studioConfig = readStudioSettings();
    const products = studioConfig.products;
    syncAdminProductData(products);
    const colors = studioConfig.colors;

    // Mockup warna asli dari assets/Image. Semua 10 warna dibuat tersedia
    // untuk setiap produk. Nama "Orange" dan "Oranye" diperlakukan sama.
    const colorAssetMap = {
        kaos: {
            "hitam": "assets/Image/Kaos (3).png",
            "putih": "assets/Image/Kaos (4).png",
            "merah": "assets/Image/Kaos (5).png",
            "navy": "assets/Image/Kaos (6).png",
            "abu": "assets/Image/Kaos (7).png",
            "hijau army": "assets/Image/Kaos (8).png",
            "coklat": "assets/Image/Kaos (9).png",
            "kuning": "assets/Image/Kaos (10).png",
            "orange": "assets/Image/Kaos (1).png",
            "pink": "assets/Image/Kaos (2).png"
        },
        jersey: {
            "hitam": "assets/Image/Jersey (3).png",
            "putih": "assets/Image/Jersey (4).png",
            "merah": "assets/Image/Jersey (5).png",
            "navy": "assets/Image/Jersey (6).png",
            "abu": "assets/Image/Jersey (7).png",
            "hijau army": "assets/Image/Jersey (9).png",
            "coklat": "assets/Image/Jersey (10).png",
            "kuning": "assets/Image/Jersey (1).png",
            "orange": "assets/Image/Jersey (2).png",
            "pink": "assets/Image/Jersey (8).png"
        },
        hoodie: {
            "hitam": "assets/Image/Hoodie (5).png",
            "putih": "assets/Image/Hoodie (10).png",
            "merah": "assets/Image/Hoodie (1).png",
            "navy": "assets/Image/Hoodie (6).png",
            "abu": "assets/Image/Hoodie (8).png",
            "hijau army": "assets/Image/Hoodie (7).png",
            "coklat": "assets/Image/Hoodie (2).png",
            "kuning": "assets/Image/Hoodie (3).png",
            "orange": "assets/Image/Hoodie (4).png",
            "pink": "assets/Image/Hoodie (9).png"
        },
        polo: {
            "hitam": "assets/Image/Polo (8).png",
            "putih": "assets/Image/Polo (9).png",
            "merah": "assets/Image/Polo (10).png",
            "navy": "assets/Image/Polo (1).png",
            "abu": "assets/Image/Polo (2).png",
            "hijau army": "assets/Image/Polo (3).png",
            "coklat": "assets/Image/Polo (4).png",
            "kuning": "assets/Image/Polo (5).png",
            "orange": "assets/Image/Polo (6).png",
            "pink": "assets/Image/Polo (7).png"
        },
        korsa: {
            "hitam": "assets/Image/Korsa (2).png",
            "putih": "assets/Image/Korsa (3).png",
            "merah": "assets/Image/Korsa (4).png",
            "navy": "assets/Image/Korsa (5).png",
            "abu": "assets/Image/Korsa (6).png",
            "hijau army": "assets/Image/Korsa (7).png",
            "coklat": "assets/Image/Korsa (8).png",
            "kuning": "assets/Image/Korsa (1).png",
            "orange": "assets/Image/Korsa (9).png",
            "pink": "assets/Image/Korsa (10).png"
        },
        rompi: {
            "hitam": "assets/Image/Rompi (1).png",
            "putih": "assets/Image/Rompi (3).png",
            "merah": "assets/Image/Rompi (4).png",
            "navy": "assets/Image/Rompi (5).png",
            "abu": "assets/Image/Rompi (6).png",
            "hijau army": "assets/Image/Rompi (7).png",
            "coklat": "assets/Image/Rompi (8).png",
            "kuning": "assets/Image/Rompi (9).png",
            "orange": "assets/Image/Rompi (10).png",
            "pink": "assets/Image/Rompi (11).png"
        }
    };

    const catalogOptions = readCatalogOptions();
    const designSizes = catalogOptions.sizes;
    const designSleeves = catalogOptions.sleeves;

    const designBasePrices = {
        kaos: 70000,
        jersey: 90000,
        hoodie: 120000,
        polo: 120000,
        korsa: 80000,
        rompi: 110000
    };

    const quickIcons = ["★", "♥", "⚡", "✦", "♛", "✓"];
    const quickLogos = ["J", "JD", "JC", "K", "A"];

    const $ = (id) => document.getElementById(id);

    const els = {
        productSelect: $("productSelect"),
        garmentImage: $("garmentImage"),
        garmentColor: $("garmentColor"),
        previewProductName: $("previewProductName"),
        selectedColorName: $("selectedColorName"),
        colorOptions: $("colorOptions"),
        designCanvas: $("designCanvas"),
        designLayers: $("designLayers"),
        canvasHint: $("canvasHint"),
        textInput: $("textInput"),
        addText: $("addText"),
        quickIcons: $("quickIcons"),
        quickLogos: $("quickLogos"),
        imageUpload: $("imageUpload"),
        elementControls: $("elementControls"),
        textControls: $("textControls"),
        imageControls: $("imageControls"),
        selectedTextInput: $("selectedTextInput"),
        fontFamily: $("fontFamily"),
        textSize: $("textSize"),
        textSizeValue: $("textSizeValue"),
        textColor: $("textColor"),
        toggleBold: $("toggleBold"),
        imageSize: $("imageSize"),
        imageSizeValue: $("imageSizeValue"),
        layersList: $("layersList"),
        layerCount: $("layerCount"),
        undoDesign: $("undoDesign"),
        redoDesign: $("redoDesign"),
        resetDesign: $("resetDesign"),
        orderDesign: $("orderDesign"),
        toast: $("toast"),
        deleteElement: $("deleteElement"),
        duplicateElement: $("duplicateElement"),
        designOrderRows: $("designOrderRows"),
        addDesignSize: $("addDesignSize"),
        designOrderTotal: $("designOrderTotal")
    };

    const required = [
        "productSelect",
        "garmentImage",
        "garmentColor",
        "colorOptions",
        "designCanvas",
        "designLayers"
    ];

    if (required.some((key) => !els[key])) {
        console.error("[Jidoor Design Studio] Struktur HTML belum lengkap.");
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const requestedProduct = params.get("produk");

    let state = {
        product: products[requestedProduct] ? requestedProduct : "kaos",
        color: colors[0],
        elements: [],
        selectedId: null
    };

    let history = [];
    let future = [];
    let drag = null;

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function createId() {
        return `el-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

    function getProduct() {
        return products[state.product] || products.kaos;
    }

    function getSelected() {
        return state.elements.find((element) => element.id === state.selectedId);
    }

    function showToast(message) {
        if (!els.toast) return;

        els.toast.textContent = message;
        els.toast.classList.add("is-visible");

        clearTimeout(showToast.timer);

        showToast.timer = setTimeout(() => {
            els.toast.classList.remove("is-visible");
        }, 2600);
    }

    function saveDraft() {
        try {
            localStorage.setItem("jidoorDesignDraft", JSON.stringify(state));
        } catch (error) {
            console.warn("Draft desain tidak dapat disimpan.", error);
        }
    }

    function loadDraft() {
        try {
            const raw = localStorage.getItem("jidoorDesignDraft");
            if (!raw) return null;

            const draft = JSON.parse(raw);

            if (!draft || !products[draft.product] || !Array.isArray(draft.elements)) {
                return null;
            }

            return draft;
        } catch {
            return null;
        }
    }

    function pushHistory() {
        history.push(clone(state));

        if (history.length > 30) {
            history.shift();
        }

        future = [];
        updateHistoryButtons();
    }

    function updateHistoryButtons() {
        if (els.undoDesign) {
            els.undoDesign.disabled = history.length <= 1;
        }

        if (els.redoDesign) {
            els.redoDesign.disabled = future.length === 0;
        }
    }

    function normalizeColorName(name) {
        return String(name || "").trim().toLowerCase();
    }

    function getColorAsset(productKey, colorName) {
        return colorAssetMap[productKey]?.[
            normalizeColorName(colorName)
        ] || products[productKey]?.image || "";
    }

    function getAvailableColors(productKey) {
        const map = colorAssetMap[productKey] || {};
        const product = products[productKey];
        const allowed = Array.isArray(product?.warna) && product.warna.length
            ? product.warna.map(normalizeColorName)
            : null;

        return colors.filter(([name]) => {
            const key = normalizeColorName(name);
            return Boolean(map[key]) && (!allowed || allowed.includes(key));
        });
    }

    function getAvailableSleeves() {
        const product = products[state.product];
        const allowed = Array.isArray(product?.sleeves) && product.sleeves.length
            ? product.sleeves.map((value) => String(value).trim().toLowerCase())
            : null;

        return designSleeves.filter((value) => {
            return !allowed || allowed.includes(String(value).trim().toLowerCase());
        });
    }

    function getSelectedDesignRows() {
        if (!els.designOrderRows) return [];

        return [...els.designOrderRows.querySelectorAll(".design-order-row")]
            .map((row) => ({
                ukuran:
                    row.querySelector(".design-size-select")?.value || "S",
                lengan:
                    row.querySelector(".design-sleeve-select")?.value || "Pendek",
                jumlah: Math.max(
                    1,
                    Number(
                        row.querySelector(".design-qty-value")?.textContent
                    ) || 1
                )
            }));
    }

    function updateDesignOrderTotal() {
        if (!els.designOrderTotal) return;

        const total = getSelectedDesignRows().reduce(
            (sum, item) => sum + item.jumlah,
            0
        );

        els.designOrderTotal.textContent = `${total} pcs`;
    }

    function createDesignOrderRow(
        size = "S",
        sleeve = "Pendek",
        quantity = 1
    ) {
        if (!els.designOrderRows) return;

        const row = document.createElement("div");
        row.className = "design-order-row";

        row.innerHTML = `
            <div class="design-order-field">
                <label>Ukuran</label>
                <select class="design-size-select">
                    ${designSizes.map((item) => `
                        <option value="${item}" ${item === size ? "selected" : ""}>
                            ${item}
                        </option>
                    `).join("")}
                </select>
            </div>

            <div class="design-order-field">
                <label>Tipe Lengan</label>
                <select class="design-sleeve-select">
                    ${getAvailableSleeves().map((item) => `
                        <option value="${item}" ${item === sleeve ? "selected" : ""}>
                            ${item}
                        </option>
                    `).join("")}
                </select>
            </div>

            <div class="design-order-field design-quantity-field">
                <label>Jumlah</label>
                <div class="design-quantity-control">
                    <button type="button" class="design-qty-minus" aria-label="Kurangi jumlah">−</button>
                    <span class="design-qty-value">${Math.max(1, Number(quantity) || 1)}</span>
                    <button type="button" class="design-qty-plus" aria-label="Tambah jumlah">+</button>
                </div>
            </div>

            <button type="button" class="remove-design-row" aria-label="Hapus rincian">
                <i class="bi bi-trash3"></i>
            </button>
        `;

        const quantityValue =
            row.querySelector(".design-qty-value");

        row.querySelector(".design-qty-minus").addEventListener(
            "click",
            () => {
                quantityValue.textContent = String(
                    Math.max(
                        1,
                        Number(quantityValue.textContent) - 1
                    )
                );
                updateDesignOrderTotal();
            }
        );

        row.querySelector(".design-qty-plus").addEventListener(
            "click",
            () => {
                quantityValue.textContent = String(
                    Number(quantityValue.textContent) + 1
                );
                updateDesignOrderTotal();
            }
        );

        row.querySelector(".remove-design-row").addEventListener(
            "click",
            () => {
                const rows =
                    els.designOrderRows.querySelectorAll(
                        ".design-order-row"
                    );

                if (rows.length === 1) {
                    showToast(
                        "Minimal satu rincian pesanan harus tersedia."
                    );
                    return;
                }

                row.remove();
                updateDesignOrderTotal();
            }
        );

        row.querySelectorAll("select").forEach((select) => {
            select.addEventListener(
                "change",
                updateDesignOrderTotal
            );
        });

        els.designOrderRows.appendChild(row);
        updateDesignOrderTotal();
    }

    function resetDesignOrder() {
        if (!els.designOrderRows) return;

        els.designOrderRows.replaceChildren();
        createDesignOrderRow(designSizes[0] || "S", getAvailableSleeves()[0] || "Pendek", 1);
    }

    function renderProduct() {
        const product = getProduct();
        const mockupImage = getColorAsset(state.product, state.color[0]);

        els.productSelect.value = state.product;
        els.previewProductName.textContent = product.name;
        els.selectedColorName.textContent = state.color[0];
        els.garmentImage.src = mockupImage;
        els.garmentImage.alt = `Mockup ${product.name} warna ${state.color[0]}`;

        // Warna sudah terdapat pada asset mockup, jadi tidak memakai overlay warna.
        if (els.garmentColor) {
            els.garmentColor.style.display = "none";
            els.garmentColor.style.opacity = "0";
            els.garmentColor.style.backgroundImage = "none";
        }
    }

    function renderColors() {
        const availableColors = getAvailableColors(state.product);
        els.colorOptions.replaceChildren();
        if (!availableColors.length) return;

        const selectedExists = availableColors.some(([name]) =>
            normalizeColorName(name) === normalizeColorName(state.color[0])
        );
        if (!selectedExists) state.color = availableColors[0];

        availableColors.forEach(([name, hex]) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = `color-choice${normalizeColorName(name) === normalizeColorName(state.color[0]) ? " is-active" : ""}`;
            button.dataset.color = hex;
            button.title = name;
            button.setAttribute("aria-label", `Pilih warna ${name}`);

            const swatch = document.createElement("span");
            swatch.style.backgroundColor = hex;
            button.appendChild(swatch);

            button.addEventListener("click", () => {
                if (normalizeColorName(name) === normalizeColorName(state.color[0])) return;
                pushHistory();
                state.color = [name, hex];
                render();
            });

            els.colorOptions.appendChild(button);
        });
    }

    function renderElements() {
        els.designLayers.replaceChildren();

        state.elements.forEach((element) => {
            const node = document.createElement("div");

            node.dataset.id = element.id;
            node.className =
                `design-element ${element.type === "text" ? "element-text" : "element-image"}` +
                `${element.kind === "logo" ? " element-logo" : ""}` +
                `${element.id === state.selectedId ? " is-selected" : ""}`;

            node.style.left = `${element.x}%`;
            node.style.top = `${element.y}%`;

            if (element.type === "text") {
                node.textContent = element.content || "Teks";
                node.style.fontFamily = element.font || "Poppins, sans-serif";
                node.style.fontSize = `${element.size}px`;
                node.style.fontWeight = element.bold ? "800" : "500";
                node.style.color = element.color || "#17212D";
                node.style.textAlign = element.align || "center";
            } else {
                node.style.width = `${element.size}%`;
                node.style.height = `${element.size}%`;

                const image = document.createElement("img");
                image.src = element.src;
                image.alt = "Logo atau gambar desain";
                image.draggable = false;

                node.appendChild(image);
            }

            const resize = document.createElement("span");
            resize.className = "resize-handle";
            resize.title = "Ubah ukuran";

            node.appendChild(resize);

            node.addEventListener("pointerdown", startDrag);

            els.designLayers.appendChild(node);
        });

        els.canvasHint.hidden = state.elements.length > 0;
    }

    function renderLayers() {
        els.layerCount.textContent = state.elements.length;
        els.layersList.replaceChildren();

        if (!state.elements.length) {
            const empty = document.createElement("p");
            empty.className = "empty-layers";
            empty.textContent = "Belum ada elemen.";
            els.layersList.appendChild(empty);
            return;
        }

        [...state.elements].reverse().forEach((element) => {
            const button = document.createElement("button");

            button.type = "button";
            button.className =
                `layer-item${element.id === state.selectedId ? " is-active" : ""}`;

            const badge = document.createElement("span");
            badge.className = "layer-badge";
            badge.textContent = element.type === "text" ? "T" : "◉";

            const name = document.createElement("span");
            name.className = "layer-name";
            name.textContent =
                element.type === "text"
                    ? element.content || "Teks kosong"
                    : "Logo / gambar";

            button.append(badge, name);

            button.addEventListener("click", () => {
                state.selectedId = element.id;
                render();
            });

            els.layersList.appendChild(button);
        });
    }

    function renderControls() {
        const element = getSelected();

        els.elementControls.hidden = !element;

        if (!element) return;

        const isText = element.type === "text";

        els.textControls.hidden = !isText;
        els.imageControls.hidden = isText;

        if (isText) {
            els.selectedTextInput.value = element.content || "";
            els.fontFamily.value = element.font || "Poppins, sans-serif";
            els.textSize.value = element.size;
            els.textSizeValue.textContent = `${element.size} px`;
            els.textColor.value = element.color || "#17212D";

            els.toggleBold.classList.toggle("is-active", !!element.bold);
            els.toggleBold.setAttribute("aria-pressed", String(!!element.bold));

            document.querySelectorAll("[data-align]").forEach((button) => {
                button.classList.toggle(
                    "is-active",
                    button.dataset.align === (element.align || "center")
                );
            });
        } else {
            els.imageSize.value = element.size;
            els.imageSizeValue.textContent = `${element.size}%`;
        }
    }

    function render() {
        renderProduct();
        renderColors();
        renderElements();
        renderLayers();
        renderControls();
        saveDraft();
        updateHistoryButtons();
    }

    function selectTool(tool) {
        document.querySelectorAll(".tool-tab").forEach((button) => {
            const active = button.dataset.tool === tool;

            button.classList.toggle("is-active", active);
            button.setAttribute("aria-selected", String(active));
        });

        $("textTool").hidden = tool !== "text";
        $("imageTool").hidden = tool !== "image";
    }

    function addText(content, kind = "text") {
        const value = (content ?? els.textInput.value).trim();

        if (!value) {
            showToast("Masukkan teks terlebih dahulu.");
            return;
        }

        pushHistory();

        const element = {
            id: createId(),
            type: "text",
            kind,
            content: value,
            x: 50,
            y: 48,
            size: kind === "logo" ? 28 : 32,
            color: kind === "logo" ? "#FFFFFF" : "#17212D",
            bold: kind === "logo",
            align: "center",
            font: "Poppins, sans-serif"
        };

        state.elements.push(element);
        state.selectedId = element.id;
        els.textInput.value = "";

        render();
    }

    function addImage(file) {
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            showToast("File harus berupa gambar.");
            return;
        }

        if (file.size > 1.5 * 1024 * 1024) {
            showToast("Ukuran gambar maksimal 1,5 MB.");
            els.imageUpload.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            pushHistory();

            const element = {
                id: createId(),
                type: "image",
                src: reader.result,
                x: 50,
                y: 48,
                size: 24
            };

            state.elements.push(element);
            state.selectedId = element.id;

            render();
        };

        reader.readAsDataURL(file);
        els.imageUpload.value = "";
    }

    function updateSelected(key, value) {
        const element = getSelected();

        if (!element || element[key] === value) return;

        pushHistory();
        element[key] = value;
        render();
    }

    function removeSelected() {
        if (!getSelected()) return;

        pushHistory();

        state.elements = state.elements.filter(
            (element) => element.id !== state.selectedId
        );

        state.selectedId = null;

        render();
    }

    function duplicateSelected() {
        const element = getSelected();

        if (!element) return;

        pushHistory();

        const copy = clone(element);

        copy.id = createId();
        copy.x = Math.min(90, copy.x + 5);
        copy.y = Math.min(90, copy.y + 5);

        state.elements.push(copy);
        state.selectedId = copy.id;

        render();
    }

    function startDrag(event) {
        const node =
        event.currentTarget;

        const element =
        state.elements.find(
            (item) =>
                item.id === node.dataset.id
        );

        if (!element) return;
        event.preventDefault();

        state.selectedId =
        element.id;

        const isResize =
        event.target.classList.contains(
            "resize-handle"
        );

        drag = {
        id: element.id,
        resize: isResize,
        startX: event.clientX,
        startY: event.clientY,
        startSize: element.size,
        startLeft: element.x,
        startTop: element.y,
        node: node,
        changed: false
    };
        node.classList.add(
        "is-dragging"
    );

        node.setPointerCapture(
        event.pointerId
    );
        node.addEventListener(
        "pointermove",
        moveDrag
    );
        node.addEventListener(
        "pointerup",
        endDrag,
        { once: true }
    );
        node.addEventListener(
        "pointercancel",
        endDrag,
        { once: true }
    );

    renderLayers();
    renderControls();
}

    function moveDrag(event) {
    if (!drag) return;

    const element = state.elements.find(
            (item) => item.id === drag.id
        );

    if (!element) return;

    const rect = els.designCanvas.getBoundingClientRect();

    if (drag.resize) {

        const delta = ((event.clientX - drag.startX) + (event.clientY - drag.startY)) / 2;

        const change = (delta / rect.width) * 100;

        const min = element.type === "text" ? 14 : 10;

        const max = element.type === "text" ? 96 : 58;
        element.size = Math.round(Math.max(min,Math.min(max,drag.startSize + change)));}
    else {

        const x =
            (
                (event.clientX -
                    rect.left) /
                rect.width
            ) * 100;

        const y =
            (
                (event.clientY -
                    rect.top) /
                rect.height
            ) * 100;

        element.x =
            Math.round(
                Math.max(
                    8,
                    Math.min(92, x)
                )
            );

        element.y =
            Math.round(
                Math.max(
                    8,
                    Math.min(92, y)
                )
            );
    }

    drag.changed = true;

    drag.node.style.left =
        `${element.x}%`;

    drag.node.style.top =
        `${element.y}%`;

    if (element.type === "text") {

        drag.node.style.fontSize =
            `${element.size}px`;

    } else {

        drag.node.style.width =
            `${element.size}%`;

        drag.node.style.height =
            `${element.size}%`;
    }

    renderControls();
}
    function endDrag(event) {

    if (!drag) return;

    drag.node.classList.remove(
        "is-dragging"
    );

    drag.node.removeEventListener(
        "pointermove",
        moveDrag
    );

    if (drag.changed) {

        history.push(
            clone(state)
        );

        if (history.length > 30) {
            history.shift();
        }

        future = [];

        updateHistoryButtons();
        saveDraft();
    }

    drag = null;

    render();
}

    function resetDesign() {
        if (!window.confirm("Reset semua elemen desain?")) return;

        pushHistory();

        state = {
            product: products[requestedProduct]
                ? requestedProduct
                : "kaos",
            color: colors[0],
            elements: [],
            selectedId: null
        };

        render();
        showToast("Desain berhasil direset.");
    }

    function undo() {
        if (history.length <= 1) return;

        future.push(history.pop());
        state = clone(history[history.length - 1]);

        render();
    }

    function redo() {
        if (!future.length) return;

        const next = future.pop();

        history.push(clone(next));
        state = clone(next);

        render();
    }

    function saveAndOrder() {
        const product = getProduct();
        const rincianPesanan =
            getSelectedDesignRows();

        if (!rincianPesanan.length) {
            showToast(
                "Rincian pesanan belum lengkap."
            );
            return;
        }

        const totalQuantity =
            rincianPesanan.reduce(
                (sum, item) => sum + item.jumlah,
                0
            );

        const basePrice =
            Number(product.price) ||
            designBasePrices[state.product] ||
            0;

        if (!basePrice) {
            showToast(
                "Harga produk belum tersedia."
            );
            return;
        }

        const mockupImage =
            getColorAsset(
                state.product,
                state.color[0]
            );

        const designData = {
            ...clone(state),
            productName: product.name,
            productId:
                product.productId ||
                state.product,
            colorName: state.color[0],
            colorHex: state.color[1],
            mockupImage,
            maskImage: product.mask || "",
            rincianPesanan,
            totalQuantity,
            hargaDasar: basePrice,
            savedAt:
                new Date().toISOString()
        };

        try {
            const cart =
                JSON.parse(
                    localStorage.getItem(
                        "keranjang"
                    ) || "[]"
                );

            if (!Array.isArray(cart)) {
                throw new Error(
                    "Format keranjang tidak valid."
                );
            }

            rincianPesanan.forEach(
                (detail, index) => {
                    const hargaSatuan =
                        basePrice +
                        (
                            detail.lengan ===
                            "Panjang"
                                ? 10000
                                : 0
                        );

                    cart.push({
                        id:
                            `custom-${Date.now()}-${index}`,
                        produk: product.name,
                        nama: product.name,
                        name: product.name,
                        harga: hargaSatuan,
                        gambar: mockupImage,
                        bahan: "Custom",
                        warna: state.color[0],
                        warnaKey: state.color[1],
                        ukuran: detail.ukuran,
                        lengan: detail.lengan,
                        jumlah: detail.jumlah,
                        variants: [detail],
                        isCustom: true,
                        checkoutDesign:
                            designData,
                        desain: designData
                    });
                }
            );

            localStorage.setItem(
                "keranjang",
                JSON.stringify(cart)
            );

            localStorage.setItem(
                "jidoorDesignData",
                JSON.stringify(designData)
            );

            if (
                typeof window.updateCartBadge ===
                "function"
            ) {
                window.updateCartBadge();
            }

            showToast(
                "Desain dan rincian pesanan berhasil dimasukkan ke keranjang."
            );

            setTimeout(() => {
                window.location.href =
                    "keranjang.html";
            }, 500);
        } catch (error) {
            console.error(error);
            showToast(
                "Desain gagal dimasukkan ke keranjang. Coba lagi."
            );
        }
    }

    function bindEvents() {
        els.productSelect.addEventListener("change", () => {
            if (els.productSelect.value === state.product) return;

            pushHistory();

            state.product = els.productSelect.value;
            state.elements = [];
            state.selectedId = null;

            const productColors = getAvailableColors(state.product);
            if (productColors.length) state.color = productColors[0];

            render();
        });

        document.querySelectorAll(".tool-tab").forEach((button) => {
            button.addEventListener("click", () => {
                selectTool(button.dataset.tool);
            });
        });

        els.addText.addEventListener("click", () => {
            addText();
        });

        els.textInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                addText();
            }
        });

        els.imageUpload.addEventListener("change", (event) => {
            addImage(event.target.files?.[0]);
        });

        els.selectedTextInput.addEventListener("input", () => {
            const element = getSelected();
            if (!element || element.type !== "text") return;
            element.content = els.selectedTextInput.value;
            renderElements();
            renderLayers();
            saveDraft();
        });

        els.fontFamily.addEventListener("change", () => {
            updateSelected("font", els.fontFamily.value);
        });

        els.textSize.addEventListener("input", () => {
            const element = getSelected();
            if (!element || element.type !== "text") return;

            element.size = Number(els.textSize.value);
            els.textSizeValue.textContent = `${element.size} px`;
            renderElements();
            saveDraft();
        });

        els.textSize.addEventListener("change", () => {
            const element = getSelected();
            if (!element || element.type !== "text") return;
            history.push(clone(state));
            future = [];
            updateHistoryButtons();
        });

        els.textColor.addEventListener("input", () => {
            const element = getSelected();
            if (!element || element.type !== "text") return;

            element.color = els.textColor.value;
            renderElements();
            saveDraft();
        });

        els.textColor.addEventListener("change", () => {
            const element = getSelected();
            if (!element || element.type !== "text") return;
            history.push(clone(state));
            future = [];
            updateHistoryButtons();
        });

        els.toggleBold.addEventListener("click", () => {
            const element = getSelected();
            if (!element || element.type !== "text") return;

            updateSelected("bold", !element.bold);
        });

        document.querySelectorAll("[data-align]").forEach((button) => {
            button.addEventListener("click", () => {
                updateSelected("align", button.dataset.align);
            });
        });

        els.imageSize.addEventListener("input", () => {
            const element = getSelected();
            if (!element || element.type !== "image") return;

            element.size = Number(els.imageSize.value);
            els.imageSizeValue.textContent = `${element.size}%`;

            renderElements();
            saveDraft();
        });

        els.imageSize.addEventListener("change", () => {
            const element = getSelected();
            if (!element || element.type !== "image") return;
            history.push(clone(state));
            future = [];
            updateHistoryButtons();
        });

        els.deleteElement.addEventListener("click", removeSelected);
        els.duplicateElement.addEventListener("click", duplicateSelected);

        els.undoDesign.addEventListener("click", undo);
        els.redoDesign.addEventListener("click", redo);

        els.resetDesign.addEventListener("click", resetDesign);

        if (els.addDesignSize && !els.addDesignSize.dataset.bound) {
            els.addDesignSize.dataset.bound = "true";
            els.addDesignSize.addEventListener("click", function (event) {
                event.preventDefault();
                createDesignOrderRow(designSizes[0] || "S", getAvailableSleeves()[0] || "Pendek", 1);
                showToast("Rincian ukuran ditambahkan.");
            });
        }

        els.orderDesign.addEventListener(
            "click",
            saveAndOrder
        );

        document.addEventListener("keydown", (event) => {
            const tag = document.activeElement?.tagName;
            const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(tag);

            if (!typing && (event.key === "Delete" || event.key === "Backspace")) {
                event.preventDefault();
                removeSelected();
            }

            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
                event.preventDefault();
                undo();
            }

            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
                event.preventDefault();
                redo();
            }

            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d") {
                event.preventDefault();
                duplicateSelected();
            }
        });

        els.garmentImage.addEventListener("error", () => {
            showToast(`Mockup ${getProduct().name} tidak ditemukan.`);
        });
    }

    function initialize() {
        const draft = loadDraft();

        if (draft && !requestedProduct) {
            state = {
                product: products[draft.product]
                    ? draft.product
                    : "kaos",
                color: Array.isArray(draft.color) ? draft.color : colors[0],
                elements: draft.elements,
                selectedId: draft.selectedId || null
            };
        }

        if (requestedProduct && products[requestedProduct]) {
            state.product = requestedProduct;
        }

        history = [clone(state)];
        future = [];

        bindEvents();

        quickIcons.forEach((icon) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "quick-option";
            button.textContent = icon;
            button.title = `Tambahkan ikon ${icon}`;
            button.addEventListener("click", () => addText(icon, "icon"));
            els.quickIcons.appendChild(button);
        });

        quickLogos.forEach((logo) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "quick-option quick-option--logo";
            button.textContent = logo;
            button.title = `Tambahkan logo inisial ${logo}`;
            button.addEventListener("click", () => addText(logo, "logo"));
            els.quickLogos.appendChild(button);
        });

        resetDesignOrder();
        render();
    }

    initialize();
})();
