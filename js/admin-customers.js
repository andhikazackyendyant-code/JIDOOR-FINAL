/* =========================================================
   JIDOOR ADMIN - PELANGGAN
   Data pelanggan diturunkan dari riwayat pesanan yang ada.
   ========================================================= */

(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        if (!window.jidoorAdmin) {
            return;
        }

        const customersBody =
            document.getElementById("customersBody");

        const searchInput =
            document.getElementById("customerSearch");

        const customerModal =
            document.getElementById("customerModal");

        const customerDetail =
            document.getElementById("customerDetail");

        const closeButton =
            document.getElementById("closeCustomerButton");

        let searchTerm = "";

        renderCustomers();
        setupEvents();

        function setupEvents() {
            if (searchInput) {
                searchInput.addEventListener(
                    "input",
                    function () {
                        searchTerm =
                            searchInput.value.trim().toLowerCase();

                        renderCustomers();
                    }
                );
            }

            if (closeButton) {
                closeButton.addEventListener(
                    "click",
                    closeModal
                );
            }

            if (customerModal) {
                customerModal.addEventListener(
                    "click",
                    function (event) {
                        if (
                            event.target === customerModal
                        ) {
                            closeModal();
                        }
                    }
                );
            }

            document.addEventListener(
                "keydown",
                function (event) {
                    if (
                        event.key === "Escape" &&
                        customerModal &&
                        customerModal.classList.contains("is-open")
                    ) {
                        closeModal();
                    }
                }
            );
        }

        function buildCustomers() {
            const map = {};

            jidoorAdmin.getOrders().forEach(function (order) {
                const name =
                    order.nama ||
                    order.namaPemesan ||
                    "Pelanggan";

                const phone =
                    order.noHp ||
                    order.telepon ||
                    order.phone ||
                    "";

                const email =
                    order.email ||
                    "";

                const key =
                    String(phone).trim() ||
                    String(email).trim().toLowerCase() ||
                    String(name).trim().toLowerCase();

                if (!map[key]) {
                    map[key] = {
                        key: key,
                        nama: name,
                        phone: phone || "-",
                        email: email || "-",
                        alamat: order.alamat || "-",
                        count: 0,
                        total: 0,
                        orders: []
                    };
                }

                map[key].count += 1;
                map[key].total += parseMoney(order.total);
                map[key].orders.push(order);

                if (
                    map[key].alamat === "-" &&
                    order.alamat
                ) {
                    map[key].alamat = order.alamat;
                }
            });

            return Object.values(map).sort(function (a, b) {
                return b.total - a.total;
            });
        }

        function renderCustomers() {
            if (!customersBody) {
                return;
            }

            const customers = buildCustomers().filter(
                function (customer) {
                    if (!searchTerm) {
                        return true;
                    }

                    return [
                        customer.nama,
                        customer.phone,
                        customer.email
                    ]
                        .join(" ")
                        .toLowerCase()
                        .includes(searchTerm);
                }
            );

            if (!customers.length) {
                customersBody.innerHTML = `
                    <tr>
                        <td colspan="6">
                            <div class="empty-admin">
                                Tidak ada pelanggan yang sesuai.
                            </div>
                        </td>
                    </tr>
                `;
                return;
            }

            customersBody.innerHTML = customers
                .map(function (customer, index) {
                    return `
                        <tr>
                            <td>
                                <div class="customer-name-cell">
                                    <div class="customer-avatar">
                                        ${escapeHtml(
                                            getInitial(customer.nama)
                                        )}
                                    </div>

                                    <div>
                                        <strong>
                                            ${escapeHtml(customer.nama)}
                                        </strong>

                                        <span>
                                            ${escapeHtml(customer.email)}
                                        </span>
                                    </div>
                                </div>
                            </td>

                            <td>
                                ${escapeHtml(customer.phone)}
                            </td>

                            <td>
                                <span class="customer-count">
                                    ${customer.count}
                                </span>
                            </td>

                            <td>
                                <span class="money">
                                    ${jidoorAdmin.rupiah(
                                        customer.total
                                    )}
                                </span>
                            </td>

                            <td>
                                ${escapeHtml(
                                    customer.orders[0]?.tanggal ||
                                    customer.orders[0]?.createdAt ||
                                    "-"
                                )}
                            </td>

                            <td>
                                <button
                                    type="button"
                                    class="btn-admin btn-secondary customer-detail-btn"
                                    data-customer-key="${encodeURIComponent(
                                        customer.key
                                    )}"
                                >
                                    <i class="bi bi-eye"></i>
                                    Detail
                                </button>
                            </td>
                        </tr>
                    `;
                })
                .join("");

            customersBody
                .querySelectorAll(".customer-detail-btn")
                .forEach(function (button) {
                    button.addEventListener(
                        "click",
                        function () {
                            openCustomer(
                                decodeURIComponent(
                                    button.dataset.customerKey
                                )
                            );
                        }
                    );
                });
        }

        function openCustomer(key) {
            const customer = buildCustomers().find(
                function (item) {
                    return item.key === key;
                }
            );

            if (
                !customer ||
                !customerDetail ||
                !customerModal
            ) {
                return;
            }

            customerDetail.innerHTML = `
                <div class="customer-detail-grid">

                    <section class="customer-detail-section">
                        <div class="customer-profile">
                            <div class="customer-profile-avatar">
                                ${escapeHtml(
                                    getInitial(customer.nama)
                                )}
                            </div>

                            <div>
                                <h3>
                                    ${escapeHtml(customer.nama)}
                                </h3>

                                <p>
                                    Pelanggan Jidoor
                                </p>
                            </div>
                        </div>

                        <div class="detail-list">
                            ${detailItem(
                                "No. HP",
                                customer.phone
                            )}

                            ${detailItem(
                                "Email",
                                customer.email
                            )}

                            ${detailItem(
                                "Alamat",
                                customer.alamat
                            )}
                        </div>
                    </section>

                    <section class="customer-detail-section">
                        <div class="customer-summary">
                            <div>
                                <span>Total Pesanan</span>
                                <strong>
                                    ${customer.count}
                                </strong>
                            </div>

                            <div>
                                <span>Total Belanja</span>
                                <strong>
                                    ${jidoorAdmin.rupiah(
                                        customer.total
                                    )}
                                </strong>
                            </div>
                        </div>
                    </section>

                    <section class="customer-detail-section customer-detail-full">
                        <h3>
                            <i class="bi bi-clock-history"></i>
                            Riwayat Pesanan
                        </h3>

                        <div class="customer-order-list">
                            ${
                                customer.orders
                                    .slice()
                                    .reverse()
                                    .map(renderCustomerOrder)
                                    .join("")
                            }
                        </div>
                    </section>

                </div>
            `;

            customerModal.classList.add("is-open");
            customerModal.setAttribute(
                "aria-hidden",
                "false"
            );
        }

        function renderCustomerOrder(order) {
            const status =
                order.statusPesanan ||
                order.status ||
                "Menunggu Pembayaran";

            return `
                <div class="customer-order-row">
                    <div>
                        <strong>
                            #${escapeHtml(order.id || "-")}
                        </strong>

                        <span>
                            ${escapeHtml(
                                order.tanggal ||
                                order.createdAt ||
                                "-"
                            )}
                        </span>
                    </div>

                    <div>
                        <span class="badge ${jidoorAdmin.statusClass(status)}">
                            ${escapeHtml(status)}
                        </span>

                        <strong>
                            ${jidoorAdmin.rupiah(order.total)}
                        </strong>
                    </div>
                </div>
            `;
        }

        function closeModal() {
            if (!customerModal) {
                return;
            }

            customerModal.classList.remove("is-open");
            customerModal.setAttribute(
                "aria-hidden",
                "true"
            );
        }

        function detailItem(label, value) {
            return `
                <div class="detail-item">
                    <span>
                        ${escapeHtml(label)}
                    </span>

                    <strong>
                        ${escapeHtml(value)}
                    </strong>
                </div>
            `;
        }

        function parseMoney(value) {
            return parseInt(
                String(value ?? 0).replace(
                    /[^0-9]/g,
                    ""
                ),
                10
            ) || 0;
        }

        function getInitial(name) {
            const value =
                String(name || "P")
                    .trim()
                    .split(/\s+/);

            return (
                value.length > 1
                    ? value[0][0] + value[1][0]
                    : value[0]?.[0] || "P"
            ).toUpperCase();
        }

        function escapeHtml(value) {
            return String(value ?? "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }
    });
})();
