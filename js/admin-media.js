/* JIDOOR ADMIN - MEDIA & CONTENT */
(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        if (!window.jidoorAdmin) return;

        const $ = id => document.getElementById(id);
        const mediaGrid = $("mediaGrid");
        const form = $("contentForm");
        const mediaCount = $("mediaCount");

        const mediaDefaultList = [
            {key:"logo", title:"Logo Jidoor", description:"Logo utama navbar dan identitas.", src:"../assets/img/JIDOOR LOGO.png"},
            {key:"banner", title:"Hero Beranda", description:"Gambar utama area hero beranda.", src:"../assets/img/hero1.jpg"},
            {key:"navbar", title:"Background Navbar", description:"Background navbar website.", src:"../assets/img/navbar.jpg"},
            {key:"hero1", title:"Hero Pendukung", description:"Aset promosi/hero tambahan.", src:"../assets/img/hero1.jpg"},
            {key:"about", title:"Gambar Section", description:"Aset visual untuk section konten.", src:"../assets/img/1.jpg"},
            {key:"productPoster", title:"Poster Produk", description:"Aset poster atau promosi produk.", src:"../assets/Image/Jersey Produk.png"}
        ];

        const defaultContent = {
            nama:"Jidoor Konveksi",
            homeTitle:"Custom Apparel Berkualitas untuk Semua Kebutuhan",
            homeSubtitle:"Jidoor Konveksi menyediakan layanan pembuatan jersey, kaos, hoodie, dan apparel lainnya dengan desain custom dan kualitas premium.",
            productTitle:"Produk Kami",
            productSubtitle:"Pilih jenis apparel sesuai kebutuhan kamu",
            buttonOrder:"Pesan Sekarang",
            buttonDesign:"Buat Desain",
            whatsapp:"",
            email:"",
            address:"",
            instagram:"",
            tiktok:""
        };

        let media = jidoorAdmin.getMedia();
        let settings = jidoorAdmin.getSettings();

        function esc(v){return jidoorAdmin.escapeHtml(v);}
        function source(key){
            return media[key] || (mediaDefaultList.find(x=>x.key===key)?.src || "");
        }
        const mediaDefaultsCache = mediaDefaultList;

        function renderMedia(){
            mediaGrid.innerHTML = mediaDefaultList.map(item=>{
                const src = source(item.key);
                const custom = Boolean(media[item.key]);
                return `<article class="media-control-card">
                    <div class="media-control-preview">${src ? `<img src="${esc(src)}" alt="${esc(item.title)}">` : `<i class="bi bi-image"></i>`}</div>
                    <h3>${esc(item.title)}</h3><p>${esc(item.description)}</p>
                    <input type="text" data-media-path="${esc(item.key)}" value="${esc(src)}" placeholder="Path / URL gambar">
                    <div class="media-control-actions">
                        <label class="btn-admin btn-secondary"><i class="bi bi-upload"></i> Unggah<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" data-media-file="${esc(item.key)}" hidden></label>
                        ${custom ? `<button class="btn-admin btn-secondary" type="button" data-media-reset="${esc(item.key)}">Default</button>` : ""}
                    </div>
                </article>`;
            }).join("");
            mediaCount.textContent = `${mediaDefaultList.length} aset`;
            bindMedia();
        }

        function bindMedia(){
            mediaGrid.querySelectorAll("[data-media-path]").forEach(input=>{
                input.addEventListener("input",()=>{
                    media[input.dataset.mediaPath]=input.value.trim();
                    if(input.dataset.mediaPath==="logo") $("siteName").dispatchEvent(new Event("input"));
                });
            });
            mediaGrid.querySelectorAll("[data-media-file]").forEach(input=>{
                input.addEventListener("change",async()=>{
                    const file=input.files?.[0]; if(!file)return;
                    try{
                        media[input.dataset.mediaFile]=await jidoorAdmin.readFileAsDataUrl(file,2);
                        jidoorAdmin.saveMedia(media);
                        if(input.dataset.mediaFile==="logo"||input.dataset.mediaFile==="banner"||input.dataset.mediaFile==="navbar"){
                            settings[input.dataset.mediaFile]=media[input.dataset.mediaFile];
                            jidoorAdmin.saveSettings(settings);
                        }
                        renderMedia();
                        toast("Aset berhasil disimpan.");
                    }catch(e){toast(e.message,true);}
                });
            });
            mediaGrid.querySelectorAll("[data-media-reset]").forEach(btn=>{
                btn.addEventListener("click",()=>{
                    delete media[btn.dataset.mediaReset];
                    jidoorAdmin.saveMedia(media);
                    if(["logo","banner","navbar"].includes(btn.dataset.mediaReset)){
                        settings[btn.dataset.mediaReset]=mediaDefaultsCache.find(x=>x.key===btn.dataset.mediaReset)?.src||"";
                        jidoorAdmin.saveSettings(settings);
                    }
                    renderMedia();
                    loadContent();
                    toast("Aset dikembalikan ke default.");
                });
            });
        }

        function loadContent(){
            settings={...jidoorAdmin.getSettings()};
            const data={...defaultContent,...settings};
            Object.keys(defaultContent).forEach(k=>{if($(k))$(k).value=data[k]??"";});
        }

        function saveContent(){
            const data={...jidoorAdmin.getSettings()};
            Object.keys(defaultContent).forEach(k=>{if($(k))data[k]=$(k).value.trim();});
            data.logo=media.logo || data.logo || "../assets/img/JIDOOR LOGO.png";
            data.banner=media.banner || data.banner || "../assets/img/hero1.jpg";
            data.navbar=media.navbar || data.navbar || "../assets/img/navbar.jpg";
            jidoorAdmin.saveSettings(data);
            settings=data;
            jidoorAdmin.logActivity("Media & konten website diperbarui");
            toast("Semua konten berhasil disimpan.");
        }

        function toast(message,error){
            let t=$("mediaToast");
            if(!t){t=document.createElement("div");t.id="mediaToast";t.className="admin-toast";document.body.appendChild(t);}
            t.textContent=message;t.classList.toggle("is-error",!!error);t.classList.add("is-visible");
            clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove("is-visible"),2200);
        }

        form.addEventListener("submit",e=>{e.preventDefault();saveContent();});
        $("resetContent").addEventListener("click",()=>{
            if(!confirm("Kembalikan konten website ke default?"))return;
            settings={...defaultContent,logo:mediaDefaultsCache[0].src,banner:mediaDefaultsCache[1].src,navbar:mediaDefaultsCache[2].src};
            media={};
            jidoorAdmin.saveMedia(media);jidoorAdmin.saveSettings(settings);loadContent();renderMedia();toast("Konten dikembalikan ke default.");
        });

        loadContent();
        renderMedia();
    });
})();
