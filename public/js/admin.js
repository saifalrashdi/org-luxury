'use strict';
/* ============================================================
   Org Luxury — admin panel (at /#/admin, deep-linkable tabs)
   Orders · Inventory · Interest · Shipping
   ============================================================ */
(function () {
  const TABS = ['orders', 'inventory', 'interest', 'shipping'];
  let authed = null; // null = unknown

  function L() { return window.OrgLux; }
  function esc(s) { return L().esc(s); }
  function toastOk(m) { L().toast(m); }
  function toastErr(m) { L().toast(m, true); }

  /* ---------- session ---------- */
  async function checkSession() {
    try {
      const r = await fetch('/api/admin/session').then(r => r.json());
      authed = !!r.authenticated;
    } catch { authed = false; }
    return authed;
  }

  function renderLogin(root) {
    root.innerHTML = `
      <div class="admin-shell">
        <div class="admin-login">
          <h1 class="serif">Admin</h1>
          <p>Org Luxury back office — sign in to manage orders, inventory and shipping.</p>
          <form id="adminLoginForm">
            <div class="field"><label>Username</label><input name="username" autocomplete="username" required></div>
            <div class="field"><label>Password</label><input name="password" type="password" autocomplete="current-password" required></div>
            <button class="btn btn-solid" type="submit">Sign in</button>
          </form>
        </div>
      </div>`;
    document.getElementById('adminLoginForm').addEventListener('submit', async e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await L().api('/api/admin/login', {
          method: 'POST',
          body: JSON.stringify({ username: fd.get('username'), password: fd.get('password') }),
        });
        authed = true;
        location.hash = '#/admin/orders';
        render(root, ['orders']);
      } catch (err) { toastErr(err.message); }
    });
  }

  function shell(root, active, inner) {
    root.innerHTML = `
      <div class="admin-shell">
        <div class="admin-head">
          <h1 class="serif">Org <em style="color:var(--terra)">back office</em></h1>
          <button class="btn btn-ghost btn-small" id="adminLogout">Log out</button>
        </div>
        <nav class="admin-tabs">
          ${TABS.map(tb => `<a href="#/admin/${tb}" class="${tb === active ? 'active' : ''}">${tb}</a>`).join('')}
        </nav>
        <div id="adminBody">${inner}</div>
      </div>`;
    document.getElementById('adminLogout').addEventListener('click', async () => {
      await L().api('/api/admin/logout', { method: 'POST', body: '{}' }).catch(() => {});
      authed = false;
      render(root, []);
    });
  }

  /* ---------- orders ---------- */
  const NEXT_STATUS = {
    pending: ['processing', 'cancelled'],
    processing: ['completed', 'cancelled'],
    completed: ['cancelled'],
    cancelled: [],
  };
  function fmtDate(s) { return s ? String(s).replace('T', ' ').slice(0, 16) : ''; }

  async function renderOrders(root) {
    let orders = [];
    try { orders = await L().api('/api/admin/orders'); } catch (e) { toastErr(e.message); }
    const rows = orders.map(o => `
      <tr>
        <td><strong>${esc(o.order_no)}</strong><br><span style="color:var(--ink-faint);font-size:12px">${fmtDate(o.created_at)}</span></td>
        <td>
          ${esc(o.customer_name)}<br>
          <span style="color:var(--ink-faint);font-size:12px">${esc(o.phone)}${o.email ? ' · ' + esc(o.email) : ''}</span><br>
          <span style="color:var(--ink-faint);font-size:12px">${esc(o.address)}</span>
        </td>
        <td class="order-items-list">
          ${o.items.map(i => `<div>${esc(i.name)} × ${i.qty} — ${esc(i.currency)} ${Number(i.price).toLocaleString()}</div>`).join('')}
        </td>
        <td>
          ${esc(o.location)}<br>
          <span style="font-size:12px;color:var(--ink-faint)">${esc(o.shipping_zone)} · fee AED ${o.shipping_fee}</span>
        </td>
        <td><strong>AED ${Number(o.total).toLocaleString()}</strong><br>
          <span style="font-size:12px;color:var(--ink-faint)">${esc(o.payment_method.toUpperCase())}${o.newsletter ? ' · ✉ news' : ''}</span>
        </td>
        <td><span class="status-pill status-${esc(o.status)}">${esc(o.status)}</span></td>
        <td>
          <select class="status-select" data-order="${o.id}" data-current="${esc(o.status)}">
            <option value="${esc(o.status)}" selected>${esc(o.status)}</option>
            ${(NEXT_STATUS[o.status] || []).map(s2 => `<option value="${s2}">→ ${s2}</option>`).join('')}
          </select>
        </td>
      </tr>`).join('');
    shell(root, 'orders', orders.length ? `
      <div style="overflow-x:auto"><table class="admin-table">
        <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Delivery</th><th>Total</th><th>Status</th><th>Move</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
      <p style="font-size:12px;color:var(--ink-faint);margin-top:14px">
        Stock is deducted when an order moves to <strong>completed</strong>, and restored if a completed order is cancelled.</p>`
      : `<div class="empty-state"><span class="serif">No orders yet.</span>New orders appear here the moment they are placed.</div>`);

    document.querySelectorAll('.status-select').forEach(sel => {
      sel.addEventListener('change', async () => {
        const id = sel.dataset.order, next = sel.value;
        try {
          await L().api('/api/admin/orders/' + id, { method: 'PATCH', body: JSON.stringify({ status: next }) });
          toastOk('Order updated to ' + next);
          renderOrders(document.getElementById('app'));
        } catch (e) { toastErr(e.message); sel.value = sel.dataset.current; }
      });
    });
  }

  /* ---------- inventory ---------- */
  function productFormHTML(p) {
    const cats = ['rolex', 'patek', 'richard-mille', 'vintage', 'jewelry'];
    const curs = ['AED', 'USD', 'EUR', 'GBP', 'SAR', 'KWD', 'QAR', 'BHD', 'OMR', 'CHF'];
    return `
      <form id="productForm" class="admin-form">
        <h3 class="serif" id="pfTitle">${p ? 'Edit piece' : 'Add a new piece'}</h3>
        <input type="hidden" name="id" value="${p ? p.id : ''}">
        <div class="form-grid">
          <div class="field"><label>Name (EN) *</label><input name="name" required maxlength="160" value="${p ? esc(p.name) : ''}"></div>
          <div class="field"><label>Name (AR)</label><input name="name_ar" maxlength="200" dir="rtl" value="${p ? esc(p.name_ar) : ''}"></div>
          <div class="field"><label>Brand</label><input name="brand" maxlength="80" value="${p ? esc(p.brand) : ''}"></div>
          <div class="field"><label>Category *</label>
            <select name="category">${cats.map(c => `<option value="${c}" ${p && p.category === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
          <div class="field"><label>Price *</label><input name="price" type="number" min="0" step="0.01" required value="${p ? p.price : ''}"></div>
          <div class="field"><label>Currency</label>
            <select name="currency">${curs.map(c => `<option ${p && p.currency === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
          <div class="field"><label>Stock *</label><input name="stock" type="number" min="0" step="1" required value="${p ? p.stock : 0}"></div>
          <div class="field"><label>Photo</label>
            <div class="file-drop" id="fileDrop">Click to upload a photo (PNG / JPG / WebP, max 8 MB)</div>
            <input type="file" id="fileInput" accept="image/png,image/jpeg,image/webp" hidden>
          </div>
          <div class="field full"><label>Description (EN)</label><textarea name="description" maxlength="1200">${p ? esc(p.description) : ''}</textarea></div>
          <div class="field full"><label>Description (AR)</label><textarea name="description_ar" maxlength="1400" dir="rtl">${p ? esc(p.description_ar) : ''}</textarea></div>
          <label class="check-line"><input type="checkbox" name="featured" ${p && p.featured ? 'checked' : ''}> <span>Featured on home page</span></label>
          <label class="check-line"><input type="checkbox" name="hidden" ${p && p.hidden ? 'checked' : ''}> <span>Hidden from storefront</span></label>
        </div>
        <div style="display:flex;gap:12px;align-items:center;margin-top:20px">
          <button class="btn btn-solid btn-small" type="submit">${p ? 'Save changes' : 'Add piece'}</button>
          ${p ? '<button class="btn btn-ghost btn-small" type="button" id="pfCancel">Cancel edit</button>' : ''}
          <img class="img-preview" id="imgPreview" ${p && p.image ? `src="${esc(p.image)}"` : 'style="display:none"'} alt="">
        </div>
      </form>`;
  }

  let pendingImageData = null;

  function bindProductForm(root, editing) {
    const form = document.getElementById('productForm');
    const drop = document.getElementById('fileDrop');
    const input = document.getElementById('fileInput');
    const preview = document.getElementById('imgPreview');
    pendingImageData = null;
    drop.addEventListener('click', () => input.click());
    input.addEventListener('change', () => {
      const f = input.files[0];
      if (!f) return;
      if (f.size > 8 * 1024 * 1024) { toastErr('Image is too large (max 8 MB)'); return; }
      const reader = new FileReader();
      reader.onload = () => {
        pendingImageData = reader.result;
        preview.src = reader.result; preview.style.display = '';
        drop.textContent = f.name;
      };
      reader.readAsDataURL(f);
    });
    const cancel = document.getElementById('pfCancel');
    if (cancel) cancel.addEventListener('click', () => renderInventory(document.getElementById('app')));

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const fd = new FormData(form);
      const body = {
        name: fd.get('name'), name_ar: fd.get('name_ar'), brand: fd.get('brand'),
        category: fd.get('category'), price: Number(fd.get('price')), currency: fd.get('currency'),
        stock: Number(fd.get('stock')), description: fd.get('description'), description_ar: fd.get('description_ar'),
        featured: fd.get('featured') ? 1 : 0, hidden: fd.get('hidden') ? 1 : 0,
      };
      if (pendingImageData) body.image_data = pendingImageData;
      try {
        if (editing) {
          await L().api('/api/admin/products/' + editing.id, { method: 'PATCH', body: JSON.stringify(body) });
          toastOk('Piece updated');
        } else {
          await L().api('/api/admin/products', { method: 'POST', body: JSON.stringify(body) });
          toastOk('Piece added');
        }
        renderInventory(document.getElementById('app'));
      } catch (err) { toastErr(err.message); }
    });
  }

  async function renderInventory(root, editing) {
    let products = [];
    try { products = await L().api('/api/admin/products'); } catch (e) { toastErr(e.message); }
    const rows = products.map(p => `
      <tr>
        <td>${p.image ? `<img class="img-preview" src="${esc(p.image)}" alt="">` : '—'}</td>
        <td><strong>${esc(p.name)}</strong><br><span style="font-size:12px;color:var(--ink-faint)">${esc(p.brand)} · ${esc(p.category)}</span></td>
        <td>${esc(p.currency)} ${Number(p.price).toLocaleString()}</td>
        <td>${p.stock <= 0 ? '<span class="status-pill status-cancelled">out</span>' : p.stock}</td>
        <td>${p.featured ? '✦' : ''} ${p.hidden ? '<span class="status-pill status-pending">hidden</span>' : ''}</td>
        <td style="white-space:nowrap">
          <button class="btn btn-ghost btn-small" data-edit="${p.id}">Edit</button>
          <button class="btn btn-ghost btn-small" data-toggle="${p.id}" data-hidden="${p.hidden}">${p.hidden ? 'Show' : 'Hide'}</button>
          <button class="btn btn-danger btn-small" data-del="${p.id}">Delete</button>
        </td>
      </tr>`).join('');
    shell(root, 'inventory', `
      ${productFormHTML(editing || null)}
      <div style="overflow-x:auto"><table class="admin-table">
        <thead><tr><th>Photo</th><th>Piece</th><th>Price</th><th>Stock</th><th>Flags</th><th>Actions</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>`);
    bindProductForm(root, editing || null);

    document.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => {
      renderInventory(document.getElementById('app'), products.find(p => p.id === Number(b.dataset.edit)));
    }));
    document.querySelectorAll('[data-toggle]').forEach(b => b.addEventListener('click', async () => {
      const p = products.find(x => x.id === Number(b.dataset.toggle));
      try {
        await L().api('/api/admin/products/' + p.id, { method: 'PATCH', body: JSON.stringify({ hidden: p.hidden ? 0 : 1 }) });
        toastOk(p.hidden ? 'Piece is visible again' : 'Piece hidden');
        renderInventory(document.getElementById('app'));
      } catch (e) { toastErr(e.message); }
    }));
    document.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
      const p = products.find(x => x.id === Number(b.dataset.del));
      if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
      try {
        await fetch('/api/admin/products/' + p.id, { method: 'DELETE' }).then(async r => {
          const d = await r.json().catch(() => ({}));
          if (!r.ok) throw new Error(d.error || 'Delete failed');
        });
        toastOk('Piece deleted');
        renderInventory(document.getElementById('app'));
      } catch (e) { toastErr(e.message); }
    }));
  }

  /* ---------- interest ---------- */
  async function renderInterest(root) {
    let groups = [];
    try { groups = await L().api('/api/admin/interest'); } catch (e) { toastErr(e.message); }
    shell(root, 'interest', groups.length ? groups.map(g => `
      <div class="interest-group">
        <header>
          <h4>${esc(g.product_name)}</h4>
          <span style="font-size:12px;color:${g.stock > 0 ? '#3f6b2a' : 'var(--terra)'}">
            ${g.stock > 0 ? g.stock + ' in stock now' : 'out of stock'} · ${g.requests.length} waiting</span>
        </header>
        <ul>
          ${g.requests.map(r => `<li><span><strong>${esc(r.name)}</strong> — ${esc(r.contact)}</span><span style="color:var(--ink-faint);font-size:12px">${fmtDate(r.created_at)}</span></li>`).join('')}
        </ul>
      </div>`).join('')
      : `<div class="empty-state"><span class="serif">No interest yet.</span>Customers who tap "notify me" on out-of-stock pieces appear here, grouped by product.</div>`);
  }

  /* ---------- shipping ---------- */
  async function renderShipping(root) {
    let fees = { abudhabi: 15, emirates: 30, gcc: 80 };
    try { fees = await L().api('/api/shipping-fees'); } catch (e) { toastErr(e.message); }
    shell(root, 'shipping', `
      <div class="admin-form">
        <h3 class="serif">Delivery fees (AED)</h3>
        <p style="font-size:13px;color:var(--ink-faint);margin-bottom:20px">
          Applied instantly at checkout. Set <strong>0</strong> for free delivery.</p>
        <form id="shipForm">
          <div class="shipping-form">
            <div class="field"><label>Abu Dhabi city</label><input type="number" min="0" step="1" name="abudhabi" value="${fees.abudhabi}"></div>
            <div class="field"><label>Other Emirates</label><input type="number" min="0" step="1" name="emirates" value="${fees.emirates}"></div>
            <div class="field"><label>Other GCC countries</label><input type="number" min="0" step="1" name="gcc" value="${fees.gcc}"></div>
          </div>
          <button class="btn btn-solid btn-small" style="margin-top:20px" type="submit">Save fees</button>
        </form>
      </div>`);
    document.getElementById('shipForm').addEventListener('submit', async e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await L().api('/api/admin/shipping', {
          method: 'PUT',
          body: JSON.stringify({ fees: { abudhabi: Number(fd.get('abudhabi')), emirates: Number(fd.get('emirates')), gcc: Number(fd.get('gcc')) } }),
        });
        toastOk('Shipping fees saved — live at checkout now.');
      } catch (err) { toastErr(err.message); }
    });
  }

  /* ---------- entry ---------- */
  async function render(root, parts) {
    const tab = parts[0] || 'orders';
    if (authed === null) await checkSession();
    if (!authed) { renderLogin(root); return; }
    if (!TABS.includes(tab)) { location.hash = '#/admin/orders'; return; }
    if (tab === 'orders') await renderOrders(root);
    else if (tab === 'inventory') await renderInventory(root);
    else if (tab === 'interest') await renderInterest(root);
    else if (tab === 'shipping') await renderShipping(root);
  }

  window.Admin = { render };
})();
