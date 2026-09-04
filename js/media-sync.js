/* =========================================================
   JIDOOR USER - MEDIA SYNC
   Membaca identitas dan aset visual dari jidoorSiteSettings.
   ========================================================= */

(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", syncSiteMedia);

    function getSettings() {
        try {
            const settings = JSON.parse(
                localStorage.getItem("jidoorSiteSettings") || "{}"
            );

            return settings && typeof settings === "object"
                ? settings
                : {};
        } catch (error) {
            return {};
        }
    }

    function normalizePath(path) {
        if (!path) return "";

        const value = String(path).trim();

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

    function setImageSources(selectors, source) {
        if (!source) return;

        document.querySelectorAll(selectors).forEach(function (image) {
            image.src = source;
        });
    }

    function syncSiteMedia() {
        const settings = getSettings();

        const logo = normalizePath(settings.logo);
        const banner = normalizePath(settings.banner);
        const navbar = normalizePath(settings.navbar);

        setImageSources(
            ".navbar .logo img, .logo img",
            logo
        );

        setImageSources(
            "[data-site-banner], .hero-right img, .hero img",
            banner
        );

        if (navbar) {
            document.querySelectorAll(".navbar").forEach(function (element) {
                element.style.backgroundImage =
                    'url("' +
                    navbar.replace(/"/g, '\\"') +
                    '")';
            });
        }

        if (settings.nama) {
            document.title = document.title.replace(
                /Jidoor Konveksi/gi,
                String(settings.nama)
            );
        }
    }

    window.jidoorMediaSync = {
        refresh: syncSiteMedia
    };
})();
