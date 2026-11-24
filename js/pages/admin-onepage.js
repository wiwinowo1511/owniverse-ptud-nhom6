/* OWNIVERSE | Three REAL sections in admin.html.
 * Integrates with teammates' existing hash navigation and light Admin CSS.
 * No iframe, no nested header/sidebar, no extra Admin HTML pages.
 * Local interface-only preview; NEVER use localStorage as an admin permission boundary.
 * Backend integration / RBAC remains a separate production task.
 */
(() => {
  'use strict';
  const onLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  if (!onLocal) return; // This bundle is only an interface preview for a local development server.
  const $ = id => document.getElementById(id);
  const ownKeys = new Set(['dashboard','products','categories']);
  const otherKeys = ['artists','users','orders','promotions'];
  const PRODUCT_KEY = 'owniverse_admin_products_demo_v1';
  const CATEGORY_KEY = 'owniverse_admin_categories_demo_v1';
  const seedProducts = [
    {id:1,code:'SP-001',name:'Hoodie Kairo – Signature',artist:'Kairo',category:'ao-khoac',price:499000,stock:18,status:'active',image:'',collection:'Signature',featured:true,description:'Hoodie merchandise của Kairo.'},
    {id:2,code:'SP-002',name:'Album Mira – Orbit',artist:'Mira',category:'album',price:249000,stock:35,status:'active',image:'',collection:'Orbit',featured:false,description:'Album chính thức của Mira.'},
    {id:3,code:'SP-003',name:'Photobook Rhea',artist:'Rhea',category:'photobook',price:549000,stock:12,status:'active',image:'',collection:'',featured:false,description:'Ấn phẩm hình ảnh nghệ sĩ.'},
    {id:4,code:'SP-004',name:'Tote Bag Kairo',artist:'Kairo',category:'phu-kien',price:199000,stock:3,status:'coming_soon',image:'',collection:'',featured:false,description:''},
    {id:5,code:'SP-005',name:'Sticker Set Mira',artist:'Mira',category:'phu-kien',price:99000,stock:0,status:'sold_out',image:'',collection:'',featured:false,description:''},
    {id:6,code:'SP-006',name:'T-shirt Rhea',artist:'Rhea',category:'ao-thun',price:349000,stock:20,status:'active',image:'',collection:'',featured:false,description:''}
  ];
  const seedCategories = [
    {id:1,code:'DM-01',name:'Áo thun',slug:'ao-thun',description:'Merchandise thời trang',status:'visible'},
    {id:2,code:'DM-02',name:'Áo hoodie',slug:'ao-khoac',description:'Áo khoác / hoodie nghệ sĩ',status:'visible'},
    {id:3,code:'DM-03',name:'Album',slug:'album',description:'Sản phẩm âm nhạc chính thức',status:'visible'},
    {id:4,code:'DM-04',name:'Phụ kiện',slug:'phu-kien',description:'Túi, móc khóa, sticker...',status:'visible'},
    {id:5,code:'DM-05',name:'Photobook',slug:'photobook',description:'Ấn phẩm hình ảnh nghệ sĩ',status:'hidden'}
  ];
  const prices = new Intl.NumberFormat('vi-VN');
  const statusProducts = {active:'Đang bán',coming_soon:'Sắp phát hành',sold_out:'Hết hàng',hidden:'Đã ẩn'};
  const statusCategories = {visible:'Hiển thị',hidden:'Tạm ẩn'};
  const state = {products:[],categories:[],pPage:1,cPage:1,productMode:'create',productId:null,deleteProductId:null,categoryMode:'create',categoryId:null,deleteCategoryId:null,categorySlugEdited:false};
  const removeDiacritic = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase();
  const slugify = value => removeDiacritic(value).trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60).replace(/-$/,'');
  const money = value => Number.isFinite(Number(value)) ? prices.format(value)+'đ' : '—';
  const clone = rows => rows.map(row=>({...row}));
  const safeRead = (key,seed) => {
    try {const raw=localStorage.getItem(key); if(raw===null)return clone(seed); const value=JSON.parse(raw);return Array.isArray(value) ? value : clone(seed);} catch (_) {return clone(seed);}
  };
  function save(key,rows) {localStorage.setItem(key,JSON.stringify(rows));}
  const el = (tag,value,className) => {const node=document.createElement(tag);if(value!==undefined)node.textContent=String(value);if(className)node.className=className;return node;};
  function td(text) {return el('td',text);}
  function rowCells(values) {const tr=document.createElement('tr');values.forEach(v=>tr.appendChild(td(v)));return tr;}
  function actionButton(action,label,id) {const btn=el('button',label);btn.type='button';btn.dataset.action=action;btn.dataset.id=String(id);if(action==='delete')btn.className='ow-danger-text';return btn;}
  function actionsCell(id) {const cell=el('td');cell.className='actions';[['view','Xem'],['edit','Sửa'],['delete','Xóa']].forEach(([action,label])=>cell.appendChild(actionButton(action,label,id)));return cell;}
  function emptyRow(columns,message) {const tr=el('tr');const cell=td(message);cell.className='empty';cell.colSpan=columns;tr.appendChild(cell);return tr;}
  function pager(target,all,page,size) {
    const count=Math.max(1,Math.ceil(all/size));const current=Math.min(page,count);target.replaceChildren();
    const make=(number,label)=>{const button=el('button',label);button.type='button';button.dataset.page=String(number);button.disabled=number<1||number>count;if(number===current)button.setAttribute('aria-current','page');target.appendChild(button);};
    make(current-1,'‹');for(let i=1;i<=count;i++)make(i,String(i));make(current+1,'›');
    return current;
  }
  function notify(text){
    let toast=$('ow-onepage-toast');if(!toast){toast=el('div');toast.id='ow-onepage-toast';toast.setAttribute('role','status');document.body.appendChild(toast);}
    toast.textContent=text;toast.classList.add('ow-toast-visible');clearTimeout(notify.timer);notify.timer=setTimeout(()=>toast.classList.remove('ow-toast-visible'),2800);
  }
  function countSlug(category){
    const code=slugify(category);
    if(['sticker','tui-tote','moc-khoa','phu-kien-khac'].includes(code))return 'phu-kien';
    if(['ao-hoodie','ao-hoodie-ao-khoac'].includes(code))return 'ao-khoac';
    return code;
  }
  function categoryOf(product){return state.categories.find(c=>c.slug===countSlug(product.category))?.name||product.category||'—';}
  function linked(category){return state.products.filter(p=>countSlug(p.category)===category.slug).length;}
  function productLabel(p){return p.code||'SP-'+String(p.id).padStart(3,'0');}
  function categoryLabel(c){return c.code||'DM-'+String(c.id).padStart(2,'0');}
  function updateDashboard(){
    $('ow-db-products').textContent=prices.format(state.products.length);
    $('ow-db-low-stock').textContent=prices.format(state.products.filter(p=>Number(p.stock)<=5).length);
    const days=$('ow-db-range').value;
    $('ow-db-chart-period').textContent='Trong '+days+' ngày gần nhất';
    // We deliberately do not fabricate order, revenue or user figures when SQL/API is offline.
    ['ow-db-revenue','ow-db-orders','ow-db-users','ow-db-order-total','ow-dbs-pending','ow-dbs-processing','ow-dbs-shipping','ow-dbs-delivered','ow-dbs-cancelled','ow-db-pending','ow-db-vouchers','ow-db-locked'].forEach(id=>$(id).textContent='—');
    $('ow-db-recent').replaceChildren(emptyRow(5,'Chưa có dữ liệu đơn hàng từ hệ thống.'));
  }
  // Product list
  function filteredProducts(){
    const q=removeDiacritic($('ow-p-search').value.trim()),artist=$('ow-p-artist').value,status=$('ow-p-status').value;
    return state.products.filter(p=>(!q||removeDiacritic([productLabel(p),p.name,p.artist,categoryOf(p)].join(' ')).includes(q))&&(!artist||p.artist===artist)&&(!status||p.status===status)).sort((a,b)=>Number(a.id)-Number(b.id));
  }
  function renderProducts(){
    const items=filteredProducts(),size=6,totalPages=Math.max(1,Math.ceil(items.length/size));state.pPage=Math.min(state.pPage,totalPages);
    const shown=items.slice((state.pPage-1)*size,state.pPage*size),body=$('ow-p-rows');body.replaceChildren();
    for(const p of shown){
      const tr=rowCells([productLabel(p),p.name,p.artist,categoryOf(p),money(p.price),p.stock]);
      tr.children[0].classList.add('ow-code');
      const status=el('td'),badge=el('span',statusProducts[p.status]||p.status,'ow-status '+(p.status||''));status.appendChild(badge);tr.appendChild(status);
      tr.appendChild(actionsCell(p.id));body.appendChild(tr);
    }
    if(!shown.length)body.appendChild(emptyRow(8,'Không có sản phẩm phù hợp.'));
    $('ow-p-total').textContent='Hiển thị '+items.length+' sản phẩm';
    $('ow-p-count').textContent=items.length ? `${(state.pPage-1)*size+1}–${(state.pPage-1)*size+shown.length} / ${items.length} sản phẩm`:'0 sản phẩm';
    state.pPage=pager($('ow-p-pages'),items.length,state.pPage,size);
    updateDashboard();
  }
  function populateCategoryOptions(){
    const select=$('ow-pf-category'),chosen=select.value;
    select.replaceChildren(new Option('Chọn danh mục',''));
    state.categories.forEach(c=>select.add(new Option(c.name,c.slug)));
    if(chosen&&[...select.options].some(o=>o.value===chosen))select.value=chosen;
  }
  function safeImageUrl(value){
    if(!value||/^(?:javascript|data|vbscript|file):/i.test(value)||/^\/\//.test(value))return '';
    try{const u=new URL(value,location.href);return ['http:','https:'].includes(u.protocol)?u.href:'';}catch(_){return '';}
  }
  function imagePreview(){
    const box=$('ow-p-image-preview');box.replaceChildren();
    const url=safeImageUrl($('ow-pf-image').value.trim());if(!url){box.textContent='+ ẢNH SẢN PHẨM';return;}
    const img=el('img');img.src=url;img.alt='Xem trước ảnh sản phẩm';img.onerror=()=>{box.replaceChildren();box.textContent='Không tải được ảnh';};box.appendChild(img);
  }
  function showProductList(){
    $('ow-p-editor').hidden=true;$('ow-p-list').hidden=false;
    $('ow-p-form-error').hidden=true;state.productId=null;
    renderProducts();
  }
  function openProduct(mode,id){
    const p=id===null ? null :state.products.find(row=>String(row.id)===String(id));if(id!==null&&!p){notify('Không tìm thấy sản phẩm.');return;}
    state.productMode=mode;state.productId=p?.id??null;
    $('ow-p-list').hidden=true;$('ow-p-editor').hidden=false;
    $('ow-p-form-error').hidden=true;
    $('ow-p-form-title').textContent=mode==='create'?'THÊM SẢN PHẨM':mode==='view'?'CHI TIẾT SẢN PHẨM':'CHỈNH SỬA SẢN PHẨM';
    populateCategoryOptions();
    $('ow-pf-code').value=p?productLabel(p):'Tự động cấp';
    $('ow-pf-name').value=p?.name||'';
    $('ow-pf-artist').value=p?.artist||'';
    $('ow-pf-category').value=p?.category||'';
    $('ow-pf-price').value=p?.price??'';
    $('ow-pf-stock').value=p?.stock??'';
    $('ow-pf-description').value=p?.description||'';
    $('ow-pf-image').value=p?.image||'';
    $('ow-pf-status').value=p?.status||'active';
    $('ow-pf-collection').value=p?.collection||'';
    $('ow-pf-featured').checked=Boolean(p?.featured);
    $('ow-p-save').hidden=mode==='view';
    $('ow-p-form').querySelectorAll('input:not([readonly]),select,textarea').forEach(f=>{f.disabled=mode==='view';});
    imagePreview();$('ow-p-title')?.scrollIntoView({block:'start'});
  }
  function submitProduct(event){
    event.preventDefault();if(state.productMode==='view')return;
    const name=$('ow-pf-name').value.trim(),artist=$('ow-pf-artist').value,category=$('ow-pf-category').value;
    const price=Number($('ow-pf-price').value),stock=Number($('ow-pf-stock').value);
    const problems=[];
    if(name.length<2)problems.push('Tên sản phẩm phải có ít nhất 2 ký tự.');
    if(!artist)problems.push('Vui lòng chọn nghệ sĩ.');
    if(!state.categories.some(c=>c.slug===category))problems.push('Vui lòng chọn danh mục hợp lệ.');
    if($('ow-pf-price').value===''||!Number.isSafeInteger(price)||price<0)problems.push('Giá bán phải là số nguyên không âm.');
    if($('ow-pf-stock').value===''||!Number.isSafeInteger(stock)||stock<0)problems.push('Tồn kho phải là số nguyên không âm.');
    if(problems.length){$('ow-p-form-error').hidden=false;$('ow-p-form-error').textContent=problems[0];return;}
    const data={name,artist,category,price,stock,status:$('ow-pf-status').value,description:$('ow-pf-description').value.trim(),image:$('ow-pf-image').value.trim(),collection:$('ow-pf-collection').value.trim(),featured:$('ow-pf-featured').checked};
    if(state.productMode==='create'){
      const next=Math.max(0,...state.products.map(p=>Number(p.id)||0))+1;
      state.products.push({...data,id:next,code:'SP-'+String(next).padStart(3,'0')});
    }else{
      const index=state.products.findIndex(p=>String(p.id)===String(state.productId));
      if(index<0)return notify('Không tìm thấy sản phẩm cần cập nhật.');
      state.products[index]={...state.products[index],...data};
    }
    try{save(PRODUCT_KEY,state.products);}catch(_){$('ow-p-form-error').hidden=false;$('ow-p-form-error').textContent='Trình duyệt không lưu được thay đổi.';return;}
    showProductList();renderCategories();notify('Đã lưu sản phẩm.');
  }
  function openProductDelete(id){
    const p=state.products.find(row=>String(row.id)===String(id));if(!p)return;
    state.deleteProductId=p.id;
    $('ow-p-delete-target').replaceChildren(el('strong',productLabel(p)+' · '+p.name),el('span','Nghệ sĩ: '+p.artist+' · Danh mục: '+categoryOf(p)+' · Giá: '+money(p.price)));
    $('ow-p-delete').showModal();
  }
  function deleteProduct(){
    const id=state.deleteProductId;if(id===null)return;
    state.products=state.products.filter(p=>String(p.id)!==String(id));
    try{save(PRODUCT_KEY,state.products);}catch(_){return notify('Không thể lưu thao tác xóa.');}
    $('ow-p-delete').close();state.deleteProductId=null;renderProducts();renderCategories();notify('Đã xóa sản phẩm.');
  }
  // Category list and editor
  function filteredCategories(){
    const q=removeDiacritic($('ow-c-search').value.trim()),status=$('ow-c-status').value;
    return state.categories.filter(c=>(!q||removeDiacritic([categoryLabel(c),c.name,c.slug,c.description].join(' ')).includes(q))&&(!status||c.status===status)).sort((a,b)=>Number(a.id)-Number(b.id));
  }
  function renderCategories(){
    const all=filteredCategories(),size=6,pages=Math.max(1,Math.ceil(all.length/size));state.cPage=Math.min(state.cPage,pages);
    const shown=all.slice((state.cPage-1)*size,state.cPage*size),body=$('ow-c-rows');body.replaceChildren();
    for(const c of shown){
      const tr=rowCells([categoryLabel(c),c.name,c.description||'—',linked(c)]);tr.children[0].classList.add('ow-code');
      const status=el('td');status.appendChild(el('span',statusCategories[c.status]||c.status,'ow-status '+c.status));tr.appendChild(status);
      tr.appendChild(actionsCell(c.id));body.appendChild(tr);
    }
    if(!shown.length)body.appendChild(emptyRow(6,'Không có danh mục phù hợp.'));
    $('ow-c-total').textContent='Hiển thị '+all.length+' danh mục';
    $('ow-c-count').textContent=all.length?`${(state.cPage-1)*size+1}–${(state.cPage-1)*size+shown.length} / ${all.length} danh mục`:'0 danh mục';
    state.cPage=pager($('ow-c-pages'),all.length,state.cPage,size);updateDashboard();
  }
  function openCategory(mode,id){
    const c=id===null?null:state.categories.find(row=>String(row.id)===String(id));if(id!==null&&!c)return;
    state.categoryMode=mode;state.categoryId=c?.id??null;state.categorySlugEdited=false;
    $('ow-c-form-error').hidden=true;
    $('ow-c-modal-title').textContent=mode==='create'?'THÊM DANH MỤC':mode==='view'?'CHI TIẾT DANH MỤC':'CHỈNH SỬA DANH MỤC';
    $('ow-cf-code').value=c?categoryLabel(c):'Tự động cấp';
    $('ow-cf-name').value=c?.name||'';$('ow-cf-slug').value=c?.slug||'';
    $('ow-cf-description').value=c?.description||'';$('ow-cf-status').value=c?.status||'visible';
    $('ow-cf-name').readOnly=mode==='view';$('ow-cf-description').readOnly=mode==='view';
    $('ow-cf-slug').readOnly=mode!=='create';$('ow-cf-status').disabled=mode==='view';
    $('ow-c-save').hidden=mode==='view';$('ow-c-editor').showModal();
  }
  function submitCategory(event){
    event.preventDefault();if(state.categoryMode==='view')return;
    const name=$('ow-cf-name').value.trim(),slug=$('ow-cf-slug').value.trim().toLowerCase(),description=$('ow-cf-description').value.trim(),status=$('ow-cf-status').value;
    let error='';
    if(name.length<2||name.length>80)error='Tên danh mục phải từ 2 đến 80 ký tự.';
    else if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||slug.length>60)error='Đường dẫn chỉ gồm chữ thường, số và dấu gạch ngang.';
    else if(state.categories.some(c=>String(c.id)!==String(state.categoryId)&&(removeDiacritic(c.name)===removeDiacritic(name)||c.slug===slug)))error='Tên hoặc đường dẫn danh mục đã tồn tại.';
    if(error){$('ow-c-form-error').textContent=error;$('ow-c-form-error').hidden=false;return;}
    if(state.categoryMode==='create'){
      const next=Math.max(0,...state.categories.map(c=>Number(c.id)||0))+1;
      state.categories.push({id:next,code:'DM-'+String(next).padStart(2,'0'),name,slug,description,status});
    }else{
      const index=state.categories.findIndex(c=>String(c.id)===String(state.categoryId));if(index<0)return;
      state.categories[index]={...state.categories[index],name,description,status};
    }
    try{save(CATEGORY_KEY,state.categories);}catch(_){$('ow-c-form-error').textContent='Trình duyệt không lưu được danh mục.';$('ow-c-form-error').hidden=false;return;}
    $('ow-c-editor').close();renderCategories();renderProducts();notify('Đã lưu danh mục.');
  }
  function openCategoryDelete(id){
    const c=state.categories.find(row=>String(row.id)===String(id));if(!c)return;
    const n=linked(c);state.deleteCategoryId=c.id;
    $('ow-c-delete-target').replaceChildren(el('strong',categoryLabel(c)+' · '+c.name),el('span','Số sản phẩm liên kết: '+n));
    $('ow-c-delete-warning').textContent=n>0?'Danh mục đang có '+n+' sản phẩm. Hãy chuyển sản phẩm sang danh mục khác trước khi xóa.':'';
    $('ow-c-delete-confirm').disabled=n>0;
    $('ow-c-delete').showModal();
  }
  function deleteCategory(){
    const id=state.deleteCategoryId,c=state.categories.find(x=>String(x.id)===String(id));if(!c||linked(c)>0)return;
    state.categories=state.categories.filter(x=>String(x.id)!==String(id));
    try{save(CATEGORY_KEY,state.categories);}catch(_){return notify('Không thể lưu thao tác xóa.');}
    $('ow-c-delete').close();renderCategories();renderProducts();notify('Đã xóa danh mục.');
  }
  function hideOpenDialogs(){['ow-p-delete','ow-c-editor','ow-c-delete'].forEach(id=>{const d=$(id);if(d?.open)d.close();});}
  function current(){const hash=location.hash.slice(1).toLowerCase().trim();return hash==='overview'?'dashboard':hash;}
  function sync(){
    const route=current(),ours=ownKeys.has(route);
    for(const view of ownKeys)$( 'view-'+view ).hidden=route!==view;
    if(!ours)return; // Existing admin.js owns Artists / Users / Orders / Promotions.
    hideOpenDialogs();
    otherKeys.forEach(view=>{const target=$('view-'+view);if(target)target.hidden=true;});
    document.querySelectorAll('.sidebar a[data-view]').forEach(link=>{
      const active=link.dataset.view===route;link.classList.toggle('is-active',active);
      if(active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
      if(ownKeys.has(link.dataset.view))link.removeAttribute('data-soon');
    });
    const quick=$('quick-search');if(quick)quick.value=route==='products' ? $('ow-p-search').value : route==='categories' ? $('ow-c-search').value : '';
    if(route==='dashboard')updateDashboard();
    if(route==='products')renderProducts();
    if(route==='categories')renderCategories();
  }
  function bind(){
    $('ow-db-range').addEventListener('change',updateDashboard);
    $('ow-p-search').addEventListener('input',()=>{state.pPage=1;renderProducts();});
    $('ow-p-artist').addEventListener('change',()=>{state.pPage=1;renderProducts();});
    $('ow-p-status').addEventListener('change',()=>{state.pPage=1;renderProducts();});
    $('ow-p-pages').addEventListener('click',e=>{const button=e.target.closest('button[data-page]');if(!button||button.disabled)return;state.pPage=Number(button.dataset.page);renderProducts();});
    $('ow-p-rows').addEventListener('click',e=>{
      const b=e.target.closest('button[data-action]');if(!b)return;
      if(b.dataset.action==='delete')openProductDelete(b.dataset.id);
      else openProduct(b.dataset.action,b.dataset.id);
    });
    $('ow-p-add').addEventListener('click',()=>openProduct('create',null));
    $('ow-p-back').addEventListener('click',showProductList);
    $('ow-p-cancel').addEventListener('click',showProductList);
    $('ow-p-form').addEventListener('submit',submitProduct);
    $('ow-pf-image').addEventListener('input',imagePreview);
    $('ow-p-delete-confirm').addEventListener('click',deleteProduct);
    $('ow-c-search').addEventListener('input',()=>{state.cPage=1;renderCategories();});
    $('ow-c-status').addEventListener('change',()=>{state.cPage=1;renderCategories();});
    $('ow-c-pages').addEventListener('click',e=>{const b=e.target.closest('button[data-page]');if(!b||b.disabled)return;state.cPage=Number(b.dataset.page);renderCategories();});
    $('ow-c-rows').addEventListener('click',e=>{
      const b=e.target.closest('button[data-action]');if(!b)return;
      if(b.dataset.action==='delete')openCategoryDelete(b.dataset.id);
      else openCategory(b.dataset.action,b.dataset.id);
    });
    $('ow-c-add').addEventListener('click',()=>openCategory('create',null));
    $('ow-cf-name').addEventListener('input',()=>{if(state.categoryMode==='create'&&!state.categorySlugEdited)$('ow-cf-slug').value=slugify($('ow-cf-name').value);});
    $('ow-cf-slug').addEventListener('input',()=>{state.categorySlugEdited=true;});
    $('ow-c-form').addEventListener('submit',submitCategory);
    $('ow-c-delete-confirm').addEventListener('click',deleteCategory);
    document.querySelectorAll('[data-ow-close]').forEach(button=>button.addEventListener('click',()=>{$(button.dataset.owClose)?.close();}));
    document.querySelectorAll('#view-products dialog,#view-categories dialog').forEach(dialog=>dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();}));
    // Stop the legacy `data-soon` handler for our three links and use the same #hash router.
    document.addEventListener('click',e=>{
      const link=e.target.closest?.('a[data-view], a[href^="#"]');if(!link)return;
      let route=link.dataset?.view||'';
      if(!ownKeys.has(route))route=(link.getAttribute('href')||'').replace(/^#/, '').toLowerCase();
      if(!ownKeys.has(route))return;
      e.preventDefault();e.stopImmediatePropagation();
      if(location.hash!=='#'+route)location.hash=route;else sync();
    },true);
    // Prevent the legacy quick-search from filtering Artist data while viewing our tabs.
    document.addEventListener('input',e=>{
      if(e.target?.id!=='quick-search'||!ownKeys.has(current()))return;
      e.stopImmediatePropagation();
      const input=$(current()==='products'?'ow-p-search':current()==='categories'?'ow-c-search':'');
      if(input){input.value=e.target.value;input.dispatchEvent(new Event('input',{bubbles:true}));}
    },true);
    window.addEventListener('hashchange',()=>{if(current()!=='products')showProductList();sync();});
  }
  function boot(){
    if(!['view-dashboard','view-products','view-categories','view-artists','view-users'].every(id=>$(id)))return;
    state.products=safeRead(PRODUCT_KEY,seedProducts);
    state.categories=safeRead(CATEGORY_KEY,seedCategories);
    bind();renderProducts();renderCategories();sync();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
