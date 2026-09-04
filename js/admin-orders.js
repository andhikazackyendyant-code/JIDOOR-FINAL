/* =========================================================
   JIDOOR ADMIN - PESANAN
   Logic khusus halaman admin/pesanan.html.
   ========================================================= */

(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        if (!window.jidoorAdmin) {
            return;
        }

        const ordersBody =
            document.getElementById("ordersBody");

        const orderModal =
            document.getElementById("orderModal");

        const orderDetail =
            document.getElementById("orderDetail");

        const closeOrderButton =
            document.getElementById("closeOrderButton");

        let currentFilter = "Semua";

        setupFilters();
        setupModal();
        renderOrders();

        function getOrders() {
            return jidoorAdmin.getOrders();
        }

        function getStatus(order) {
            return (
                order.statusPesanan ||
                order.status ||
                "Menunggu Pembayaran"
            );
        }

        function getPaymentStatus(order) {
            return (
                order.statusPembayaran ||
                "Belum Dibayar"
            );
        }

        function paymentStatusClass(status) {
            const value =
                String(status || "").toLowerCase();

            if (
                value.includes("terverifikasi") ||
                value.includes("berhasil")
            ) {
                return "badge-success";
            }

            if (
                value.includes("menunggu")
            ) {
                return "badge-pending";
            }

            if (
                value.includes("ditolak") ||
                value.includes("belum")
            ) {
                return "badge-cancel";
            }

            return "badge-process";
        }

        function setupFilters() {
            document
                .querySelectorAll(".filter-btn")
                .forEach(function (button) {
                    button.addEventListener(
                        "click",
                        function () {
                            document
                                .querySelectorAll(".filter-btn")
                                .forEach(function (item) {
                                    item.classList.remove("active");
                                });

                            button.classList.add("active");
                            currentFilter =
                                button.dataset.filter;

                            renderOrders();
                        }
                    );
                });
        }

        function renderOrders() {
            if (!ordersBody) {
                return;
            }

            const orders = getOrders().filter(function (order) {
                return (
                    currentFilter === "Semua" ||
                    getStatus(order) === currentFilter
                );
            });

            if (!orders.length) {
                ordersBody.innerHTML = `
                    <tr>
                        <td colspan="6">
                            <div class="empty-admin">
                                Belum ada pesanan pada status ini.
                            </div>
                        </td>
                    </tr>
                `;

                return;
            }

            ordersBody.innerHTML = orders
                .map(function (order) {
                    const status = getStatus(order);

                    return `
                        <tr>
                            <td>
                                <span class="order-id">
                                    #${escapeHtml(order.id || "-")}
                                </span>
                            </td>

                            <td>
                                ${escapeHtml(
                                    order.nama ||
                                    order.namaPemesan ||
                                    "-"
                                )}
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

                            <td>
                                <span class="badge ${paymentStatusClass(
                                    getPaymentStatus(order)
                                )}">
                                    ${escapeHtml(
                                        getPaymentStatus(order)
                                    )}
                                </span>
                            </td>

                            <td>
                                <button
                                    class="btn-admin btn-secondary order-detail-btn"
                                    type="button"
                                    data-order-id="${escapeHtml(order.id || "")}"
                                >
                                    <i class="bi bi-eye"></i>
                                    Detail
                                </button>
                            </td>
                        </tr>
                    `;
                })
                .join("");

            ordersBody
                .querySelectorAll(".order-detail-btn")
                .forEach(function (button) {
                    button.addEventListener(
                        "click",
                        function () {
                            openOrder(
                                button.dataset.orderId
                            );
                        }
                    );
                });
        }

        function openOrder(id) {
            const order = getOrders().find(function (item) {
                return String(item.id) === String(id);
            });

            if (!order || !orderDetail || !orderModal) {
                return;
            }

            const items = normalizeItems(order);

            orderDetail.innerHTML = `
                <div class="order-detail-grid">

                    <div class="order-detail-section">
                        <h3>
                            <i class="bi bi-person"></i>
                            Informasi Pelanggan
                        </h3>

                        <div class="detail-list">
                            ${detailItem(
                                "Nama",
                                order.nama ||
                                order.namaPemesan ||
                                "-"
                            )}

                            ${detailItem(
                                "No. HP",
                                order.noHp ||
                                order.telepon ||
                                order.phone ||
                                "-"
                            )}

                            ${detailItem(
                                "Alamat",
                                order.alamat || "-"
                            )}
                        </div>
                    </div>

                    <div class="order-detail-section">
                        <h3>
                            <i class="bi bi-receipt"></i>
                            Informasi Pesanan
                        </h3>

                        <div class="detail-list">
                            ${detailItem(
                                "No. Pesanan",
                                "#" + (order.id || "-")
                            )}

                            ${detailItem(
                                "Tanggal",
                                order.tanggal ||
                                order.createdAt ||
                                "-"
                            )}

                            ${detailItem(
                                "Total",
                                jidoorAdmin.rupiah(order.total)
                            )}

                            ${detailItem(
                                "Pembayaran",
                                order.statusPembayaran || "-"
                            )}
                        </div>
                    </div>

                    <div class="order-detail-section order-detail-full">
                        <h3>
                            <i class="bi bi-credit-card"></i>
                            Verifikasi Pembayaran
                        </h3>

                        <div class="payment-admin-detail">
                            <div class="detail-list">
                                ${detailItem(
                                    "Metode Pembayaran",
                                    order.metodePembayaran || "-"
                                )}

                                ${detailItem(
                                    "E-Wallet",
                                    order.jenisEwallet || "-"
                                )}

                                ${detailItem(
                                    "Status Pembayaran",
                                    getPaymentStatus(order)
                                )}
                            </div>

                            ${
                                order.buktiPembayaran &&
                                order.buktiPembayaran.data
                                    ? `
                                        <div class="payment-proof-preview">
                                            <p>Bukti Pembayaran</p>

                                            <a
                                                href="${order.buktiPembayaran.data}"
                                                target="_blank"
                                                rel="noopener"
                                            >
                                                <img
                                                    src="${order.buktiPembayaran.data}"
                                                    alt="Bukti pembayaran"
                                                >
                                            </a>

                                            <small>
                                                ${escapeHtml(
                                                    order.buktiPembayaran.nama ||
                                                    "Bukti pembayaran"
                                                )}
                                            </small>
                                        </div>
                                    `
                                    : `
                                        <div class="detail-empty">
                                            Bukti pembayaran belum tersedia.
                                        </div>
                                    `
                            }

                            ${
                                getPaymentStatus(order) ===
                                "Menunggu Verifikasi"
                                    ? `
                                        <div class="payment-verification-actions">
                                            <button
                                                class="btn-admin btn-primary"
                                                type="button"
                                                id="verifyPayment"
                                            >
                                                <i class="bi bi-check2-circle"></i>
                                                Verifikasi Pembayaran
                                            </button>

                                            <button
                                                class="btn-admin btn-danger"
                                                type="button"
                                                id="rejectPayment"
                                            >
                                                <i class="bi bi-x-circle"></i>
                                                Tolak Pembayaran
                                            </button>
                                        </div>
                                    `
                                    : ""
                            }
                        </div>
                    </div>

                    ${
                        renderDesignSection(items)
                    }

                    <div class="order-detail-section order-detail-full">
                        <h3>
                            <i class="bi bi-box-seam"></i>
                            Detail Produk
                        </h3>

                        <div class="order-items">
                            ${items.length
                                ? items.map(renderItem).join("")
                                : `
                                    <div class="detail-empty">
                                        Detail produk tidak tersedia.
                                    </div>
                                `
                            }
                        </div>
                    </div>

                    <div class="order-detail-section order-detail-full">
                        <h3>
                            <i class="bi bi-arrow-repeat"></i>
                            Perbarui Status
                        </h3>

                        <div class="status-update">
                            <div class="form-group">
                                <label for="statusEdit">
                                    Status Pesanan
                                </label>

                                <select id="statusEdit">
                                    ${statusOptions(
                                        getStatus(order)
                                    )}
                                </select>
                            </div>

                            <button
                                class="btn-admin btn-primary"
                                type="button"
                                id="saveOrderStatus"
                            >
                                <i class="bi bi-check2"></i>
                                Simpan Status
                            </button>
                        </div>
                    </div>

                </div>
            `;

            const saveButton =
                document.getElementById(
                    "saveOrderStatus"
                );

            if (saveButton) {
                saveButton.addEventListener(
                    "click",
                    function () {
                        saveOrderStatus(id);
                    }
                );
            }

            const verifyPaymentButton =
                document.getElementById(
                    "verifyPayment"
                );

            const rejectPaymentButton =
                document.getElementById(
                    "rejectPayment"
                );

            if (verifyPaymentButton) {
                verifyPaymentButton.addEventListener(
                    "click",
                    function () {
                        updatePaymentStatus(
                            id,
                            "Pembayaran Terverifikasi"
                        );
                    }
                );
            }

            if (rejectPaymentButton) {
                rejectPaymentButton.addEventListener(
                    "click",
                    function () {
                        updatePaymentStatus(
                            id,
                            "Pembayaran Ditolak"
                        );
                    }
                );
            }

            orderModal.classList.add("is-open");
            orderModal.setAttribute(
                "aria-hidden",
                "false"
            );
        }

        function updatePaymentStatus(id, newPaymentStatus) {

            const orders = getOrders();

            const index =
                orders.findIndex(function (order) {
                    return String(order.id) === String(id);
                });

            if (index < 0) {
                return;
            }

            orders[index].statusPembayaran =
                newPaymentStatus;

            if (
                newPaymentStatus ===
                "Pembayaran Terverifikasi"
            ) {
                orders[index].statusPesanan =
                    "Diproses";
            }

            if (
                newPaymentStatus ===
                "Pembayaran Ditolak"
            ) {
                orders[index].statusPesanan =
                    "Menunggu Pembayaran";
            }

            jidoorAdmin.saveOrders(orders);

            syncLatestOrder(orders[index]);

            openOrder(id);
            renderOrders();
        }

        function saveOrderStatus(id) {
            const statusSelect =
                document.getElementById("statusEdit");

            if (!statusSelect) {
                return;
            }

            const orders = getOrders();

            const index = orders.findIndex(function (order) {
                return String(order.id) === String(id);
            });

            if (index < 0) {
                return;
            }

            const newStatus =
                statusSelect.value;

            orders[index].statusPesanan =
                newStatus;

            jidoorAdmin.saveOrders(orders);

            syncLatestOrder(
                orders[index]
            );

            closeOrder();
            renderOrders();
        }

        function syncLatestOrder(order) {
            try {
                const latest = JSON.parse(
                    localStorage.getItem(
                        "pesananTerakhir"
                    ) || "null"
                );

                if (
                    latest &&
                    String(latest.id) === String(order.id)
                ) {
                    latest.statusPesanan =
                        order.statusPesanan;

                    latest.statusPembayaran =
                        order.statusPembayaran;

                    localStorage.setItem(
                        "pesananTerakhir",
                        JSON.stringify(latest)
                    );
                }
            } catch (error) {
                console.warn(
                    "Data pesanan terakhir tidak dapat diperbarui.",
                    error
                );
            }
        }

        function setupModal() {
            if (closeOrderButton) {
                closeOrderButton.addEventListener(
                    "click",
                    closeOrder
                );
            }

            if (orderModal) {
                orderModal.addEventListener(
                    "click",
                    function (event) {
                        if (
                            event.target === orderModal
                        ) {
                            closeOrder();
                        }
                    }
                );
            }

            document.addEventListener(
                "keydown",
                function (event) {
                    if (
                        event.key === "Escape" &&
                        orderModal &&
                        orderModal.classList.contains(
                            "is-open"
                        )
                    ) {
                        closeOrder();
                    }
                }
            );
        }

        function closeOrder() {
            if (!orderModal) {
                return;
            }

            orderModal.classList.remove("is-open");
            orderModal.setAttribute(
                "aria-hidden",
                "true"
            );
        }

        function renderDesignSection(items) {
            const designItems = items.filter(function (item) {
                return item && (
                    (item.isCustom && item.desain) ||
                    item.checkoutDesign
                );
            });

            if (!designItems.length) {
                return "";
            }

            return `
                <div class="order-detail-section order-detail-full">
                    <h3>
                        <i class="bi bi-palette"></i>
                        Desain Pesanan
                    </h3>

                    <div class="admin-design-list">
                        ${designItems.map(renderDesign).join("")}
                    </div>
                </div>
            `;
        }

        function renderDesign(item) {
            const design = item.desain || {};
            const checkoutDesign = item.checkoutDesign || null;
            const elements = Array.isArray(design.elements)
                ? design.elements
                : [];

            const hasStudioDesign =
                Boolean(item.isCustom && item.desain);

            const uploadData =
                checkoutDesign && checkoutDesign.data
                    ? checkoutDesign.data
                    : null;

            const productImage =
                design.mockupImage ||
                item.gambar ||
                item.image ||
                "";

            const maskImage =
                design.maskImage ||
                "";

            const colorName =
                design.colorName ||
                item.warna ||
                "-";

            const colorHex =
                design.colorHex ||
                "";

            const imageElements = elements.filter(function (element) {
                return element && element.type === "image" && element.src;
            });

            const textElements = elements.filter(function (element) {
                return element && element.type === "text" && element.content;
            });

            if (uploadData && !hasStudioDesign) {
                imageElements.push({
                    type: "image",
                    src: uploadData,
                    checkoutUpload: true
                });
            }

            const previewElements = elements.map(function (element) {
                if (!element) return "";

                const x = Number(element.x) || 50;
                const y = Number(element.y) || 50;
                const size = Number(element.size) || 24;

                if (element.type === "image" && element.src) {
                    return `
                        <img
                            class="admin-design-element"
                            src="${escapeHtml(element.src)}"
                            alt="Elemen gambar desain"
                            style="
                                left:${x}%;
                                top:${y}%;
                                width:${size}%;
                            "
                        >
                    `;
                }

                if (element.type === "text" && element.content) {
                    const font =
                        element.font ||
                        "Poppins, sans-serif";

                    const color =
                        element.color ||
                        "#111111";

                    return `
                        <span
                            class="admin-design-element admin-design-text"
                            style="
                                left:${x}%;
                                top:${y}%;
                                font-size:${Math.max(10, size)}px;
                                color:${escapeHtml(color)};
                                font-family:${escapeHtml(font)};
                            "
                        >
                            ${escapeHtml(element.content)}
                        </span>
                    `;
                }

                return "";
            }).join("");

            return `
                <div class="admin-design-card">

                    <div class="admin-design-preview">
                        ${
                            uploadData && !hasStudioDesign
                                ? `
                                    <img
                                        class="admin-design-upload-preview"
                                        src="${escapeHtml(uploadData)}"
                                        alt="Desain yang di-upload user"
                                    >
                                `
                                : productImage
                                    ? `
                                        <img
                                            class="admin-design-mockup"
                                            src="${escapeHtml(productImage)}"
                                            alt="Mockup desain pesanan"
                                        >
                                    `
                                    : ""
                        }

                        ${
                            colorHex
                                ? `
                                    <div
                                        class="admin-design-color"
                                        style="
                                            background-color:${escapeHtml(colorHex)};
                                            -webkit-mask-image:url('${escapeHtml(maskImage || productImage)}');
                                            mask-image:url('${escapeHtml(maskImage || productImage)}');
                                        "
                                    ></div>
                                `
                                : ""
                        }

                        <div class="admin-design-elements">
                            ${previewElements}
                        </div>
                    </div>

                    <div class="admin-design-info">

                        <div class="admin-design-summary">
                            <div>
                                <span>Produk</span>
                                <strong>
                                    ${escapeHtml(
                                        design.productName ||
                                        item.nama ||
                                        item.name ||
                                        item.produk ||
                                        "-"
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>Warna</span>
                                <strong>
                                    ${escapeHtml(colorName)}
                                </strong>
                            </div>

                            <div>
                                <span>Elemen</span>
                                <strong>
                                    ${elements.length}
                                </strong>
                            </div>
                        </div>

                        <div class="admin-design-files">

                            <div>
                                <strong>Logo / Gambar Upload</strong>

                                ${
                                    imageElements.length
                                        ? imageElements.map(function (element, index) {
                                            return `
                                                <a
                                                    class="admin-design-image-file"
                                                    href="${escapeHtml(element.src)}"
                                                    target="_blank"
                                                    rel="noopener"
                                                >
                                                    <img
                                                        src="${escapeHtml(element.src)}"
                                                        alt="Logo atau gambar upload ${index + 1}"
                                                    >
                                                    <span>
                                                        Gambar ${index + 1}
                                                    </span>
                                                </a>
                                            `;
                                        }).join("")
                                        : `<p class="detail-empty">
                                            Tidak ada logo atau gambar upload.
                                           </p>`
                                }

                                ${
                                    checkoutDesign && checkoutDesign.nama
                                        ? `<p class="admin-design-file-name">
                                            File checkout: ${escapeHtml(checkoutDesign.nama)}
                                          </p>`
                                        : ""
                                }

                            </div>

                            <div>
                                <strong>Teks Desain</strong>

                                ${
                                    textElements.length
                                        ? `
                                            <ul class="admin-design-text-list">
                                                ${textElements.map(function (element) {
                                                    return `<li>${escapeHtml(element.content)}</li>`;
                                                }).join("")}
                                            </ul>
                                          `
                                        : `<p class="detail-empty">
                                            Tidak ada teks.
                                           </p>`
                                }

                            </div>

                        </div>

                    </div>

                </div>
            `;
        }

        function normalizeItems(order) {
            let items =
                order.items ||
                order.produk ||
                order.products ||
                [];

            if (!Array.isArray(items)) {
                items = [items];
            }

            return items.filter(function (item) {
                return item && typeof item === "object";
            });
        }

        function renderItem(item) {
            const name =
                item.nama ||
                item.name ||
                item.produk ||
                "Produk";

            const variants =
                Array.isArray(item.variants) &&
                item.variants.length
                    ? item.variants
                    : [{
                        ukuran:
                            item.ukuran ||
                            item.size ||
                            "-",
                        lengan:
                            item.lengan ||
                            "-",
                        jumlah:
                            Number(
                                item.jumlah ||
                                item.qty ||
                                item.quantity ||
                                1
                            )
                    }];

            const quantity =
                variants.reduce(
                    function (total, variant) {
                        return total +
                            (Number(variant.jumlah) || 0);
                    },
                    0
                );

            const size =
                variants
                    .map(function (variant) {
                        return (
                            String(variant.ukuran || "-") +
                            " / " +
                            String(variant.lengan || "-") +
                            " × " +
                            String(Number(variant.jumlah) || 0)
                        );
                    })
                    .join("<br>");

            const color =
                item.warna ||
                item.color ||
                "-";

            const material =
                item.bahan ||
                item.material ||
                "-";

            const price =
                item.harga ||
                item.price ||
                item.subtotal ||
                0;

            return `
                <div class="order-item">
                    <div class="order-item-main">
                        <strong>
                            ${escapeHtml(name)}
                        </strong>

                        <span>
                            ${escapeHtml(
                                String(quantity)
                            )} pcs
                        </span>
                    </div>

                    <div class="order-item-meta">
                        <span>
                            Rincian Ukuran & Lengan:
                            <b>${size}</b>
                        </span>

                        <span>
                            Warna:
                            <b>${escapeHtml(color)}</b>
                        </span>

                        <span>
                            Bahan:
                            <b>${escapeHtml(material)}</b>
                        </span>

                        <span>
                            Harga:
                            <b>
                                ${jidoorAdmin.rupiah(price)}
                            </b>
                        </span>
                    </div>
                </div>
            `;
        }

        function detailItem(label, value) {
            return `
                <div class="detail-item">
                    <span>${escapeHtml(label)}</span>
                    <strong>${escapeHtml(value)}</strong>
                </div>
            `;
        }

        function statusOptions(current) {
            const options = [
                "Menunggu Pembayaran",
                "Diproses",
                "Dikerjakan",
                "Selesai",
                "Dibatalkan"
            ];

            return options
                .map(function (status) {
                    return `
                        <option
                            value="${escapeHtml(status)}"
                            ${status === current
                                ? "selected"
                                : ""}
                        >
                            ${escapeHtml(status)}
                        </option>
                    `;
                })
                .join("");
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
