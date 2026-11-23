(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
  const money = value => Number(value || 0).toLocaleString('vi-VN') + 'đ';
  const dateOnly = value => String(value ?? '').slice(0, 10);
  const dmy = value => dateOnly(value).split('-').reverse().join('/');
  const today = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };
  const plain = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase();
  const badge = (map, key) => `<span class="badge badge--${esc(key)}">${esc(map[key] || key)}</span>`;
  const range = (start, end) => `${dmy(start)} – ${dmy(end)}`;
  const PAGE_SIZE = 6;

  const ARTIST_STATUS = { active: 'Đang hoạt động', paused: 'Tạm ngưng' };
  const ROLE = { customer: 'Customer', artist: 'Artist Collaborator', admin: 'Admin' };
  const USER_STATUS = { active: 'Hoạt động', locked: 'Đã khóa' };
  const ORDER_STATUS = {
    pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', processing: 'Đang xử lý',
    shipping: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy'
  };
  const PAYMENT = { pending: 'Chưa thanh toán', paid: 'Đã thanh toán', failed: 'Thất bại', refunded: 'Đã hoàn tiền' };
  const VOUCHER_STATUS = { running: 'Đang chạy', upcoming: 'Sắp diễn ra', expired: 'Hết hạn', draft: 'Bản nháp' };

  const apiArtist = raw => ({
    id: raw.id,
    raw,
    code: `ART-${String(raw.slug || raw.name || raw.id).replace(/[^a-z0-9]/gi, '').toUpperCase()}`,
    name: raw.name || '',
    genre: raw.genre || '',
    products: Number(raw.productCount || 0),
    status: raw.status === 'active' ? 'active' : 'paused',
    pid: raw.id,
    image: raw.photo || raw.avatar || '',
    bio: raw.description || raw.summary || '',
    note: raw.adminNote || ''
  });
  const apiUser = raw => ({
    id: raw.id,
    code: `USR-${String(raw.id).padStart(3, '0')}`,
    name: raw.fullName || '', email: raw.email || '', role: raw.role || 'customer',
    status: raw.status || 'active', raw
  });
  const apiOrder = raw => ({
    id: raw.id, code: raw.code, customer: raw.customer || '', date: dateOnly(raw.createdAt),
    qty: Number(raw.quantity || 0), total: Number(raw.total || 0),
    payment: String(raw.paymentStatus || 'pending').toLowerCase(),
    status: String(raw.status || 'pending').toLowerCase(), raw
  });
  const apiPromotion = raw => ({
    id: raw.id, code: raw.code, name: raw.name || '', type: raw.type || 'percent',
    value: Number(raw.value || 0), min: Number(raw.minimumOrder || 0),
    limit: raw.usageLimit == null ? '' : Number(raw.usageLimit), used: Number(raw.used || 0),
    start: dateOnly(raw.startDate), end: dateOnly(raw.endDate),
    release: raw.release || 'draft', status: raw.status || 'draft', raw
  });

  const M = {
    artists: {
      noun: 'nghệ sĩ', pk: 'id',
      titles: { create: 'Thêm nghệ sĩ', edit: 'Sửa nghệ sĩ', view: 'Hồ sơ nghệ sĩ' },
      fields: [
        { name: 'code', label: 'Mã nghệ sĩ', required: true, ro: 'edit' },
        { name: 'name', label: 'Tên nghệ sĩ', required: true },
        { name: 'genre', label: 'Thể loại / phong cách', required: true },
        { name: 'products', label: 'Số sản phẩm', type: 'number', min: 0, ro: 'always' },
        { name: 'status', label: 'Trạng thái', options: ARTIST_STATUS },
        { name: 'pid', label: 'ID trang hồ sơ công khai', type: 'number', ro: 'always' },
        { name: 'image', label: 'Ảnh nghệ sĩ (đường dẫn)' },
        { name: 'bio', label: 'Hồ sơ giới thiệu', type: 'textarea', full: true }
      ],
      defaults: () => ({ id: null, code: 'ART-', name: '', genre: '', products: 0, status: 'active', pid: '', image: '', bio: '', note: '' }),
      filterOptions: { status: ARTIST_STATUS },
      filters: { status: artist => artist.status },
      haystack: artist => `${artist.code} ${artist.name} ${artist.genre}`,
      sort: (a, b) => a.name.localeCompare(b.name),
      row: artist => [
        `<b>${esc(artist.code)}</b>`, esc(artist.name), esc(artist.genre), artist.products,
        badge(ARTIST_STATUS, artist.status)
      ],
      validate: (data, mode, items) => {
        const errors = {};
        if (!/^ART-[A-Z0-9]{2,20}$/.test(data.code)) errors.code = 'Mã dùng dạng ART-TENNGHESI, chỉ gồm chữ in hoa và số.';
        else if (!/[A-Z]/.test(data.code.slice(4))) errors.code = 'Mã nghệ sĩ phải có ít nhất một chữ cái sau tiền tố ART-.';
        else if (mode === 'create' && items.some(item => item.code === data.code)) errors.code = 'Mã nghệ sĩ đã tồn tại.';
        return errors;
      },
      load: async () => (await apiRequest('/api/admin/artists', { auth: true })).map(apiArtist),
      async save(mode, data, item) {
        const slug = mode === 'create'
          ? data.code.slice(4).toLowerCase().replace(/[^a-z0-9]+/g, '-')
          : item.raw.slug;
        const body = mode === 'create' ? {
          name: data.name, slug, handle: slug, genre: data.genre,
          description: data.bio, summary: data.bio, avatar: data.image,
          photo: data.image, status: 'active'
        } : {
          ...item.raw, name: data.name, genre: data.genre, description: data.bio,
          summary: data.bio, avatar: data.image, photo: data.image
        };
        const saved = await apiRequest(mode === 'create' ? '/api/artists' : `/api/artists/${item.id}`, {
          method: mode === 'create' ? 'POST' : 'PUT', auth: true, body
        });
        const id = mode === 'create' ? saved.id : item.id;
        const currentStatus = mode === 'create' ? 'active' : item.status;
        if (data.status !== currentStatus) {
          await apiRequest(`/api/admin/artists/${id}/status`, {
            method: 'PUT', auth: true, body: { status: data.status === 'active' ? 'active' : 'hidden' }
          });
        }
        await apiRequest(`/api/admin/artists/${id}/note`, {
          method: 'PUT', auth: true, body: { note: item?.note || '' }
        });
        return { id };
      },
      remove: async item => apiRequest(`/api/artists/${item.id}`, { method: 'DELETE', auth: true }),
      afterRender(module, all) {
        const item = module.items.find(row => String(row.id) === String(module.sel)) || all[0];
        module.sel = item?.id;
        $$('tbody tr[data-id]', module.root).forEach(row => row.classList.toggle('is-selected', row.dataset.id === String(module.sel)));
        const note = $('#artist-note', module.root);
        if (module.noteFor !== module.sel) {
          note.value = item?.note || '';
          module.noteFor = module.sel;
        }
        note.disabled = !item;
        $('[data-artist-card]', module.root).innerHTML = item
          ? `<div class="artist-card_img">ẢNH NGHỆ SĨ${item.image ? `<img src="${esc(item.image)}" alt="Ảnh ${esc(item.name)}" onerror="this.hidden=true">` : ''}</div>
             <div><h3>${esc(item.name)}</h3><p class="artist-card_genre">${esc(item.genre)}</p>
             <p>${esc(item.bio) || 'Chưa có hồ sơ giới thiệu.'}</p>
             <p>Liên kết ${item.products} sản phẩm / bộ sưu tập theo nghệ sĩ.</p>
             <a class="btn btn--ghost" href="artist-detail.html?id=${encodeURIComponent(item.pid)}" style="display:inline-grid;place-items:center;text-decoration:none">XEM HỒ SƠ</a></div>`
          : '<p>Chưa có nghệ sĩ phù hợp.</p>';
      }
    },

    users: {
      noun: 'tài khoản', pk: 'id',
      titles: { create: 'Thêm tài khoản', edit: 'Sửa tài khoản', view: 'Chi tiết tài khoản' },
      fields: [
        { name: 'code', label: 'Mã tài khoản', ro: 'always' },
        { name: 'name', label: 'Tên hiển thị', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'role', label: 'Vai trò', options: ROLE },
        { name: 'status', label: 'Trạng thái', options: USER_STATUS },
        { name: 'password', label: 'Mật khẩu ban đầu', type: 'password', minLength: 8, required: true, createOnly: true }
      ],
      defaults: () => ({ id: null, code: '', name: '', email: '', role: 'customer', status: 'active', password: '' }),
      filterOptions: { role: ROLE, status: USER_STATUS },
      filters: { role: user => user.role, status: user => user.status },
      haystack: user => `${user.code} ${user.name} ${user.email}`,
      sort: (a, b) => a.id - b.id,
      row: user => [
        `<b>${esc(user.code)}</b>`, esc(user.name), esc(user.email), esc(ROLE[user.role] || user.role),
        badge(USER_STATUS, user.status)
      ],
      validate: (data, mode, items) => {
        const errors = {};
        const previous = items.find(user => user.id === data.id);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Email chưa đúng định dạng.';
        else if (items.some(user => user.id !== data.id && user.email.toLowerCase() === data.email.toLowerCase())) errors.email = 'Email đã được dùng cho tài khoản khác.';
        if (mode === 'create' && data.password.length < 8) errors.password = 'Mật khẩu tối thiểu 8 ký tự.';
        if (mode === 'edit' && previous?.role === 'admin' && (data.role !== 'admin' || data.status === 'locked') && !otherActiveAdmin(items, data.id))
          errors.role = 'Cần giữ ít nhất một quản trị viên đang hoạt động.';
        return errors;
      },
      guardDelete: (user, items) => user.role === 'admin' && !otherActiveAdmin(items, user.id)
        ? 'Không thể xóa quản trị viên cuối cùng.' : '',
      load: async () => (await apiRequest('/api/admin/users', { auth: true })).map(apiUser),
      async save(mode, data, item) {
        if (mode === 'create') {
          const saved = await apiRequest('/api/admin/users', {
            method: 'POST', auth: true,
            body: { fullName: data.name, email: data.email, role: data.role, password: data.password }
          });
          if (data.status === 'locked') {
            await apiRequest(`/api/admin/users/${saved.id}/status`, { method: 'PUT', auth: true, body: { status: 'locked' } });
          }
          return { id: saved.id };
        }
        await apiRequest(`/api/admin/users/${item.id}`, {
          method: 'PUT', auth: true,
          body: { fullName: data.name, email: data.email, role: data.role }
        });
        if (data.status !== item.status) {
          await apiRequest(`/api/admin/users/${item.id}/status`, { method: 'PUT', auth: true, body: { status: data.status } });
        }
        return { id: item.id };
      },
      remove: async item => apiRequest(`/api/admin/users/${item.id}`, { method: 'DELETE', auth: true })
    },

    orders: {
      noun: 'đơn hàng', pk: 'id', noCreate: true, noDelete: true,
      titles: { create: 'Tạo đơn hàng', edit: 'Cập nhật trạng thái đơn', view: 'Chi tiết đơn hàng' },
      fields: [
        { name: 'code', label: 'Mã đơn', ro: 'always' },
        { name: 'customer', label: 'Khách hàng', ro: 'always' },
        { name: 'date', label: 'Ngày đặt', type: 'date', ro: 'always' },
        { name: 'qty', label: 'Số sản phẩm', type: 'number', ro: 'always' },
        { name: 'total', label: 'Tổng tiền (đ)', type: 'number', ro: 'always' },
        { name: 'payment', label: 'Thanh toán', options: PAYMENT, ro: 'always' },
        { name: 'status', label: 'Trạng thái xử lý', options: ORDER_STATUS }
      ],
      filterOptions: { status: ORDER_STATUS, payment: PAYMENT },
      filters: { status: order => order.status, payment: order => order.payment },
      haystack: order => `${order.code} ${order.customer}`,
      sort: (a, b) => b.id - a.id,
      row: order => [
        `<b>${esc(order.code)}</b>`, esc(order.customer), dmy(order.date), order.qty,
        money(order.total), badge(PAYMENT, order.payment), badge(ORDER_STATUS, order.status)
      ],
      validate: () => ({}),
      load: async () => (await apiRequest('/api/admin/orders', { auth: true })).map(apiOrder),
      save: async (_mode, data, item) => {
        await apiRequest(`/api/admin/orders/${item.id}/status`, {
          method: 'PUT', auth: true, body: { status: data.status }
        });
        return { id: item.id };
      }
    },

    promotions: {
      noun: 'voucher', pk: 'id',
      titles: { create: 'Thêm voucher', edit: 'Sửa voucher', view: 'Chi tiết voucher' },
      fields: [
        { name: 'code', label: 'Mã voucher', required: true, ro: 'edit' },
        { name: 'name', label: 'Tên chương trình', required: true },
        { name: 'type', label: 'Loại ưu đãi', options: { percent: 'Giảm theo %', fixed: 'Giảm số tiền (đ)' } },
        { name: 'value', label: 'Giá trị ưu đãi', type: 'number', min: 1, required: true },
        { name: 'min', label: 'Đơn tối thiểu (đ)', type: 'number', min: 0, required: true },
        { name: 'limit', label: 'Lượt sử dụng tối đa (để trống nếu không giới hạn)', type: 'number', min: 1 },
        { name: 'start', label: 'Ngày bắt đầu', type: 'date', required: true },
        { name: 'end', label: 'Ngày kết thúc', type: 'date', required: true },
        { name: 'release', label: 'Trạng thái phát hành', options: { publish: 'Phát hành', draft: 'Bản nháp' } },
        { name: 'used', label: 'Đã sử dụng', type: 'number', ro: 'always' }
      ],
      defaults: () => ({ id: null, code: '', name: '', type: 'percent', value: '', min: 0, limit: 100, start: today(), end: today(), release: 'draft', used: 0, status: 'draft' }),
      filterOptions: { status: VOUCHER_STATUS },
      filters: { status: voucher => voucher.status },
      haystack: voucher => `${voucher.code} ${voucher.name}`,
      sort: (a, b) => a.id - b.id,
      normalize: data => { data.code = data.code.toUpperCase(); },
      row: voucher => [
        `<b>${esc(voucher.code)}</b>`, esc(voucher.name),
        voucher.type === 'percent' ? `${voucher.value}%` : money(voucher.value),
        money(voucher.min), range(voucher.start, voucher.end), badge(VOUCHER_STATUS, voucher.status)
      ],
      validate: (data, mode, items) => {
        const errors = {};
        if (!/^[A-Z0-9]{3,20}$/.test(data.code)) errors.code = 'Mã gồm 3–20 ký tự chữ in hoa hoặc số.';
        else if (mode === 'create' && items.some(voucher => voucher.code === data.code)) errors.code = 'Mã voucher đã tồn tại.';
        if (data.type === 'percent' && data.value > 100) errors.value = 'Giảm theo % tối đa 100.';
        if (data.end < data.start) errors.end = 'Ngày kết thúc phải sau ngày bắt đầu.';
        return errors;
      },
      load: async () => (await apiRequest('/api/admin/promotions', { auth: true })).map(apiPromotion),
      save: async (mode, data, item) => {
        const body = {
          code: data.code, name: data.name, type: data.type, value: data.value,
          minimumOrder: data.min, usageLimit: data.limit === '' ? null : data.limit, start: data.start,
          end: data.end, release: data.release
        };
        const saved = await apiRequest(mode === 'create' ? '/api/admin/promotions' : `/api/admin/promotions/${item.id}`, {
          method: mode === 'create' ? 'POST' : 'PUT', auth: true, body
        });
        return { id: saved.id ?? item?.id };
      },
      remove: async item => apiRequest(`/api/admin/promotions/${item.id}`, { method: 'DELETE', auth: true })
    }
  };

  const otherActiveAdmin = (items, id) => items.some(user => user.id !== id && user.role === 'admin' && user.status === 'active');
  const dlg = $('#form-dialog');
  const form = $('#crud-form');
  const confirmDialog = $('#confirm-dialog');
  let context = null;
  let deleteContext = null;
  let toastTimer;

  const toast = message => {
    const element = $('#toast');
    element.textContent = message;
    element.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => element.classList.remove('is-show'), 3000);
  };

  const list = module => {
    const query = plain($('[data-search]', module.root).value.trim());
    const filters = $$('[data-filter]', module.root);
    return module.items
      .filter(item => (!query || plain(module.haystack(item)).includes(query)) &&
        filters.every(select => !select.value || module.filters[select.dataset.filter](item) === select.value))
      .sort(module.sort);
  };

  function render(module) {
    if (!module.items) return;
    const all = list(module);
    const pages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
    module.page = Math.min(module.page, pages);
    const rows = all.slice((module.page - 1) * PAGE_SIZE, module.page * PAGE_SIZE);
    const actions = id => {
      const buttons = [['view', 'Xem'], ['edit', 'Sửa']];
      if (!module.noDelete) buttons.push(['delete', 'Xóa']);
      return buttons.map(([action, label]) => `<button type="button" data-act="${action}" data-id="${esc(id)}">${label}</button>`).join('');
    };
    $('tbody', module.root).innerHTML = rows.map(item =>
      `<tr data-id="${esc(item[module.pk])}">${module.row(item).map(cell => `<td>${cell}</td>`).join('')}<td class="actions">${actions(item[module.pk])}</td></tr>`
    ).join('') || `<tr><td class="empty" colspan="${$$('th', module.root).length}">Không có ${module.noun} phù hợp.</td></tr>`;
    $('[data-count]', module.root).textContent = `Hiển thị ${rows.length} dòng`;
    $('[data-info]', module.root).textContent = `${all.length} ${module.noun}`;
    const pageButton = (page, label, disabled, current) =>
      `<button type="button" data-page="${page}"${disabled ? ' disabled' : ''}${current ? ' aria-current="page"' : ''}>${label}</button>`;
    $('[data-pager]', module.root).innerHTML = pageButton(module.page - 1, '‹', module.page === 1, false) +
      Array.from({ length: pages }, (_, index) => pageButton(index + 1, index + 1, false, index + 1 === module.page)).join('') +
      pageButton(module.page + 1, '›', module.page === pages, false);
    module.afterRender?.(module, all);
  }

  function openForm(module, mode, item) {
    const data = item || module.defaults();
    context = { module, mode, item };
    $('#form-title').textContent = module.titles[mode];
    $('#form-fields').innerHTML = module.fields
      .filter(field => !(field.createOnly && mode !== 'create') && !(field.editOnly && mode === 'create'))
      .map(field => {
        const readonly = field.ro === 'always' || (field.ro === 'edit' && mode !== 'create');
        const id = `f-${field.name}`;
        const value = data[field.name] ?? '';
        const required = field.required && mode !== 'view' ? ' required' : '';
        const control = field.options
          ? `<select id="${id}" name="${field.name}"${readonly && mode !== 'view' ? ' disabled' : ''}${required}>${Object.entries(field.options).map(([key, label]) => `<option value="${esc(key)}"${String(key) === String(value) ? ' selected' : ''}>${esc(label)}</option>`).join('')}</select>`
          : field.type === 'textarea'
            ? `<textarea id="${id}" name="${field.name}" rows="3"${readonly ? ' readonly' : ''}${required}>${esc(value)}</textarea>`
            : `<input id="${id}" name="${field.name}" type="${field.type || 'text'}" value="${esc(value)}"${field.min != null ? ` min="${field.min}"` : ''}${field.minLength ? ` minlength="${field.minLength}"` : ''}${readonly ? ' readonly' : ''}${required}>`;
        return `<div class="field${field.full ? ' field--full' : ''}"><label for="${id}">${field.label}</label>${control}<span class="field-error" data-err="${field.name}"></span></div>`;
      }).join('');
    $('#form-fields').disabled = mode === 'view';
    $('#form-submit').hidden = mode === 'view';
    if (module.noCreate) $('#form-submit').textContent = 'Cập nhật trạng thái';
    else $('#form-submit').textContent = mode === 'create' ? 'Thêm mới' : 'Lưu';
    dlg.showModal();
  }

  async function submitForm(event) {
    event.preventDefault();
    if (!context) return;
    const { module, mode, item } = context;
    const formData = new FormData(form);
    const data = {};
    const errors = {};
    module.fields.filter(field => !(field.createOnly && mode !== 'create') && !(field.editOnly && mode === 'create')).forEach(field => {
      const raw = String(formData.get(field.name) ?? '').trim();
      data[field.name] = field.type === 'number' && raw !== '' ? Number(raw) : raw;
      if (field.options && formData.get(field.name) === null && field.ro === 'always') data[field.name] = item?.[field.name] ?? '';
    });
    if (item) data[module.pk] = item[module.pk];
    module.normalize?.(data);
    module.fields.forEach(field => {
      if (field.createOnly && mode !== 'create') return;
      if (field.required && data[field.name] === '') errors[field.name] = 'Vui lòng nhập thông tin này.';
      else if (field.type === 'number' && data[field.name] !== '' && field.min != null && data[field.name] < field.min)
        errors[field.name] = `Giá trị tối thiểu là ${field.min}.`;
      else if (field.minLength && String(data[field.name] || '').length < field.minLength)
        errors[field.name] = `Cần nhập ít nhất ${field.minLength} ký tự.`;
    });
    Object.assign(errors, module.validate(data, mode, module.items));
    $$('[data-err]', form).forEach(error => { error.textContent = errors[error.dataset.err] || ''; });
    const firstError = Object.keys(errors)[0];
    if (firstError) return $(`#f-${firstError}`, form)?.focus();

    $('#form-submit').disabled = true;
    try {
      const saved = await module.save(mode, data, item);
      module.items = await module.load();
      module.sel = saved?.id ?? item?.[module.pk] ?? module.items[0]?.[module.pk];
      module.noteFor = null;
      dlg.close();
      render(module);
      toast(`${mode === 'create' ? 'Đã thêm' : 'Đã cập nhật'} ${module.noun}.`);
    } catch (error) {
      toast(error.message || `Không thể lưu ${module.noun}.`);
    } finally {
      $('#form-submit').disabled = false;
    }
  }

  function askDelete(module, item) {
    const reason = module.guardDelete?.(item, module.items);
    if (reason) return toast(reason);
    $('#confirm-msg').textContent = `Xóa ${module.noun} ${item.code || item.name || item.id}? Thao tác này không thể hoàn tác.`;
    confirmDialog.returnValue = '';
    deleteContext = { module, item };
    confirmDialog.showModal();
  }

  async function confirmDelete() {
    if (confirmDialog.returnValue !== 'ok' || !deleteContext) return;
    const { module, item } = deleteContext;
    deleteContext = null;
    try {
      await module.remove(item);
      module.items = await module.load();
      if (String(module.sel) === String(item[module.pk])) module.sel = module.items[0]?.[module.pk];
      module.noteFor = null;
      render(module);
      toast(`Đã xóa ${module.noun}.`);
    } catch (error) {
      toast(error.message || `Không thể xóa ${module.noun}.`);
    }
  }

  function wireModule(name, module) {
    module.root = $(`#view-${name}`);
    module.page = 1;
    $$('[data-filter]', module.root).forEach(select => {
      const options = module.filterOptions[select.dataset.filter] || {};
      select.insertAdjacentHTML('beforeend', Object.entries(options)
        .map(([key, label]) => `<option value="${esc(key)}">${esc(label)}</option>`).join(''));
    });
    if (module.noCreate) $('[data-create]', module.root).hidden = true;
    module.root.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) {
        const row = event.target.closest('tbody tr[data-id]');
        if (row && module.afterRender) { module.sel = row.dataset.id; render(module); }
        return;
      }
      if (button.hasAttribute('data-create')) return openForm(module, 'create');
      if (button.dataset.page) { module.page = Number(button.dataset.page); return render(module); }
      const item = module.items.find(row => String(row[module.pk]) === button.dataset.id);
      if (!item) return;
      module.sel = item[module.pk];
      if (module.afterRender) render(module);
      if (button.dataset.act === 'delete') askDelete(module, item);
      else openForm(module, button.dataset.act, item);
    });
    module.root.addEventListener('input', event => {
      if (event.target.matches('[data-search]')) { module.page = 1; render(module); }
    });
    module.root.addEventListener('change', event => {
      if (event.target.matches('[data-filter]')) { module.page = 1; render(module); }
    });
  }

  Object.entries(M).forEach(([name, module]) => wireModule(name, module));
  form.addEventListener('submit', submitForm);
  confirmDialog.addEventListener('close', confirmDelete);
  [dlg, confirmDialog].forEach(dialog => dialog.addEventListener('click', event => {
    if (event.target === dialog || event.target.closest('[data-close]')) dialog.close();
  }));

  $('[data-note-form]').addEventListener('submit', async event => {
    event.preventDefault();
    const module = M.artists;
    const artist = module.items?.find(item => String(item.id) === String(module.sel));
    if (!artist) return;
    const button = $('button[type="submit"]', event.currentTarget);
    button.disabled = true;
    try {
      await apiRequest(`/api/admin/artists/${artist.id}/note`, {
        method: 'PUT', auth: true, body: { note: $('#artist-note').value.trim() }
      });
      artist.note = $('#artist-note').value.trim();
      toast(`Đã lưu ghi chú cho ${artist.name}.`);
    } catch (error) {
      toast(error.message || 'Không thể lưu ghi chú.');
    } finally {
      button.disabled = false;
    }
  });

  let currentView = 'artists';
  function show(name) {
    currentView = M[name] ? name : 'artists';
    Object.entries(M).forEach(([key, module]) => { module.root.hidden = key !== currentView; });
    $$('.sidebar a[data-view]').forEach(link => {
      const active = link.dataset.view === currentView;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    });
    $('#quick-search').value = $('[data-search]', M[currentView].root).value;
  }
  window.addEventListener('hashchange', () => show(location.hash.slice(1)));
  show(location.hash.slice(1));

  document.addEventListener('click', event => {
    const logoutLink = event.target.closest('[data-logout]');
    if (logoutLink) {
      event.preventDefault();
      logout();
      window.location.href = 'login.html';
      return;
    }
    const link = event.target.closest('[data-soon]');
    if (link) { event.preventDefault(); toast(`Chức năng "${link.querySelector('span').textContent}" đang được phát triển.`); }
  });
  $('#btn-alert').addEventListener('click', () => toast('Chưa có thông báo mới.'));
  $('#quick-search').addEventListener('input', event => {
    const search = $('[data-search]', M[currentView].root);
    search.value = event.target.value;
    M[currentView].page = 1;
    render(M[currentView]);
  });

  async function start() {
    if (!localStorage.getItem('owniverse_token')) {
      goToLogin('admin.html');
      return;
    }
    try {
      const user = await refreshCurrentUser();
      if (user.role !== 'admin') {
        alert('Bạn không có quyền truy cập trang quản trị.');
        window.location.replace('index.html');
        return;
      }
      const collections = await Promise.all(Object.values(M).map(module => module.load()));
      Object.values(M).forEach((module, index) => { module.items = collections[index]; });
      Object.values(M).forEach(render);
    } catch (error) {
      if (!localStorage.getItem('owniverse_token')) {
        goToLogin('admin.html');
        return;
      }
      toast(error.message || 'Không tải được dữ liệu quản trị.');
    }
  }

  start();
})();
