/* JIDOOR ADMIN - PRODUCT MANAGEMENT
   Admin-only editor. The user-facing layout is not rewritten here.
*/
(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        if (!window.jidoorAdmin) return;

        const $ = (id) => document.getElementById(id);
        const grid = $("productGrid");
        const modal = $("productModal");
        const form = $("productForm");
        const search = $("productSearch");
        const categoryFilter = $("productCategoryFilter");
        const count = $("productCount");
        if (!grid || !modal || !form || !search || !categoryFilter || !count) return;

        let editIndex = -1;
        let products = [];
        let options = jidoorAdmin.getOptions();
        let selected = { material: [], size: [], color: [], sleeve: [] };

        const baseProducts = [
            { id:"kaos-custom", nama:"Kaos Custom", kategori:"Kaos", harga:70000, material:["Combed 24s","Combed 30s"], ukuran:["S","M","L","XL","XXL"], warna:["Hitam","Putih","Merah","Navy","Abu","Hijau Army","Coklat","Kuning","Orange","Pink"], gambar:"assets/Image/Kaos Produk.png", deskripsi:"Kaos custom Jidoor untuk kebutuhan komunitas dan kegiatan." },
            { id:"jersey-custom", nama:"Jersey Custom", kategori:"Jersey", harga:90000, material:["Dryfit","Milano","Serena"], ukuran:["S","M","L","XL","XXL"], warna:["Hitam","Putih","Merah","Navy","Abu","Hijau Army","Coklat","Kuning","Orange","Pink"], gambar:"assets/Image/Jersey Produk.png", deskripsi:"Jersey custom dengan pilihan warna dan ukuran." },
            { id:"hoodie-custom", nama:"Hoodie Custom", kategori:"Hoodie", harga:120000, material:["Fleece","Baby Terry"], ukuran:["M","L","XL","XXL"], warna:["Hitam","Putih","Merah","Navy","Abu","Hijau Army","Coklat","Kuning","Orange","Pink"], gambar:"assets/Image/Hoodie Produk.png", deskripsi:"Hoodie custom Jidoor dengan bahan nyaman." },
            { id:"polo-custom", nama:"Polo Shirt", kategori:"Polo", harga:120000, material:["Lacoste CVC","Lacoste PE"], ukuran:["S","M","L","XL","XXL"], warna:["Hitam","Putih","Merah","Navy","Abu","Hijau Army","Coklat","Kuning","Orange","Pink"], gambar:"assets/Image/Polo Produk.png", deskripsi:"Polo shirt custom untuk tampilan formal dan elegan." },
            { id:"korsa-custom", nama:"Kaos Korsa", kategori:"Korsa", harga:80000, material:["American Drill","Ripstop"], ukuran:["S","M","L","XL","XXL"], warna:["Hitam","Putih","Merah","Navy","Abu","Hijau Army","Coklat","Kuning","Orange","Pink"], gambar:"assets/Image/Korsa Produk.png", deskripsi:"Kaos korsa untuk organisasi, kelas, dan kegiatan kampus." },
            { id:"rompi-custom", nama:"Rompi Custom", kategori:"Rompi", harga:110000, material:["Canvas Premium","Taslan","Drill"], ukuran:["M","L","XL","XXL"], warna:["Hitam","Putih","Merah","Navy","Abu","Hijau Army","Coklat","Kuning","Orange","Pink"], gambar:"assets/Image/Rompi Produk.png", deskripsi:"Rompi custom untuk kebutuhan outdoor dan kerja lapangan." }
        ];

        const catalogImages = {
            kaos:"../assets/Image/Kaos Produk.png",
            jersey:"../assets/Image/Jersey Produk.png",
            hoodie:"../assets/Image/Hoodie Produk.png",
            polo:"../assets/Image/Polo Produk.png",
            korsa:"../assets/Image/Korsa Produk.png",
            rompi:"../assets/Image/Rompi Produk.png"
        };

        const defaultPhotos = {
            kaos:["../assets/Image/Detail/kaos-front.jpg","../assets/Image/Detail/kaos-back.jpg","../assets/Image/Detail/kaos-detail.jpg","../assets/Image/Detail/kaos-material.jpg"],
            jersey:["../assets/Image/Detail/jersey-front.jpg","../assets/Image/Detail/jersey-back.jpg","../assets/Image/Detail/jersey-detail.jpg","../assets/Image/Detail/jersey-material.jpg"],
            hoodie:["../assets/Image/Detail/hoodie-front.jpg","../assets/Image/Detail/hoodie-back.jpg","../assets/Image/Detail/hoodie-detail.jpg","../assets/Image/Detail/hoodie-material.jpg"],
            polo:["../assets/Image/Detail/polo-front.jpg","../assets/Image/Detail/polo-back.jpg","../assets/Image/Detail/polo-detail.jpg","../assets/Image/Detail/polo-material.jpg"],
            korsa:["../assets/Image/Detail/korsa-front.jpg","../assets/Image/Detail/korsa-back.jpg","../assets/Image/Detail/korsa-detail.jpg","../assets/Image/Detail/korsa-material.jpg"],
            rompi:["../assets/Image/Detail/rompi-front.jpg","../assets/Image/Detail/rompi-back.jpg","../assets/Image/Detail/rompi-detail.jpg","../assets/Image/Detail/rompi-material.jpg"]
        };
        const categoryDefaults = ["Kaos","Jersey","Hoodie","Polo","Korsa","Rompi","Lainnya"];

        function clone(v) { return JSON.parse(JSON.stringify(v)); }
        function slug(v) { return String(v || "").toLowerCase().replace(/[^a-z0-9]+/g, ""); }
        function esc(v) { return jidoorAdmin.escapeHtml(v); }
        function categoryKey(p) {
            const s = slug(p && (p.kategori || p.id || p.nama));
            for (const key of Object.keys(catalogImages)) if (s.includes(key)) return key;
            return "kaos";
        }
        function canonicalImage(p) {
            const saved = p && p.photos && p.photos.main ? p.photos.main : (p && p.gambar ? p.gambar : "");
            if (saved) {
                if (/^(data:|blob:|https?:\/\/)/i.test(saved)) return saved;
                const normalized = String(saved).replace(/^\.\.\//, "");
                return normalized.startsWith("assets/") ? "../" + normalized : saved;
            }
            return catalogImages[categoryKey(p)];
        }

        function ensureProducts() {
            const stored = jidoorAdmin.getProducts();
            if (stored.length) return stored;
            const seeded = clone(baseProducts);
            jidoorAdmin.saveProducts(seeded);
            return seeded;
        }
        function categories() {
            return [...new Set([...categoryDefaults, ...products.map(p => p.kategori).filter(Boolean)])];
        }
        function renderCategoryOptions() {
            const cats = categories();
            const oldFilter = categoryFilter.value;
            categoryFilter.innerHTML = '<option value="all">Semua kategori</option>' + cats.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join("");
            if (cats.includes(oldFilter)) categoryFilter.value = oldFilter;
            const category = $("pCategory");
            const oldCategory = category.value;
            category.innerHTML = cats.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join("");
            if (cats.includes(oldCategory)) category.value = oldCategory;
        }

        function render() {
            products = ensureProducts();
            renderCategoryOptions();
            const q = search.value.trim().toLowerCase();
            const cat = categoryFilter.value;
            const filtered = products.filter(p => (!q || `${p.nama || ""} ${p.kategori || ""}`.toLowerCase().includes(q)) && (cat === "all" || p.kategori === cat));
            count.textContent = `${filtered.length} produk`;
            if (!filtered.length) {
                grid.innerHTML = '<div class="admin-card product-empty-card"><div class="empty-admin"><i class="bi bi-box-seam"></i><strong>Tidak ada produk</strong><span>Tambahkan produk atau ubah pencarian.</span></div></div>';
                return;
            }
            grid.innerHTML = filtered.map(p => {
                const idx = products.indexOf(p);
                const colors = Array.isArray(p.warna) ? p.warna : [];
                const materials = Array.isArray(p.material) ? p.material : [];
                return `<article class="product-admin-card">
                    <div class="product-admin-media">
                        <img class="product-admin-image" src="${esc(canonicalImage(p))}" alt="${esc(p.nama || "Produk")}" loading="lazy">
                        <span class="product-category-badge">${esc(p.kategori || "Lainnya")}</span>
                    </div>
                    <div class="product-admin-body">
                        <div class="product-admin-heading"><div><h3>${esc(p.nama || "Tanpa nama")}</h3><p>${esc(p.deskripsi || "Belum ada deskripsi produk.")}</p></div></div>
                        <div class="product-admin-meta">
                            <span><i class="bi bi-rulers"></i>${(p.ukuran || []).length} ukuran</span>
                            <span><i class="bi bi-palette"></i>${colors.length} warna</span>
                            <span><i class="bi bi-person-arms-up"></i>${(p.lengan || options.sleeves || []).length} lengan</span>
                            <span><i class="bi bi-layers"></i>${materials.length} bahan</span>
                            <span><i class="bi bi-images"></i>${photoCount(p)} foto</span>
                        </div>
                        <div class="product-admin-price">${jidoorAdmin.rupiah(p.harga)}</div>
                        <div class="product-admin-actions">
                            <button class="btn-admin btn-secondary" type="button" data-edit="${idx}"><i class="bi bi-pencil"></i>Edit</button>
                            <button class="btn-admin btn-danger" type="button" data-delete="${idx}"><i class="bi bi-trash3"></i>Hapus</button>
                        </div>
                    </div>
                </article>`;
            }).join("");
            grid.querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", () => open(Number(b.dataset.edit))));
            grid.querySelectorAll("[data-delete]").forEach(b => b.addEventListener("click", () => remove(Number(b.dataset.delete))));
        }
        function remove(index) {
            if (index < 0 || !products[index]) return;
            const name = products[index].nama || "produk";
            if (!window.confirm(`Hapus ${name}?`)) return;
            products.splice(index, 1);
            jidoorAdmin.saveProducts(products);
            jidoorAdmin.logActivity(`Produk dihapus: ${name}`);
            render();
        }
        function photoCount(p) {
            const photos = p.photos || {};
            return ["main","front","back","detail","material"].filter(k => photos[k] || (k === "main" && p.gambar)).length;
        }
        function checked(list, value) { return Array.isArray(list) && list.some(v => slug(v) === slug(value)); }
        function renderOptionChecks() {
            const category = $("pCategory").value || "Kaos";
            const mats = Array.isArray(options.materials[category]) ? options.materials[category] : [];
            $("materialOptions").innerHTML = mats.length ? mats.map(v => checkItem("material", v, checked(selected.material, v))).join("") : '<div class="option-empty">Belum ada material untuk kategori ini.</div>';
            $("sizeOptions").innerHTML = options.sizes.map(v => checkItem("size", v, checked(selected.size, v))).join("");
            $("colorOptions").innerHTML = options.colors.map(([name, hex]) => colorCheckItem(name, hex, checked(selected.color, name))).join("");
            $("sleeveOptions").innerHTML = options.sleeves.map(v => checkItem("sleeve", v, checked(selected.sleeve, v))).join("");
            bindChecks();
        }
        function checkItem(type, value, on) { return `<label class="option-check"><input type="checkbox" data-option-type="${type}" value="${esc(value)}" ${on ? "checked" : ""}><span>${esc(value)}</span></label>`; }
        function colorCheckItem(name, hex, on) { return `<label class="option-check color-option"><input type="checkbox" data-option-type="color" value="${esc(name)}" ${on ? "checked" : ""}><span class="swatch" style="background:${esc(hex)}"></span><span>${esc(name)}</span></label>`; }
        function syncSelected() {
            selected.material = [...document.querySelectorAll('[data-option-type="material"]:checked')].map(i => i.value);
            selected.size = [...document.querySelectorAll('[data-option-type="size"]:checked')].map(i => i.value);
            selected.color = [...document.querySelectorAll('[data-option-type="color"]:checked')].map(i => i.value);
            selected.sleeve = [...document.querySelectorAll('[data-option-type="sleeve"]:checked')].map(i => i.value);
        }
        function bindChecks() { document.querySelectorAll("[data-option-type]").forEach(i => i.addEventListener("change", syncSelected)); }

        function photoFields(p) {
            const cat = categoryKey(p);
            const defaults = defaultPhotos[cat] || [];
            const photos = p.photos || {};
            const slots = [
                ["main", "Foto Utama / Katalog", photos.main || p.gambar || catalogImages[cat] || ""],
                ["front", "Foto Depan", photos.front || defaults[0] || ""],
                ["back", "Foto Belakang", photos.back || defaults[1] || ""],
                ["detail", "Foto Detail", photos.detail || defaults[2] || ""],
                ["material", "Foto Bahan", photos.material || defaults[3] || ""]
            ];
            return slots.map(([key, label, value]) => `<div class="photo-control">
                <div class="photo-preview" data-preview-box="${key}">${value ? `<img src="${esc(value)}" alt="${esc(label)}" onerror="this.style.display='none';this.parentElement.classList.add('photo-preview-error')">` : '<i class="bi bi-image"></i><span>Belum ada foto</span>'}</div>
                <div class="photo-control-body">
                    <strong>${esc(label)}</strong>
                    <input type="text" data-photo-path="${key}" value="${esc(value)}" placeholder="Path atau URL gambar">
                    <div class="photo-control-actions">
                        <label class="btn-admin btn-secondary photo-upload-label"><i class="bi bi-upload"></i> Unggah<input type="file" accept="image/png,image/jpeg,image/webp" data-photo-file="${key}" hidden></label>
                        <button type="button" class="btn-admin btn-secondary photo-clear-button" data-photo-clear="${key}"><i class="bi bi-x-lg"></i> Kosongkan</button>
                    </div>
                </div>
            </div>`).join("");
        }
        function open(index) {
            editIndex = index;
            const p = index >= 0 ? products[index] : { kategori:"Kaos", harga:0, material:[], ukuran:[], warna:[], deskripsi:"" };
            $("productModalTitle").textContent = index < 0 ? "Tambah Produk" : "Edit Produk";
            $("pName").value = p.nama || "";
            $("pCategory").value = p.kategori || "Kaos";
            $("pPrice").value = p.harga || "";
            $("pDesc").value = p.deskripsi || "";
            selected = {
                material: clone(p.material || []),
                size: clone(p.ukuran || []),
                color: clone(p.warna || []),
                sleeve: clone(p.lengan || options.sleeves || [])
            };
            renderOptionChecks();
            $("photoFields").innerHTML = photoFields(p);
            bindPhotoInputs();
            modal.classList.add("is-open");
            modal.setAttribute("aria-hidden", "false");
        }
        function close() { modal.classList.remove("is-open"); modal.setAttribute("aria-hidden", "true"); }
        function bindPhotoInputs() {
            document.querySelectorAll("[data-photo-path]").forEach(input => input.addEventListener("input", () => updatePhotoPreview(input.dataset.photoPath, input.value)));
            document.querySelectorAll("[data-photo-file]").forEach(input => input.addEventListener("change", async () => {
                const file = input.files && input.files[0];
                if (!file) return;
                try {
                    const data = await compressImage(file);
                    const path = document.querySelector(`[data-photo-path="${input.dataset.photoFile}"]`);
                    if (path) { path.value = data; updatePhotoPreview(input.dataset.photoFile, data); }
                } catch (e) { alert(e.message || "Foto gagal diproses."); input.value = ""; }
            }));
            document.querySelectorAll("[data-photo-clear]").forEach(button => button.addEventListener("click", () => {
                const key = button.dataset.photoClear;
                const path = document.querySelector(`[data-photo-path="${key}"]`);
                const file = document.querySelector(`[data-photo-file="${key}"]`);
                if (path) path.value = "";
                if (file) file.value = "";
                updatePhotoPreview(key, "");
            }));
        }
        function compressImage(file) {
            return new Promise((resolve, reject) => {
                if (!file.type.startsWith("image/")) return reject(new Error("File harus berupa gambar."));
                const reader = new FileReader();
                reader.onerror = () => reject(new Error("File gagal dibaca."));
                reader.onload = () => {
                    const img = new Image();
                    img.onload = () => {
                        const max = 1400;
                        const scale = Math.min(1, max / Math.max(img.width, img.height));
                        const canvas = document.createElement("canvas");
                        canvas.width = Math.max(1, Math.round(img.width * scale));
                        canvas.height = Math.max(1, Math.round(img.height * scale));
                        const ctx = canvas.getContext("2d");
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        let quality = 0.82;
                        let data = canvas.toDataURL("image/jpeg", quality);
                        while (data.length > 650000 && quality > 0.45) { quality -= 0.07; data = canvas.toDataURL("image/jpeg", quality); }
                        if (data.length > 900000) return reject(new Error("Foto terlalu besar setelah kompresi. Gunakan foto yang lebih kecil."));
                        resolve(data);
                    };
                    img.onerror = () => reject(new Error("Foto tidak dapat diproses."));
                    img.src = reader.result;
                };
                reader.readAsDataURL(file);
            });
        }
        function updatePhotoPreview(key, src) {
            const box = document.querySelector(`[data-preview-box="${key}"]`);
            if (box) box.innerHTML = src ? `<img src="${esc(src)}" alt="Preview">` : '<i class="bi bi-image"></i><span>Belum ada foto</span>';
        }
        function addOption(type) {
            if (type === "material") {
                const name = $("newMaterial").value.trim(); const category = $("pCategory").value || "Kaos";
                if (!name) return;
                options.materials[category] ||= [];
                if (!options.materials[category].some(v => slug(v) === slug(name))) options.materials[category].push(name);
                $("newMaterial").value = "";
            } else if (type === "size") {
                const name = $("newSize").value.trim().toUpperCase(); if (!name) return;
                if (!options.sizes.some(v => slug(v) === slug(name))) options.sizes.push(name); $("newSize").value = "";
            } else {
                const name = $("newColorName").value.trim(); const hex = $("newColorHex").value.trim().toUpperCase();
                if (!name || !/^#[0-9A-F]{6}$/.test(hex)) { alert("Nama warna dan HEX harus valid."); return; }
                if (!options.colors.some(([n, h]) => slug(n) === slug(name) || h === hex)) options.colors.push([name, hex]);
                $("newColorName").value = ""; $("newColorHex").value = "";
            }
            jidoorAdmin.saveOptions(options); renderOptionChecks();
        }
        $("pCategory").addEventListener("change", () => {
            const available = options.materials[$("pCategory").value] || [];
            selected.material = selected.material.filter(v => available.some(m => slug(m) === slug(v)));
            renderOptionChecks();
        });

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            syncSelected();
            const existing = editIndex >= 0 ? products[editIndex] : {};
            const photoMap = {};
            document.querySelectorAll("[data-photo-path]").forEach(input => { photoMap[input.dataset.photoPath] = input.value.trim(); });
            const product = {
                ...existing,
                id: existing.id || `prod-${Date.now()}`,
                nama: $("pName").value.trim(),
                kategori: $("pCategory").value,
                harga: parseInt($("pPrice").value.replace(/[^0-9]/g, ""), 10) || 0,
                material: clone(selected.material), ukuran: clone(selected.size), warna: clone(selected.color), lengan: clone(selected.sleeve),
                gambar: photoMap.main || canonicalImage(existing),
                photos: { ...(existing.photos || {}), ...photoMap },
                deskripsi: $("pDesc").value.trim(), aktif: existing.aktif !== false
            };
            if (!product.nama) { alert("Nama produk wajib diisi."); return; }
            if (editIndex < 0) products.push(product); else products[editIndex] = product;
            if (!jidoorAdmin.saveProducts(products)) { alert("Produk gagal disimpan. Penyimpanan browser penuh atau tidak tersedia."); return; }
            jidoorAdmin.logActivity(`${editIndex < 0 ? "Produk ditambahkan: " : "Produk diedit: "}${product.nama}`);
            close(); render();
        });
        $("addProductButton").addEventListener("click", () => open(-1));
        $("closeProductButton").addEventListener("click", close);
        $("cancelProductButton").addEventListener("click", close);
        modal.addEventListener("click", e => { if (e.target === modal) close(); });
        search.addEventListener("input", render); categoryFilter.addEventListener("change", render);
        $("addMaterialButton").addEventListener("click", () => addOption("material"));
        $("addSizeButton").addEventListener("click", () => addOption("size"));
        $("addColorButton").addEventListener("click", () => addOption("color"));
        render();
    });
})();
