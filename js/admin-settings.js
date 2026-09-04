/* JIDOOR ADMIN - SETTINGS */
(function () {
    "use strict";
    document.addEventListener("DOMContentLoaded", function () {
        if (!window.jidoorAdmin) return;

        const $=id=>document.getElementById(id);
        const user=readUser();
        const defaults={
            nama:"Jidoor Konveksi",
            tagline:"Konveksi custom berkualitas",
            email:"",
            phone:"",
            address:"",
            minOrder:1,
            orderEstimate:"7–14 hari kerja",
            waTemplate:"Halo Jidoor, saya ingin melakukan pemesanan."
        };

        function load(){
            const s={...defaults,...jidoorAdmin.getSettings()};
            $("siteName").value=s.nama||"";
            $("siteTagline").value=s.tagline||"";
            $("siteEmail").value=s.email||"";
            $("sitePhone").value=s.phone||"";
            $("siteAddress").value=s.address||"";
            $("minOrder").value=s.minOrder||1;
            $("orderEstimate").value=s.orderEstimate||"";
            $("waTemplate").value=s.waTemplate||"";
            $("adminDisplayName").value=user.nama||"Admin";
            $("adminEmail").value=user.email||"";
        }

        $("settingsForm").addEventListener("submit",function(e){
            e.preventDefault();
            const s={...jidoorAdmin.getSettings(),
                nama:$("siteName").value.trim(),
                tagline:$("siteTagline").value.trim(),
                email:$("siteEmail").value.trim(),
                phone:$("sitePhone").value.trim(),
                address:$("siteAddress").value.trim(),
                minOrder:Math.max(1,Number($("minOrder").value)||1),
                orderEstimate:$("orderEstimate").value.trim(),
                waTemplate:$("waTemplate").value.trim()
            };
            jidoorAdmin.saveSettings(s);
            const name=$("adminDisplayName").value.trim();
            if(name.length<2){toast("Nama admin minimal 2 karakter.",true);return;}
            user.nama=name;
            localStorage.setItem("loginUser",JSON.stringify(user));
            document.querySelectorAll("[data-admin-name]").forEach(el=>el.textContent=name);
            jidoorAdmin.logActivity("Pengaturan website diperbarui");
            toast("Pengaturan berhasil disimpan.");
        });

        $("resetSettings").addEventListener("click",()=>{
            if(!confirm("Kembalikan pengaturan website ke default?"))return;
            jidoorAdmin.saveSettings({...defaults});
            load();toast("Pengaturan dikembalikan ke default.");
        });

        function readUser(){
            try{const u=JSON.parse(localStorage.getItem("loginUser")||"{}");return u&&typeof u==="object"?u:{};}catch(_){return {};}
        }
        function toast(message,error){
            let t=document.getElementById("settingsToast");
            if(!t){t=document.createElement("div");t.id="settingsToast";t.className="admin-toast";document.body.appendChild(t);}
            t.textContent=message;t.classList.toggle("is-error",!!error);t.classList.add("is-visible");
            clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove("is-visible"),2200);
        }
        load();
    });
})();
