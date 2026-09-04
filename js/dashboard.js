(function(){
    const user = JSON.parse(localStorage.getItem('loginUser') || 'null');
    if(!user || user.role !== 'admin'){
        window.location.replace('../login.html');
        return;
    }

    const name = document.getElementById('adminName');
    if(name) name.textContent = user.nama || 'Admin';

    function getOrders(){
        let orders = JSON.parse(localStorage.getItem('riwayatPesanan') || '[]');
        if(!Array.isArray(orders)) orders = [];
        const latest = JSON.parse(localStorage.getItem('pesananTerakhir') || 'null');
        if(latest && latest.id && !orders.some(o => o && o.id === latest.id)) orders.unshift(latest);
        return orders;
    }

    function statusText(order){
        return String(order.statusPesanan || order.status || 'Menunggu');
    }

    function statusClass(status){
        const s = status.toLowerCase();
        if(s.includes('selesai') || s.includes('berhasil')) return 'badge-success';
        if(s.includes('batal')) return 'badge-cancel';
        if(s.includes('menunggu') || s.includes('belum')) return 'badge-pending';
        return 'badge-process';
    }

    function rupiah(value){
        const n = parseInt(String(value ?? 0).replace(/[^0-9]/g,''),10) || 0;
        return 'Rp ' + n.toLocaleString('id-ID');
    }

    function productName(order){
        const items = order.items || order.produk || order.products || [];
        const item = Array.isArray(items) ? items[0] : items;
        return item?.nama || item?.name || item?.produk || order.produk || 'Produk Pesanan';
    }

    function render(){
        const orders = getOrders();
        const total = orders.length;
        const newer = orders.filter(o => /menunggu/i.test(statusText(o))).length;
        const processing = orders.filter(o => /proses|dikerjakan/i.test(statusText(o))).length;
        const completed = orders.filter(o => /selesai/i.test(statusText(o))).length;

        document.getElementById('totalOrders').textContent = total;
        document.getElementById('newOrders').textContent = newer;
        document.getElementById('processingOrders').textContent = processing;
        document.getElementById('completedOrders').textContent = completed;

        const body = document.getElementById('recentOrders');
        if(!orders.length){
            body.innerHTML = '<tr><td colspan="5"><div class="empty-admin">Belum ada pesanan.</div></td></tr>';
            return;
        }

        body.innerHTML = orders.slice(0,6).map(order => {
            const status = statusText(order);
            return `<tr>
                <td><span class="order-id">#${order.id || '-'}</span></td>
                <td>${order.nama || order.namaPemesan || '-'}</td>
                <td>${productName(order)}</td>
                <td><span class="order-total">${rupiah(order.total)}</span></td>
                <td><span class="badge ${statusClass(status)}">${status}</span></td>
            </tr>`;
        }).join('');
    }

    window.adminLogout = function(){
        localStorage.removeItem('loginUser');
        window.location.replace('../login.html');
    };

    const menuButton = document.getElementById('menuButton');
    const sidebar = document.getElementById('adminSidebar');
    if(menuButton && sidebar) menuButton.addEventListener('click', () => sidebar.classList.toggle('open'));

    render();
})();
