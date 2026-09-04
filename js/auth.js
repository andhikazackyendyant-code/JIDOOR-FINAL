function login(email, password) {
    if (email === "admin@jidoor.com" && password === "admin123") {

        const user = {
            nama: "Admin",
            email: email,
            role: "admin"
        };

        localStorage.setItem("loginUser", JSON.stringify(user));

        window.location.href = "admin/dashboard.html";

        return true;
    }
    if (email === "user@gmail.com" && password === "12345678") {

        const user = {
            nama: "Andhika",
            email: email,
            role: "user"
        };

        localStorage.setItem("loginUser", JSON.stringify(user));

        window.location.href = "index.html";

        return true;
    }

    alert("Email atau Password salah!");

    return false;

}
function logout() {

    localStorage.removeItem("loginUser");

    window.location.replace("login.html");

}

function updateNavbar() {

    const authArea = document.getElementById("authArea");

    if (!authArea) return;

    const user = JSON.parse(
        localStorage.getItem("loginUser")
    );

    if (!user) {

        authArea.innerHTML = `
            <a href="login.html" class="btn-login">
                Masuk
            </a>
        `;

        return;
    }

    authArea.innerHTML = `
        <div class="user-dropdown">

            <button
                type="button"
                class="user-btn"
                id="userDropdownBtn">

                <i class="bi bi-person-circle"></i>

                <span>${user.nama}</span>

                <i
                    class="bi bi-chevron-down dropdown-arrow">
                </i>

            </button>

            <div
                class="dropdown-content"
                id="userDropdownMenu">

                <a href="profile.html">
                    <i class="bi bi-person"></i>
                    <span>Profil Saya</span>
                </a>

                <a href="riwayat.html">
                    <i class="bi bi-clock-history"></i>
                    <span>Riwayat Pesanan</span>
                </a>

                <button
                    type="button"
                    class="dropdown-logout"
                    onclick="logout()">

                    <i class="bi bi-box-arrow-right"></i>
                    <span>Logout</span>

                </button>

            </div>

        </div>
    `;
    const userBtn =
        document.getElementById("userDropdownBtn");

    const dropdown =
        document.getElementById("userDropdownMenu");

    if (!userBtn || !dropdown) return;

    userBtn.addEventListener("click", function (event) {

        event.stopPropagation();

        dropdown.classList.toggle("show");

        userBtn.classList.toggle("active");

    });
    document.addEventListener("click", function (event) {

        if (
            !event.target.closest(".user-dropdown")
        ) {

            dropdown.classList.remove("show");

            userBtn.classList.remove("active");

        }

    });

}

document.addEventListener("DOMContentLoaded",function(){

    updateNavbar();

    updateCartBadge();

    activeMenu();

});

function updateCartBadge(){

    const badge =
        document.getElementById("cartBadge");

    if(!badge) return;

    const cart =
        JSON.parse(
            localStorage.getItem("keranjang")
        ) || [];

    const totalItem =
        cart.length;

    if(totalItem > 0){

        badge.innerText =
            totalItem;

        badge.style.display =
            "inline-block";

    } else {

        badge.innerText =
            "";

        badge.style.display =
            "none";

    }

}

function activeMenu(){

    const current=window.location.pathname.split("/").pop();

    document.querySelectorAll(".nav-link").forEach(link=>{

        const href=link.getAttribute("href");

        if(href===current){

            link.classList.add("active");

        }

    });

}

const search=document.getElementById("searchNavbar");

if(search){

search.addEventListener("keyup",function(){

const keyword=this.value.toLowerCase();

document.querySelectorAll(".produk-card").forEach(card=>{

const nama=card.innerText.toLowerCase();

card.style.display=nama.includes(keyword)?"":"none";

});

});

}
