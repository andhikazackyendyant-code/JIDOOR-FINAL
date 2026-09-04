(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        if (!window.jidoorAdmin) return;

        const $ = (id) => document.getElementById(id);
        const form = $("carouselForm");
        const slidesBox = $("carouselSlides");
        if (!form || !slidesBox) return;

        let settings = jidoorAdmin.getCarousel();

        function esc(v) { return jidoorAdmin.escapeHtml(v); }

        function adminPath(value) {
            const src = String(value || "").trim();
            if (!src) return "";
            if (/^(data:|blob:|https?:\/\/)/i.test(src)) return src;
            const normalized = src.replace(/^(\.\.\/)+/, "").replace(/^\/+/, "");
            return normalized.startsWith("assets/") ? "../" + normalized : src;
        }

        function render() {
            $("carouselAutoplay").value = String(settings.autoplay !== false);
            $("carouselInterval").value = Math.max(1500, Number(settings.interval) || 4500);
            $("carouselLoop").value = String(settings.loop !== false);
            $("carouselDots").value = String(settings.showDots !== false);

            slidesBox.innerHTML = settings.slides.map((slide, index) => {
                const src = slide.image || "";
                return `<article class="media-control-card carousel-admin-card">
                    <div class="carousel-slide-head">
                        <strong>Slide ${index + 1}</strong>
                        <label class="carousel-active">
                            <input type="checkbox" data-slide-active="${index}" ${slide.active !== false ? "checked" : ""}>
                            Aktif
                        </label>
                    </div>
                    <div class="media-control-preview"><img data-slide-preview="${index}" src="${esc(adminPath(src))}" alt="${esc(slide.title || "Slide carousel")}" onerror="this.style.opacity='.25'"></div>
                    <h3>${esc(slide.title || `Slide ${index + 1}`)}</h3>
                    <p>Foto khusus carousel, terpisah dari foto katalog produk.</p>
                    <input type="text" data-slide-image="${index}" value="${esc(src)}" placeholder="Path / URL gambar">
                    <input type="text" data-slide-href="${index}" value="${esc(slide.href || "")}" placeholder="Tautan, contoh detail-produk.html?produk=jersey">
                    <div class="media-control-actions">
                        <label class="btn-admin btn-secondary">
                            <i class="bi bi-upload"></i> Unggah
                            <input type="file" accept="image/png,image/jpeg,image/webp" data-slide-file="${index}" hidden>
                        </label>
                        <button class="btn-admin btn-secondary" type="button" data-slide-reset="${index}">Default Foto</button>
                    </div>
                </article>`;
            }).join("");

            bind();
        }

        function bind() {
            slidesBox.querySelectorAll("[data-slide-image]").forEach(input => {
                input.addEventListener("input", () => {
                    const index = Number(input.dataset.slideImage);
                    settings.slides[index].image = input.value.trim();
                    const preview = $(`carouselSlides`).querySelector(`[data-slide-preview="${index}"]`);
                    if (preview) {
                        preview.src = adminPath(input.value.trim());
                        preview.style.opacity = "1";
                    }
                });
            });

            slidesBox.querySelectorAll("[data-slide-href]").forEach(input => {
                input.addEventListener("input", () => {
                    settings.slides[Number(input.dataset.slideHref)].href = input.value.trim();
                });
            });

            slidesBox.querySelectorAll("[data-slide-active]").forEach(input => {
                input.addEventListener("change", () => {
                    settings.slides[Number(input.dataset.slideActive)].active = input.checked;
                });
            });

            slidesBox.querySelectorAll("[data-slide-file]").forEach(input => {
                input.addEventListener("change", async () => {
                    const file = input.files && input.files[0];
                    if (!file) return;
                    try {
                        const data = await compressCarouselImage(file);
                        const index = Number(input.dataset.slideFile);
                        settings.slides[index].image = data;
                        const path = slidesBox.querySelector(`[data-slide-image="${index}"]`);
                        const preview = slidesBox.querySelector(`[data-slide-preview="${index}"]`);
                        if (path) path.value = data;
                        if (preview) {
                            preview.src = data;
                            preview.style.opacity = "1";
                        }
                    } catch (error) {
                        alert(error.message || "Foto carousel gagal diproses.");
                    } finally {
                        input.value = "";
                    }
                });
            });

            slidesBox.querySelectorAll("[data-slide-reset]").forEach(button => {
                button.addEventListener("click", () => {
                    const index = Number(button.dataset.slideReset);
                    const defaults = jidoorAdmin.getCarousel().slides[index];
                    if (!defaults) return;
                    settings.slides[index].image = defaults.image;
                    const path = slidesBox.querySelector(`[data-slide-image="${index}"]`);
                    const preview = slidesBox.querySelector(`[data-slide-preview="${index}"]`);
                    if (path) path.value = defaults.image;
                    if (preview) {
                        preview.src = adminPath(defaults.image);
                        preview.style.opacity = "1";
                    }
                });
            });
        }

        function compressCarouselImage(file) {
            return new Promise((resolve, reject) => {
                if (!file.type.startsWith("image/")) return reject(new Error("File harus berupa gambar."));
                const reader = new FileReader();
                reader.onerror = () => reject(new Error("File gagal dibaca."));
                reader.onload = () => {
                    const img = new Image();
                    img.onerror = () => reject(new Error("Foto tidak dapat diproses."));
                    img.onload = () => {
                        const max = 1400;
                        const scale = Math.min(1, max / Math.max(img.width, img.height));
                        const canvas = document.createElement("canvas");
                        canvas.width = Math.max(1, Math.round(img.width * scale));
                        canvas.height = Math.max(1, Math.round(img.height * scale));
                        const ctx = canvas.getContext("2d");
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                        let quality = 0.78;
                        let data = canvas.toDataURL("image/jpeg", quality);
                        while (data.length > 520000 && quality > 0.42) {
                            quality -= 0.06;
                            data = canvas.toDataURL("image/jpeg", quality);
                        }
                        if (data.length > 650000) {
                            return reject(new Error("Foto terlalu besar setelah kompresi. Gunakan foto yang lebih kecil."));
                        }
                        resolve(data);
                    };
                    img.src = reader.result;
                };
                reader.readAsDataURL(file);
            });
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();

            settings.autoplay = $("carouselAutoplay").value === "true";
            settings.interval = Math.max(1500, Number($("carouselInterval").value) || 4500);
            settings.loop = $("carouselLoop").value === "true";
            settings.showDots = $("carouselDots").value === "true";

            if (!jidoorAdmin.saveCarousel(settings)) {
                toast("Pengaturan carousel gagal disimpan.", true);
                return;
            }

            jidoorAdmin.logActivity("Pengaturan carousel beranda diperbarui");
            toast("Carousel berhasil disimpan.");
        });

        $("resetCarousel").addEventListener("click", function () {
            if (!confirm("Kembalikan carousel ke susunan default?")) return;
            settings = jidoorAdmin.getCarousel();
            localStorage.removeItem(jidoorAdmin.STORAGE.carousel);
            settings = jidoorAdmin.getCarousel();
            render();
            jidoorAdmin.saveCarousel(settings);
            jidoorAdmin.logActivity("Carousel beranda dikembalikan ke default");
            toast("Carousel dikembalikan ke default.");
        });

        function toast(message, error) {
            let t = $("carouselToast");
            if (!t) {
                t = document.createElement("div");
                t.id = "carouselToast";
                t.className = "admin-toast";
                document.body.appendChild(t);
            }
            t.textContent = message;
            t.classList.toggle("is-error", !!error);
            t.classList.add("is-visible");
            clearTimeout(toast.timer);
            toast.timer = setTimeout(() => t.classList.remove("is-visible"), 2200);
        }

        render();
    });
})();
