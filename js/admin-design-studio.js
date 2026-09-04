/* JIDOOR ADMIN - DESIGN STUDIO CONTROL */
(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        if (!window.jidoorAdmin) return;

        const $ = id => document.getElementById(id);
        const defaults = jidoorAdmin.getDefaultOptions();
        const productKeys = [
            ["kaos","Kaos Custom"],["jersey","Jersey Custom"],["hoodie","Hoodie Custom"],
            ["polo","Polo Shirt"],["korsa","Kaos Korsa"],["rompi","Rompi Custom"]
        ];
        const mockupDefaults = {
            kaos:"../assets/img/kaos-custom-front.png",
            jersey:"../assets/img/jersey-custom-front.png",
            hoodie:"../assets/img/hoodie-custom-front.png",
            polo:"../assets/img/polo-shirt-front.png",
            korsa:"../assets/img/kaos-korsa-front.png",
            rompi:"../assets/img/rompi-custom-front.png"
        };

        let options = jidoorAdmin.getOptions();
        let studio = jidoorAdmin.getStudio();

        function selected(name, value) {
            return Array.isArray(studio[name]) && studio[name].some(v => String(v).toLowerCase() === String(value).toLowerCase());
        }
        function esc(v){return jidoorAdmin.escapeHtml(v);}

        function renderChecks(){
            $("studioProducts").innerHTML = productKeys.map(([key,label]) =>
                `<label class="option-check"><input type="checkbox" data-product="${key}" ${selected("products",key)||!studio.products?"checked":""}><span>${esc(label)}</span></label>`
            ).join("");

            $("studioColors").innerHTML = options.colors.map(([name,hex]) =>
                `<label class="option-check color-option"><input type="checkbox" data-color="${esc(name)}" ${selected("colors",name)||!studio.colors?"checked":""}><span class="swatch" style="background:${esc(hex)}"></span><span>${esc(name)}</span></label>`
            ).join("");

            $("studioSizes").innerHTML = options.sizes.map(v =>
                `<label class="option-check"><input type="checkbox" data-size="${esc(v)}" ${selected("sizes",v)||!studio.sizes?"checked":""}><span>${esc(v)}</span></label>`
            ).join("");

            $("studioSleeves").innerHTML = options.sleeves.map(v =>
                `<label class="option-check"><input type="checkbox" data-sleeve="${esc(v)}" ${selected("sleeves",v)||!studio.sleeves?"checked":""}><span>${esc(v)}</span></label>`
            ).join("");

            $("studioDesignOptions").innerHTML = options.designOptions.map(v =>
                `<label class="option-check"><input type="checkbox" data-design-option="${esc(v)}" ${selected("designOptions",v)||!studio.designOptions?"checked":""}><span>${esc(v)}</span></label>`
            ).join("");
        }

        function renderMockups(){
            $("mockupGrid").innerHTML = productKeys.map(([key,label])=>{
                const src = studio.mockup?.[key] || mockupDefaults[key];
                return `<article class="media-control-card">
                    <div class="media-control-preview"><img src="${esc(src)}" alt="${esc(label)}"></div>
                    <h3>${esc(label)}</h3><p>Mockup yang dipakai editor user.</p>
                    <input type="text" data-mockup-path="${key}" value="${esc(src)}">
                    <label class="btn-admin btn-secondary"><i class="bi bi-upload"></i> Unggah<input type="file" accept="image/png,image/jpeg,image/webp" data-mockup-file="${key}" hidden></label>
                </article>`;
            }).join("");

            $("mockupGrid").querySelectorAll("[data-mockup-file]").forEach(input=>{
                input.addEventListener("change",async()=>{
                    const file=input.files?.[0];if(!file)return;
                    try{
                        const data=await jidoorAdmin.readFileAsDataUrl(file,2);
                        const path=$(`[data-mockup-path="${input.dataset.mockupFile}"]`);
                        path.value=data;
                        path.dispatchEvent(new Event("input"));
                        input.closest(".media-control-card").querySelector("img").src=data;
                    }catch(e){alert(e.message);}
                });
            });
        }

        $("studioForm").addEventListener("submit",function(e){
            e.preventDefault();
            studio = {
                ...studio,
                products:[...document.querySelectorAll("[data-product]:checked")].map(i=>i.dataset.product),
                colors:[...document.querySelectorAll("[data-color]:checked")].map(i=>i.dataset.color),
                sizes:[...document.querySelectorAll("[data-size]:checked")].map(i=>i.dataset.size),
                sleeves:[...document.querySelectorAll("[data-sleeve]:checked")].map(i=>i.dataset.sleeve),
                designOptions:[...document.querySelectorAll("[data-design-option]:checked")].map(i=>i.dataset.designOption),
                mockup:{...(studio.mockup||{})}
            };
            document.querySelectorAll("[data-mockup-path]").forEach(i=>studio.mockup[i.dataset.mockupPath]=i.value.trim());
            jidoorAdmin.saveOptions(options);
            jidoorAdmin.saveStudio(studio);
            jidoorAdmin.logActivity("Konfigurasi Design Studio diperbarui");
            toast("Design Studio berhasil disimpan.");
        });

        $("resetStudio").addEventListener("click",()=>{
            if(!confirm("Kembalikan konfigurasi Design Studio ke default?"))return;
            options=jidoorAdmin.getOptions();
            studio={mockup:{...mockupDefaults}};
            jidoorAdmin.saveStudio(studio);
            renderChecks();renderMockups();toast("Design Studio dikembalikan ke default.");
        });

        function toast(message,error){
            let t=document.getElementById("studioToast");
            if(!t){t=document.createElement("div");t.id="studioToast";t.className="admin-toast";document.body.appendChild(t);}
            t.textContent=message;t.classList.toggle("is-error",!!error);t.classList.add("is-visible");
            clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove("is-visible"),2200);
        }

        renderChecks();
        renderMockups();
    });
})();
