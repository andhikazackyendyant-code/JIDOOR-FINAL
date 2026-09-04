/* =========================================================
   JIDOOR ADMIN - DASHBOARD
   Logic khusus halaman admin/dashboard.html.
   ========================================================= */

(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        if (!window.jidoorAdmin) {
            return;
        }

        renderDashboard();
    });

    function renderDashboard() {
        const orders = jidoorAdmin.getOrders();

        const totalOrders = getElement("totalOrders");
        const newOrders = getElement("newOrders");
        const processingOrders = getElement("processingOrders");
        const completedOrders = getElement("completedOrders");
        const recentOrders = getElement("recentOrders");

        const getStatus = function (order) {
            return (
                order.statusPesanan ||
                order.status ||
                "Menunggu"
            );
        };

        if (totalOrders) {
            totalOrders.textContent = orders.length;
        }

        if (newOrders) {
            newOrders.textContent = orders.filter(function (order) {
                return /menunggu|belum/i.test(
                    getStatus(order)
                );
            }).length;
        }

        if (processingOrders) {
            processingOrders.textContent = orders.filter(function (order) {
                return /proses|dikerjakan/i.test(
                    getStatus(order)
                );
            }).length;
        }

        if (completedOrders) {
            completedOrders.textContent = orders.filter(function (order) {
                return /selesai|berhasil/i.test(
                    getStatus(order)
                );
            }).length;
        }

        renderRecentOrders(
            recentOrders,
            orders
        );

        const productCount = document.getElementById("dashboardProductCount");
        const mediaStatus = document.getElementById("dashboardMediaStatus");
        const activityList = document.getElementById("adminActivityList");

        if (productCount) {
            productCount.textContent = `${jidoorAdmin.getProducts().length} produk`;
        }
        if (mediaStatus) {
            const media = jidoorAdmin.getMedia();
            mediaStatus.textContent = `${Object.keys(media).length} aset kustom`;
        }
        if (activityList) {
            const activities = jidoorAdmin.getActivities();
            activityList.innerHTML = activities.length
                ? activities.slice(0, 6).map(function (item) {
                    const date = new Date(item.at);
                    const stamp = isNaN(date.getTime())
                        ? "-"
                        : date.toLocaleString("id-ID", {dateStyle:"short", timeStyle:"short"});
                    return `<div class="activity-row-admin"><strong>${escapeHtml(item.message)}</strong><span>${escapeHtml(stamp)}</span></div>`;
                }).join("")
                : `<div class="empty-admin">Belum ada aktivitas admin.</div>`;
        }
    }

    function renderRecentOrders(element, orders) {
        if (!element) {
            return;
        }

        if (!orders.length) {
            element.innerHTML = `
                <tr>
                    <td colspan="5">
                        <div class="empty-admin">
                            Belum ada pesanan.
                        </div>
                    </td>
                </tr>
            `;

            return;
        }

        element.innerHTML = orders
            .slice(0, 6)
            .map(function (order) {
                const status =
                    order.statusPesanan ||
                    order.status ||
                    "Menunggu";

                const customer =
                    order.nama ||
                    order.namaPemesan ||
                    "-";

                return `
                    <tr>
                        <td>
                            <span class="order-id">
                                #${escapeHtml(order.id || "-")}
                            </span>
                        </td>

                        <td>
                            ${escapeHtml(customer)}
                        </td>

                        <td>
                            ${escapeHtml(
                                jidoorAdmin.productName(order)
                            )}
                        </td>

                        <td>
                            <span class="money">
                                ${jidoorAdmin.rupiah(order.total)}
                            </span>
                        </td>

                        <td>
                            <span class="badge ${jidoorAdmin.statusClass(status)}">
                                ${escapeHtml(status)}
                            </span>
                        </td>
                    </tr>
                `;
            })
            .join("");
    }

    function getElement(id) {
        return document.getElementById(id);
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
})();
