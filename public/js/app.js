'use strict';
/* ============================================================
   Org Luxury — storefront app (vanilla JS, hash routing)
   Bilingual EN/AR, RTL support, localStorage cart, guest checkout
   ============================================================ */

/* ---------------- i18n ---------------- */
const I18N = {
  en: {
    'brand.luxury': 'Luxury',
    'nav.home': 'Home', 'nav.shop': 'Shop', 'nav.about': 'About', 'nav.cart': 'Cart', 'nav.admin': 'Admin',
    'footer.tag': 'Rare watches & jewelry — from our hands to yours.',
    'footer.whatsapp': 'WhatsApp us',
    'footer.instagram': 'Instagram @org_uae',
    'footer.note': 'Hand-picked pieces, delivered across the GCC.',
    'footer.rights': '© Org Luxury. All pieces verified by our dealers.',

    'hero.kicker': 'Dealers-run · Est. Abu Dhabi',
    'hero.title': 'Rare watches, <em>chosen by hand.</em>',
    'hero.sub': 'Org Luxury is a dealers-run house for rare watches and jewelry. Every Rolex, Patek Philippe and Richard Mille in our vault is sourced, verified and priced by the family itself.',
    'hero.cta.shop': 'Browse the vault', 'hero.cta.about': 'Our story',
    'hero.caption': 'The vault — piece No. 06',

    'marquee.1': 'Hand-picked Rolex, Patek Philippe & Richard Mille',
    'marquee.2': 'Verified by our dealers',
    'marquee.3': 'Delivery across the UAE & GCC',
    'marquee.4': 'From our hands to yours',

    'featured.title': 'Featured <em>pieces</em>',
    'featured.more': 'View all',
    'home.story.title': 'A family affair, <em>in every sense.</em>',
    'home.story.body': 'We are the Org family. We bring you luxury — from our hands to yours. No middlemen, no mystery: each piece passes through our own inspection before it reaches the vault.',
    'home.story.cta': 'Read about us',

    'shop.title': 'The <em>vault</em>',
    'shop.sub': 'Every piece is one of few. When it is gone, it is gone.',
    'filter.all': 'All', 'filter.rolex': 'Rolex', 'filter.patek': 'Patek Philippe',
    'filter.richard-mille': 'Richard Mille', 'filter.vintage': 'Vintage & More', 'filter.jewelry': 'Jewelry',
    'shop.empty': 'No pieces in this corner of the vault yet.',
    'shop.count': '{n} pieces',

    'product.back': 'Back to the vault',
    'product.add': 'Add to cart',
    'product.outofstock': 'Out of stock',
    'product.onlyLeft': 'Only {n} left',
    'product.instock': 'In stock',
    'product.interest': "I'm interested — notify me",
    'product.brand': 'Brand', 'product.category': 'Category', 'product.availability': 'Availability', 'product.reference': 'Reference',

    'badge.out': 'Out of stock', 'badge.low': 'Only {n} left',

    'cart.title': 'Your Selection',
    'cart.empty': 'The vault awaits.',
    'cart.emptySub': 'Your selection is empty — go find your piece.',
    'cart.subtotal': 'Subtotal',
    'cart.note': 'Delivery calculated at checkout. Totals in AED.',
    'cart.checkout': 'Checkout',
    'cart.remove': 'Remove',
    'cart.continue': 'Continue browsing',

    'co.title': 'Checkout',
    'co.contact': 'Your details',
    'co.name': 'Full name', 'co.phone': 'Phone', 'co.email': 'Email (optional)',
    'co.address': 'Delivery address', 'co.notes': 'Notes (optional)',
    'co.area': 'Delivery area', 'co.area.ph': 'Choose your delivery area…',
    'co.group.uae': 'United Arab Emirates', 'co.group.gcc': 'Other GCC countries',
    'co.payment': 'Payment method',
    'pay.cod': 'Cash on Delivery', 'pay.cod.note': 'Pay in cash when your piece arrives.',
    'pay.applepay': 'Apple Pay', 'pay.applepay.note': 'We send a secure payment link on WhatsApp.',
    'pay.visa': 'VISA card', 'pay.visa.note': 'We send a secure payment link on WhatsApp.',
    'co.newsletter': 'Keep me posted on new arrivals & private deals',
    'co.summary': 'Order summary',
    'co.subtotal': 'Subtotal', 'co.delivery': 'Delivery', 'co.total': 'Total',
    'co.free': 'Free',
    'co.place': 'Place order',
    'co.fx': 'Pieces priced in other currencies are converted to AED at fixed indicative rates.',
    'co.placing': 'Placing your order…',

    'confirm.title': 'Shukran — order received.',
    'confirm.orderNo': 'Order {no}',
    'confirm.cod': 'You chose Cash on Delivery. Have the amount ready when our courier arrives — we will confirm on WhatsApp first.',
    'confirm.card': 'You chose card payment. We will send a secure payment link to you via WhatsApp shortly — your piece is reserved once paid.',
    'confirm.whats': 'Message us on WhatsApp',
    'confirm.continue': 'Back to the vault',
    'confirm.items': 'Your pieces',

    'interest.title': 'Reserve your interest',
    'interest.sub': 'This piece is out of stock. Leave your details and we will reach out the moment a similar piece enters the vault.',
    'interest.name': 'Your name', 'interest.contact': 'Phone or WhatsApp',
    'interest.submit': 'Notify me', 'interest.done': 'Noted — we will be in touch.',

    'about.kicker': 'Our story',
    'about.en': '"We are the Org family. We bring you luxury — from our hands to yours."',
    'about.body': 'Org Luxury is run by dealers, not by a faceless company. We travel, we hunt, we verify — and only then does a piece earn its place in the vault. What you see is what we would wear ourselves.',
    'about.f1.num': '20+', 'about.f1.lbl': 'Years dealing rare pieces',
    'about.f2.num': '900+', 'about.f2.lbl': 'Pieces placed with collectors',
    'about.f3.num': '12', 'about.f3.lbl': 'Countries delivered to',

    'toast.added': 'Added to your selection',
    'toast.removed': 'Removed from your selection',
    'toast.lang': 'Switched to English',
    'err.required': 'Please fill in all required fields.',
    'err.area': 'Please choose a delivery area.',
    'err.payment': 'Please choose a payment method.',
    'err.order': 'Could not place the order. Please try again or message us on WhatsApp.',
    'err.generic': 'Something went wrong. Please try again.',

    'loc.abu-dhabi': 'Abu Dhabi city', 'loc.dubai': 'Dubai', 'loc.sharjah': 'Sharjah',
    'loc.ajman': 'Ajman', 'loc.ras-al-khaimah': 'Ras Al Khaimah', 'loc.fujairah': 'Fujairah',
    'loc.umm-al-quwain': 'Umm Al Quwain', 'loc.saudi-arabia': 'Saudi Arabia', 'loc.kuwait': 'Kuwait',
    'loc.qatar': 'Qatar', 'loc.bahrain': 'Bahrain', 'loc.oman': 'Oman',

    'cat.rolex': 'Rolex', 'cat.patek': 'Patek Philippe', 'cat.richard-mille': 'Richard Mille',
    'cat.vintage': 'Vintage & More', 'cat.jewelry': 'Jewelry',
  },
  ar: {
    'brand.luxury': 'لاكجري',
    'nav.home': 'الرئيسية', 'nav.shop': 'المتجر', 'nav.about': 'قصتنا', 'nav.cart': 'السلة', 'nav.admin': 'الإدارة',
    'footer.tag': 'ساعات ومجوهرات نادرة — من أيدينا إلى أيديكم.',
    'footer.whatsapp': 'راسلنا على واتساب',
    'footer.instagram': 'إنستغرام org_uae@',
    'footer.note': 'قطع منتقاة بعناية، مع التوصيل لدول الخليج.',
    'footer.rights': '© أورج لاكجري. جميع القطع موثقة من تجّارنا.',

    'hero.kicker': 'يديرها تجّار · أبوظبي',
    'hero.title': 'ساعات نادرة، <em>منتقاة يدوياً.</em>',
    'hero.sub': 'أورج لاكجري دار يديرها تجّار للساعات والمجوهرات النادرة. كل رولكس وباتيك فيليب وريتشارد ميل في خزانتنا مصدرها وموثقة ومسعّرة من العائلة نفسها.',
    'hero.cta.shop': 'تصفّح الخزانة', 'hero.cta.about': 'قصتنا',
    'hero.caption': 'الخزانة — القطعة رقم ٠٦',

    'marquee.1': 'رولكس وباتيك فيليب وريتشارد ميل منتقاة يدوياً',
    'marquee.2': 'موثقة من تجّارنا',
    'marquee.3': 'توصيل لجميع الإمارات ودول الخليج',
    'marquee.4': 'من أيدينا إلى أيديكم',

    'featured.title': 'قطع <em>مميزة</em>',
    'featured.more': 'عرض الكل',
    'home.story.title': 'شأن عائلي، <em>بكل معنى الكلمة.</em>',
    'home.story.body': 'نحن أسرة أورج. اتينا لكم بالفخامه من أيدينا الى ايديكم. بلا وسطاء وبلا غموض: كل قطعة تمر بفحصنا الخاص قبل أن تدخل الخزانة.',
    'home.story.cta': 'اقرأ عنّا',

    'shop.title': 'ال<em>خزانة</em>',
    'shop.sub': 'كل قطعة من القلائل. حين تذهب، تذهب.',
    'filter.all': 'الكل', 'filter.rolex': 'رولكس', 'filter.patek': 'باتيك فيليب',
    'filter.richard-mille': 'ريتشارد ميل', 'filter.vintage': 'فينتاج وأخرى', 'filter.jewelry': 'مجوهرات',
    'shop.empty': 'لا قطع في هذا الركن من الخزانة بعد.',
    'shop.count': '{n} قطعة',

    'product.back': 'العودة إلى الخزانة',
    'product.add': 'أضف إلى السلة',
    'product.outofstock': 'نفدت الكمية',
    'product.onlyLeft': 'بقي {n} فقط',
    'product.instock': 'متوفر',
    'product.interest': 'مهتم — أعلمني عند التوفر',
    'product.brand': 'الماركة', 'product.category': 'الفئة', 'product.availability': 'التوفر', 'product.reference': 'المرجع',

    'badge.out': 'نفدت الكمية', 'badge.low': 'بقي {n} فقط',

    'cart.title': 'مختاراتك',
    'cart.empty': 'الخزانة بانتظارك.',
    'cart.emptySub': 'مختاراتك فارغة — ابحث عن قطعتك.',
    'cart.subtotal': 'المجموع الفرعي',
    'cart.note': 'يُحسب التوصيل عند إتمام الطلب. الإجمالي بالدرهم الإماراتي.',
    'cart.checkout': 'إتمام الطلب',
    'cart.remove': 'إزالة',
    'cart.continue': 'مواصلة التصفح',

    'co.title': 'إتمام الطلب',
    'co.contact': 'بياناتك',
    'co.name': 'الاسم الكامل', 'co.phone': 'رقم الهاتف', 'co.email': 'البريد الإلكتروني (اختياري)',
    'co.address': 'عنوان التوصيل', 'co.notes': 'ملاحظات (اختياري)',
    'co.area': 'منطقة التوصيل', 'co.area.ph': 'اختر منطقة التوصيل…',
    'co.group.uae': 'الإمارات العربية المتحدة', 'co.group.gcc': 'دول الخليج الأخرى',
    'co.payment': 'طريقة الدفع',
    'pay.cod': 'الدفع عند الاستلام', 'pay.cod.note': 'ادفع نقداً عند وصول قطعتك.',
    'pay.applepay': 'آبل باي', 'pay.applepay.note': 'سنرسل رابط دفع آمن عبر واتساب.',
    'pay.visa': 'بطاقة فيزا', 'pay.visa.note': 'سنرسل رابط دفع آمن عبر واتساب.',
    'co.newsletter': 'أبقني على اطلاع بالوصولات الجديدة والعروض الخاصة',
    'co.summary': 'ملخص الطلب',
    'co.subtotal': 'المجموع الفرعي', 'co.delivery': 'التوصيل', 'co.total': 'الإجمالي',
    'co.free': 'مجاني',
    'co.place': 'تأكيد الطلب',
    'co.fx': 'القطع المسعّرة بعملات أخرى تُحوَّل إلى الدرهم الإماراتي بأسعار ثابتة استرشادية.',
    'co.placing': 'جارٍ تسجيل طلبك…',

    'confirm.title': 'شكراً — تم استلام طلبك.',
    'confirm.orderNo': 'طلب رقم {no}',
    'confirm.cod': 'اخترت الدفع عند الاستلام. جهّز المبلغ عند وصول المندوب — وسنؤكد معك على واتساب أولاً.',
    'confirm.card': 'اخترت الدفع بالبطاقة. سنرسل لك رابط دفع آمن عبر واتساب قريباً — وتُحجز قطعتك فور السداد.',
    'confirm.whats': 'راسلنا على واتساب',
    'confirm.continue': 'العودة إلى الخزانة',
    'confirm.items': 'قطعك',

    'interest.title': 'سجّل اهتمامك',
    'interest.sub': 'هذه القطعة نفدت من المخزون. اترك بياناتك وسنتواصل معك فور دخول قطعة مشابهة إلى الخزانة.',
    'interest.name': 'اسمك', 'interest.contact': 'الهاتف أو الواتساب',
    'interest.submit': 'أعلمني', 'interest.done': 'تم التسجيل — سنكون على تواصل.',

    'about.kicker': 'قصتنا',
    'about.en': '"We are the Org family. We bring you luxury — from our hands to yours."',
    'about.body': 'أورج لاكجري يديرها تجّار، لا شركة بلا وجه. نسافر ونبحث ونوثّق — وعندها فقط تستحق القطعة مكانها في الخزانة. ما تراه هو ما نرتديه بأنفسنا.',
    'about.f1.num': '+20', 'about.f1.lbl': 'عاماً في تجارة القطع النادرة',
    'about.f2.num': '+900', 'about.f2.lbl': 'قطعة وصلت إلى هواة',
    'about.f3.num': '12', 'about.f3.lbl': 'دولة نوصل إليها',

    'toast.added': 'أُضيفت إلى مختاراتك',
    'toast.removed': 'أُزيلت من مختاراتك',
    'toast.lang': 'تم التبديل إلى العربية',
    'err.required': 'يرجى تعبئة جميع الحقول المطلوبة.',
    'err.area': 'يرجى اختيار منطقة التوصيل.',
    'err.payment': 'يرجى اختيار طريقة الدفع.',
    'err.order': 'تعذّر تسجيل الطلب. حاول مجدداً أو راسلنا على واتساب.',
    'err.generic': 'حدث خطأ ما. حاول مجدداً.',

    'loc.abu-dhabi': 'مدينة أبوظبي', 'loc.dubai': 'دبي', 'loc.sharjah': 'الشارقة',
    'loc.ajman': 'عجمان', 'loc.ras-al-khaimah': 'رأس الخيمة', 'loc.fujairah': 'الفجيرة',
    'loc.umm-al-quwain': 'أم القيوين', 'loc.saudi-arabia': 'السعودية', 'loc.kuwait': 'الكويت',
    'loc.qatar': 'قطر', 'loc.bahrain': 'البحرين', 'loc.oman': 'عُمان',

    'cat.rolex': 'رولكس', 'cat.patek': 'باتيك فيليب', 'cat.richard-mille': 'ريتشارد ميل',
    'cat.vintage': 'فينتاج وأخرى', 'cat.jewelry': 'مجوهرات',
  },
};

/* ---------------- state & helpers ---------------- */
const LS_LANG = 'orglux_lang';
const LS_CART = 'orglux_cart';

const state = {
  lang: localStorage.getItem(LS_LANG) === 'ar' ? 'ar' : 'en',
  cart: loadCart(),
  config: null,
  fees: null,
  productsCache: null,
};

function loadCart() {
  try {
    const c = JSON.parse(localStorage.getItem(LS_CART) || '[]');
    return Array.isArray(c) ? c.filter(i => i && Number.isInteger(i.id) && i.qty > 0) : [];
  } catch { return []; }
}
function saveCart() { localStorage.setItem(LS_CART, JSON.stringify(state.cart)); renderCartCount(); }

function t(key, vars) {
  let s = (I18N[state.lang] && I18N[state.lang][key]) || I18N.en[key] || key;
  if (vars) for (const k of Object.keys(vars)) s = s.replace(`{${k}}`, vars[k]);
  return s;
}
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
async function api(path, opts) {
  const res = await fetch(path, opts ? {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
  } : undefined);
  let data = null;
  try { data = await res.json(); } catch { /* ignore */ }
  if (!res.ok) {
    const err = new Error((data && data.error) || t('err.generic'));
    err.status = res.status;
    throw err;
  }
  return data;
}

const FX_TO_AED = { AED: 1, USD: 3.6725, EUR: 3.95, GBP: 4.65, SAR: 0.979, KWD: 11.96, QAR: 1.009, BHD: 9.74, OMR: 9.54, CHF: 4.1 };
const CUR_LABEL = {
  AED: ['AED', 'د.إ'], USD: ['USD', 'دولار'], EUR: ['EUR', 'يورو'], GBP: ['GBP', 'جنيه'],
  SAR: ['SAR', 'ريال'], KWD: ['KWD', 'د.ك'], QAR: ['QAR', 'ر.ق'], BHD: ['BHD', 'د.ب'],
  OMR: ['OMR', 'ر.ع'], CHF: ['CHF', 'فرنك'],
};
function fmtNum(n) {
  return new Intl.NumberFormat(state.lang === 'ar' ? 'ar-AE' : 'en-US', { maximumFractionDigits: 0 }).format(Math.round(n));
}
function fmtAED(n) {
  const lbl = CUR_LABEL.AED[state.lang === 'ar' ? 1 : 0];
  return `${fmtNum(n)} ${lbl}`;
}
function fmtPrice(price, currency) {
  const cur = (currency || 'AED').toUpperCase();
  const lbl = (CUR_LABEL[cur] || [cur, cur])[state.lang === 'ar' ? 1 : 0];
  return `${fmtNum(price)} ${lbl}`;
}
function priceInAED(price, currency) {
  return price * (FX_TO_AED[(currency || 'AED').toUpperCase()] || 1);
}
function pName(p) { return state.lang === 'ar' && p.name_ar ? p.name_ar : p.name; }
function pDesc(p) { return state.lang === 'ar' && p.description_ar ? p.description_ar : p.description; }

function toast(msg, isError) {
  const stack = document.getElementById('toastStack');
  const el = document.createElement('div');
  el.className = 'toast' + (isError ? ' error' : '');
  el.textContent = msg;
  stack.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .4s'; setTimeout(() => el.remove(), 450); }, 3600);
}

function waLink(text) {
  const num = (state.config && state.config.whatsapp) || '971500000000';
  return `https://wa.me/${num}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

/* ---------------- language ---------------- */
function applyLang() {
  const ar = state.lang === 'ar';
  document.documentElement.lang = ar ? 'ar' : 'en';
  document.documentElement.dir = ar ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.getElementById('langToggle').textContent = ar ? 'EN' : 'عربي';
  const fw = document.getElementById('footerWhats');
  if (fw) fw.href = waLink(state.lang === 'ar' ? 'مرحباً أورج لاكجري،' : 'Hello Org Luxury,');
}
function setLang(lang) {
  state.lang = lang;
  localStorage.setItem(LS_LANG, lang);
  applyLang();
  route(); // re-render current page
}

/* ---------------- cart ---------------- */
function cartCount() { return state.cart.reduce((s, i) => s + i.qty, 0); }
function renderCartCount() { document.getElementById('cartCount').textContent = cartCount(); }
function addToCart(id, qty = 1) {
  const line = state.cart.find(i => i.id === id);
  if (line) line.qty += qty; else state.cart.push({ id, qty });
  saveCart(); renderCartDrawer();
  toast(t('toast.added'));
}
function setQty(id, qty) {
  const line = state.cart.find(i => i.id === id);
  if (!line) return;
  line.qty = qty;
  if (line.qty <= 0) state.cart = state.cart.filter(i => i.id !== id);
  saveCart(); renderCartDrawer();
}
function removeFromCart(id) {
  state.cart = state.cart.filter(i => i.id !== id);
  saveCart(); renderCartDrawer();
  toast(t('toast.removed'));
}

async function cartDetailed() {
  if (state.cart.length === 0) return [];
  const ids = state.cart.map(i => i.id);
  const all = await api('/api/products');
  const map = new Map(all.map(p => [p.id, p]));
  return state.cart.map(i => ({ ...i, product: map.get(i.id) })).filter(i => i.product);
}

async function renderCartDrawer() {
  const body = document.getElementById('cartBody');
  const foot = document.getElementById('cartFoot');
  if (state.cart.length === 0) {
    body.innerHTML = `<div class="cart-empty"><span class="serif">${t('cart.empty')}</span>${t('cart.emptySub')}</div>`;
    foot.innerHTML = '';
    return;
  }
  try {
    const lines = await cartDetailed();
    body.innerHTML = lines.map(l => `
      <div class="cart-line">
        <img src="${esc(l.product.image)}" alt="${esc(pName(l.product))}" loading="lazy">
        <div>
          <div class="cl-name">${esc(pName(l.product))}</div>
          <div class="cl-price">${fmtPrice(l.product.price, l.product.currency)}</div>
          <div class="qty-ctl">
            <button data-qty="-1" data-id="${l.id}" aria-label="decrease">−</button>
            <span>${l.qty}</span>
            <button data-qty="1" data-id="${l.id}" aria-label="increase">+</button>
          </div>
        </div>
        <button class="cl-remove" data-remove="${l.id}">${t('cart.remove')}</button>
      </div>`).join('');
    const subtotal = lines.reduce((s, l) => s + priceInAED(l.product.price, l.product.currency) * l.qty, 0);
    foot.innerHTML = `
      <div class="row"><span>${t('cart.subtotal')}</span><strong>${fmtAED(subtotal)}</strong></div>
      <div class="row" style="font-size:12px;color:var(--ink-faint)">${t('cart.note')}</div>
      <a class="btn btn-solid" href="#/checkout" id="drawerCheckout">${t('cart.checkout')}<span class="arrow">→</span></a>`;
    body.querySelectorAll('[data-qty]').forEach(b => b.addEventListener('click', () => {
      const id = Number(b.dataset.id);
      const line = state.cart.find(i => i.id === id);
      setQty(id, (line ? line.qty : 1) + Number(b.dataset.qty));
    }));
    body.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', () => removeFromCart(Number(b.dataset.remove))));
    const dc = document.getElementById('drawerCheckout');
    if (dc) dc.addEventListener('click', closeCart);
  } catch (e) {
    body.innerHTML = `<div class="cart-empty">${esc(e.message)}</div>`;
  }
}

function openCart() {
  renderCartDrawer();
  const ov = document.getElementById('drawerOverlay');
  ov.hidden = false;
  requestAnimationFrame(() => ov.classList.add('show'));
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartDrawer').setAttribute('aria-hidden', 'false');
}
function closeCart() {
  const ov = document.getElementById('drawerOverlay');
  ov.classList.remove('show');
  setTimeout(() => { ov.hidden = true; }, 350);
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('cartDrawer').setAttribute('aria-hidden', 'true');
}

/* ---------------- shared rendering ---------------- */
function badgeFor(p) {
  if (p.stock <= 0) return `<span class="badge badge-out">${t('badge.out')}</span>`;
  if (p.stock <= 3) return `<span class="badge badge-low"><span class="badge-dot"></span>${t('badge.low', { n: fmtNum(p.stock) })}</span>`;
  return '';
}
function cardHTML(p) {
  const oos = p.stock <= 0;
  return `
    <a class="product-card ${oos ? 'oos' : ''}" href="#/product/${p.id}">
      <div class="card-media">
        <span class="card-badge">${badgeFor(p)}</span>
        <img src="${esc(p.image)}" alt="${esc(pName(p))}" loading="lazy">
        <div class="veil"></div>
        <span class="card-view">${state.lang === 'ar' ? 'عرض' : 'View'} <span class="arrow">→</span></span>
      </div>
      <div class="card-info">
        <div class="card-brand">${esc(p.brand)}</div>
        <div class="card-name">${esc(pName(p))}</div>
        <div class="card-meta"><span class="card-price">${fmtPrice(p.price, p.currency)}</span></div>
      </div>
    </a>`;
}
function pageHead(titleHTML, sub) {
  return `<div class="page-head"><h1>${titleHTML}</h1>${sub ? `<p>${esc(sub)}</p>` : ''}</div>`;
}

/* ---------------- pages ---------------- */
async function renderHome(root) {
  let featured = [];
  try { featured = await api('/api/products?featured=1'); } catch { /* offline-safe */ }
  const marqueeItems = [t('marquee.1'), t('marquee.2'), t('marquee.3'), t('marquee.4')];
  const marqueeSeq = marqueeItems.map(m => `<span>${m}</span>`).join('');
  root.innerHTML = `
    <section class="hero">
      <div>
        <div class="hero-kicker"><span class="rule"></span><span class="label">${t('hero.kicker')}</span></div>
        <h1>${t('hero.title')}</h1>
        <p class="hero-sub">${t('hero.sub')}</p>
        <div class="hero-cta">
          <a class="btn btn-solid" href="#/shop">${t('hero.cta.shop')}<span class="arrow">→</span></a>
          <a class="btn btn-ghost" href="#/about">${t('hero.cta.about')}</a>
        </div>
      </div>
      <figure class="hero-figure">
        <div class="frame"><img src="/images/hero.jpg" alt="Org Luxury vault" loading="eager"></div>
        <figcaption class="caption">${t('hero.caption')}</figcaption>
      </figure>
    </section>

    <div class="marquee" aria-hidden="true">
      <div class="marquee-track">${marqueeSeq}${marqueeSeq}</div>
    </div>

    <section class="section">
      <div class="section-head">
        <h2>${t('featured.title')}</h2>
        <a class="more-link" href="#/shop">${t('featured.more')} <span class="arrow ${state.lang === 'ar' ? 'flip-rtl' : ''}">→</span></a>
      </div>
      <div class="product-grid stagger">${featured.map(cardHTML).join('')}</div>
    </section>

    <div class="brand-strip">
      <span>Rolex</span><span>Patek Philippe</span><span>Richard Mille</span>
      <span>Audemars Piguet</span><span>Cartier</span><span>Van Cleef &amp; Arpels</span>
    </div>

    <section class="section">
      <div class="about-wrap">
        <span class="label">${t('about.kicker')}</span>
        <h2 style="font-size:clamp(30px,4vw,52px);margin-top:14px">${t('home.story.title')}</h2>
        <p class="hero-sub" style="margin-inline:auto;margin-top:20px">${t('home.story.body')}</p>
        <div class="hero-cta" style="justify-content:center">
          <a class="btn btn-ghost" href="#/about">${t('home.story.cta')}</a>
        </div>
      </div>
    </section>`;
}

async function renderShop(root, category) {
  const cats = ['all', 'rolex', 'patek', 'richard-mille', 'vintage', 'jewelry'];
  let products = [];
  try { products = await api('/api/products' + (category && category !== 'all' ? `?category=${category}` : '')); }
  catch (e) { toast(e.message, true); }
  root.innerHTML = `
    ${pageHead(t('shop.title'), t('shop.sub'))}
    <section class="section" style="padding-top:28px">
      <div class="filter-bar">
        ${cats.map(c => `<a class="filter-chip ${c === category ? 'active' : ''}" href="#/shop/${c}">${t('filter.' + c)}</a>`).join('')}
      </div>
      ${products.length
        ? `<p class="label" style="margin-bottom:20px">${t('shop.count', { n: fmtNum(products.length) })}</p>
           <div class="product-grid">${products.map(cardHTML).join('')}</div>`
        : `<div class="empty-state"><span class="serif">—</span>${t('shop.empty')}</div>`}
    </section>`;
}

async function renderProduct(root, id) {
  let p;
  try { p = await api('/api/products/' + id); }
  catch {
    root.innerHTML = `<div class="section"><div class="empty-state"><span class="serif">404</span>${t('err.generic')}</div></div>`;
    return;
  }
  const oos = p.stock <= 0;
  const stockHTML = oos
    ? `<span class="badge badge-out">${t('product.outofstock')}</span>`
    : p.stock <= 3
      ? `<span class="badge badge-low"><span class="badge-dot"></span>${t('product.onlyLeft', { n: fmtNum(p.stock) })}</span>`
      : `<span class="badge badge-ok">${t('product.instock')}</span>`;
  root.innerHTML = `
    <section class="section">
      <a class="back-link" href="#/shop"><span class="${state.lang === 'ar' ? 'flip-rtl' : ''}">←</span> ${t('product.back')}</a>
      <div class="product-page">
        <div class="pd-media ${oos ? 'oos' : ''}"><img src="${esc(p.image)}" alt="${esc(pName(p))}"></div>
        <div class="pd-info">
          <span class="label">${esc(p.brand)}</span>
          <h1>${esc(pName(p))}</h1>
          <div class="pd-price">${fmtPrice(p.price, p.currency)}</div>
          ${stockHTML}
          <p class="pd-desc">${esc(pDesc(p))}</p>
          <dl class="pd-facts">
            <div><dt>${t('product.brand')}</dt><dd>${esc(p.brand)}</dd></div>
            <div><dt>${t('product.category')}</dt><dd>${t('cat.' + p.category)}</dd></div>
            <div><dt>${t('product.reference')}</dt><dd>OL-${String(p.id).padStart(4, '0')}</dd></div>
            <div><dt>${t('product.availability')}</dt><dd>${oos ? t('product.outofstock') : t('product.onlyLeft', { n: fmtNum(p.stock) })}</dd></div>
          </dl>
          <div class="pd-actions">
            ${oos
              ? `<button class="btn btn-terra" id="interestBtn">${t('product.interest')}</button>`
              : `<button class="btn btn-solid" id="addBtn">${t('product.add')}<span class="arrow">→</span></button>`}
            <a class="btn btn-ghost" target="_blank" rel="noopener"
               href="${waLink((state.lang === 'ar' ? 'مرحباً، أريد الاستفسار عن: ' : 'Hello, I am asking about: ') + p.name)}">WhatsApp</a>
          </div>
        </div>
      </div>
    </section>`;
  const addBtn = document.getElementById('addBtn');
  if (addBtn) addBtn.addEventListener('click', () => addToCart(p.id, 1));
  const iBtn = document.getElementById('interestBtn');
  if (iBtn) iBtn.addEventListener('click', () => openInterestModal(p));
}

function openInterestModal(p) {
  const ov = document.createElement('div');
  ov.className = 'modal-overlay';
  ov.innerHTML = `
    <div class="modal-card">
      <h3>${t('interest.title')}</h3>
      <p>${t('interest.sub')}</p>
      <div class="field"><label>${t('interest.name')}</label><input type="text" id="intName" maxlength="120"></div>
      <div class="field"><label>${t('interest.contact')}</label><input type="text" id="intContact" maxlength="160"></div>
      <div class="modal-actions">
        <button class="btn btn-ghost btn-small" id="intCancel">${state.lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
        <button class="btn btn-terra btn-small" id="intSubmit">${t('interest.submit')}</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  const close = () => ov.remove();
  ov.addEventListener('click', e => { if (e.target === ov) close(); });
  ov.querySelector('#intCancel').addEventListener('click', close);
  ov.querySelector('#intSubmit').addEventListener('click', async () => {
    const name = ov.querySelector('#intName').value.trim();
    const contact = ov.querySelector('#intContact').value.trim();
    if (!name || !contact) { toast(t('err.required'), true); return; }
    try {
      await api('/api/interest', { method: 'POST', body: JSON.stringify({ product_id: p.id, name, contact }) });
      close(); toast(t('interest.done'));
    } catch (e) { toast(e.message, true); }
  });
}

function renderAbout(root) {
  root.innerHTML = `
    <section class="section">
      <div class="about-wrap">
        <span class="label">${t('about.kicker')}</span>
        <div class="about-ar">نحن أسرة <strong>أورج</strong>. اتينا لكم بالفخامه من أيدينا الى ايديكم</div>
        <p class="about-en">${t('about.en')}</p>
        <p class="hero-sub" style="margin-inline:auto;margin-top:22px">${t('about.body')}</p>
        <div class="about-facts">
          <div><span class="num">${t('about.f1.num')}</span><span class="lbl">${t('about.f1.lbl')}</span></div>
          <div><span class="num">${t('about.f2.num')}</span><span class="lbl">${t('about.f2.lbl')}</span></div>
          <div><span class="num">${t('about.f3.num')}</span><span class="lbl">${t('about.f3.lbl')}</span></div>
        </div>
      </div>
    </section>`;
}

/* ---------------- checkout ---------------- */
const checkoutState = { location: '', payment: 'cod', newsletter: false };

async function renderCheckout(root) {
  if (state.cart.length === 0) {
    root.innerHTML = `<div class="section"><div class="empty-state"><span class="serif">${t('cart.empty')}</span>${t('cart.emptySub')}</div>
      <div style="text-align:center;margin-top:18px"><a class="btn btn-ghost" href="#/shop">${t('cart.continue')}</a></div></div>`;
    return;
  }
  let fees = { abudhabi: 15, emirates: 30, gcc: 80 };
  try { fees = await api('/api/shipping-fees'); state.fees = fees; } catch { /* use defaults */ }

  const locations = (state.config && state.config.locations) || [];
  const uae = locations.filter(l => l.group === 'uae');
  const gcc = locations.filter(l => l.group === 'gcc');

  root.innerHTML = `
    ${pageHead(t('co.title'))}
    <section class="section" style="padding-top:30px">
      <div class="checkout-grid">
        <form id="checkoutForm" novalidate>
          <h3 class="serif" style="font-size:26px;margin-bottom:18px">${t('co.contact')}</h3>
          <div class="form-grid">
            <div class="field"><label>${t('co.name')} *</label><input name="name" maxlength="120" required></div>
            <div class="field"><label>${t('co.phone')} *</label><input name="phone" type="tel" maxlength="60" required></div>
            <div class="field full"><label>${t('co.email')}</label><input name="email" type="email" maxlength="160"></div>
            <div class="field full">
              <label>${t('co.area')} *</label>
              <select name="location" id="coLocation" required>
                <option value="">${t('co.area.ph')}</option>
                <optgroup label="${t('co.group.uae')}">
                  ${uae.map(l => `<option value="${l.id}" data-zone="${l.zone}">${t('loc.' + l.id)}</option>`).join('')}
                </optgroup>
                <optgroup label="${t('co.group.gcc')}">
                  ${gcc.map(l => `<option value="${l.id}" data-zone="${l.zone}">${t('loc.' + l.id)}</option>`).join('')}
                </optgroup>
              </select>
            </div>
            <div class="field full"><label>${t('co.address')} *</label><textarea name="address" maxlength="400" required></textarea></div>
            <div class="field full"><label>${t('co.notes')}</label><textarea name="notes" maxlength="600" style="min-height:60px"></textarea></div>
          </div>

          <h3 class="serif" style="font-size:26px;margin:30px 0 16px">${t('co.payment')}</h3>
          <div class="pay-cards" id="payCards">
            ${['cod', 'applepay', 'visa'].map((m, i) => `
              <div class="pay-card ${i === 0 ? 'selected' : ''}" data-method="${m}" tabindex="0" role="radio" aria-checked="${i === 0}">
                <span class="radio"></span>
                <span><span class="pc-name">${t('pay.' + m)}</span><br><span class="pc-note">${t('pay.' + m + '.note')}</span></span>
              </div>`).join('')}
          </div>

          <label class="check-line" style="margin-top:22px">
            <input type="checkbox" id="coNews"> <span>${t('co.newsletter')}</span>
          </label>
        </form>

        <aside class="summary-card">
          <h3>${t('co.summary')}</h3>
          <div id="sumLines"></div>
          <div class="summary-totals">
            <div class="summary-line"><span>${t('co.subtotal')}</span><span class="val" id="sumSub"></span></div>
            <div class="summary-line"><span>${t('co.delivery')}</span><span class="val" id="sumFee"></span></div>
            <div class="summary-line"><span class="serif" style="font-size:20px">${t('co.total')}</span><span class="val grand" id="sumTotal"></span></div>
          </div>
          <p class="fx-note">${t('co.fx')}</p>
          <button class="btn btn-terra" id="placeOrder" style="width:100%;justify-content:center;margin-top:18px">${t('co.place')}<span class="arrow">→</span></button>
        </aside>
      </div>
    </section>`;

  const lines = await cartDetailed();
  const subtotal = lines.reduce((s, l) => s + priceInAED(l.product.price, l.product.currency) * l.qty, 0);
  document.getElementById('sumLines').innerHTML = lines.map(l => `
    <div class="summary-line">
      <span>${esc(pName(l.product))} × ${l.qty}</span>
      <span class="val">${fmtAED(priceInAED(l.product.price, l.product.currency) * l.qty)}</span>
    </div>`).join('');

  function refreshTotals() {
    const sel = document.getElementById('coLocation');
    const opt = sel.options[sel.selectedIndex];
    const zone = opt && opt.dataset ? opt.dataset.zone : null;
    const fee = zone && fees[zone] != null ? Number(fees[zone]) : 0;
    document.getElementById('sumSub').textContent = fmtAED(subtotal);
    document.getElementById('sumFee').textContent = zone ? (fee === 0 ? t('co.free') : fmtAED(fee)) : '—';
    document.getElementById('sumTotal').textContent = zone ? fmtAED(subtotal + fee) : fmtAED(subtotal);
  }
  refreshTotals();
  document.getElementById('coLocation').addEventListener('change', e => {
    checkoutState.location = e.target.value; refreshTotals();
  });
  document.querySelectorAll('.pay-card').forEach(card => {
    const pick = () => {
      document.querySelectorAll('.pay-card').forEach(c => { c.classList.remove('selected'); c.setAttribute('aria-checked', 'false'); });
      card.classList.add('selected'); card.setAttribute('aria-checked', 'true');
      checkoutState.payment = card.dataset.method;
    };
    card.addEventListener('click', pick);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
  });
  document.getElementById('coNews').addEventListener('change', e => { checkoutState.newsletter = e.target.checked; });

  document.getElementById('placeOrder').addEventListener('click', async () => {
    const form = document.getElementById('checkoutForm');
    const fd = new FormData(form);
    const payload = {
      customer_name: String(fd.get('name') || '').trim(),
      phone: String(fd.get('phone') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      address: String(fd.get('address') || '').trim(),
      notes: String(fd.get('notes') || '').trim(),
      location: checkoutState.location,
      payment_method: checkoutState.payment,
      newsletter: checkoutState.newsletter,
      items: state.cart.map(i => ({ product_id: i.id, qty: i.qty })),
    };
    if (!payload.customer_name || !payload.phone || !payload.address) { toast(t('err.required'), true); return; }
    if (!payload.location) { toast(t('err.area'), true); return; }
    if (!payload.payment_method) { toast(t('err.payment'), true); return; }
    const btn = document.getElementById('placeOrder');
    btn.disabled = true; btn.textContent = t('co.placing');
    try {
      const result = await api('/api/orders', { method: 'POST', body: JSON.stringify(payload) });
      state.cart = []; saveCart();
      sessionStorage.setItem('orglux_last_order', JSON.stringify(result));
      location.hash = '#/confirm/' + result.order_no;
    } catch (e) {
      toast(e.message || t('err.order'), true);
      btn.disabled = false; btn.innerHTML = `${t('co.place')}<span class="arrow">→</span>`;
    }
  });
}

/* ---------------- confirmation ---------------- */
async function renderConfirm(root, orderNo) {
  let order = null;
  try { order = await api('/api/orders/' + encodeURIComponent(orderNo)); } catch { /* fall back */ }
  const cached = sessionStorage.getItem('orglux_last_order');
  const last = cached ? JSON.parse(cached) : null;
  const method = (order && order.payment_method) || (last && last.payment_method) || 'cod';
  const isCOD = method === 'cod';
  const waMsg = state.lang === 'ar'
    ? `مرحباً أورج لاكجري، طلبي رقم ${orderNo}`
    : `Hello Org Luxury, my order is ${orderNo}`;
  root.innerHTML = `
    <section class="section">
      <div class="confirm-wrap">
        <div class="confirm-seal">✦</div>
        <h1>${t('confirm.title')}</h1>
        <div class="order-no">${t('confirm.orderNo', { no: esc(orderNo) })}</div>
        ${order ? `
        <div class="confirm-box">
          <div class="label" style="margin-bottom:10px">${t('confirm.items')}</div>
          ${order.items.map(i => `<div class="summary-line"><span>${esc(state.lang === 'ar' ? i.name : i.name)} × ${i.qty}</span><span class="val">${fmtPrice(i.price, i.currency)}</span></div>`).join('')}
          <div class="summary-totals">
            <div class="summary-line"><span>${t('co.subtotal')}</span><span class="val">${fmtAED(order.subtotal)}</span></div>
            <div class="summary-line"><span>${t('co.delivery')} · ${esc(t('loc.' + order.location))}</span><span class="val">${order.shipping_fee === 0 ? t('co.free') : fmtAED(order.shipping_fee)}</span></div>
            <div class="summary-line"><span class="serif" style="font-size:20px">${t('co.total')}</span><span class="val grand">${fmtAED(order.total)}</span></div>
          </div>
        </div>` : ''}
        <p class="confirm-note">${isCOD ? t('confirm.cod') : t('confirm.card')}</p>
        <div class="confirm-actions">
          <a class="btn btn-terra" target="_blank" rel="noopener" href="${waLink(waMsg)}">${t('confirm.whats')}</a>
          <a class="btn btn-ghost" href="#/shop">${t('confirm.continue')}</a>
        </div>
      </div>
    </section>`;
}

/* ---------------- router ---------------- */
function parseHash() {
  const h = location.hash.replace(/^#\/?/, '');
  const parts = h.split('/').filter(Boolean);
  return parts;
}
async function route() {
  const parts = parseHash();
  const root = document.getElementById('app');
  closeCart();

  // admin routes handled by admin.js
  if (parts[0] === 'admin') {
    if (window.Admin && window.Admin.render) { window.Admin.render(root, parts.slice(1)); return; }
  }

  document.querySelectorAll('.main-nav a').forEach(a => {
    const href = a.getAttribute('href');
    a.classList.toggle('active',
      (href === '#/' && parts.length === 0) ||
      (href === '#/shop' && parts[0] === 'shop') ||
      (href === '#/about' && parts[0] === 'about'));
  });

  window.scrollTo({ top: 0, behavior: 'instant' });
  try {
    if (parts.length === 0) await renderHome(root);
    else if (parts[0] === 'shop') await renderShop(root, parts[1] || 'all');
    else if (parts[0] === 'product') await renderProduct(root, Number(parts[1]));
    else if (parts[0] === 'about') renderAbout(root);
    else if (parts[0] === 'checkout') await renderCheckout(root);
    else if (parts[0] === 'confirm') await renderConfirm(root, parts[1] || '');
    else if (parts[0] === 'admin') { /* handled above */ }
    else await renderHome(root);
  } catch (e) {
    console.error(e);
    root.innerHTML = `<div class="section"><div class="empty-state"><span class="serif">!</span>${esc(e.message || t('err.generic'))}</div></div>`;
  }
}

/* ---------------- init ---------------- */
async function init() {
  try { state.config = await api('/api/config'); } catch { state.config = null; }
  applyLang();
  renderCartCount();

  document.getElementById('langToggle').addEventListener('click', () => {
    setLang(state.lang === 'en' ? 'ar' : 'en');
    toast(t('toast.lang'));
  });
  document.getElementById('cartButton').addEventListener('click', openCart);
  document.getElementById('cartClose').addEventListener('click', closeCart);
  document.getElementById('drawerOverlay').addEventListener('click', closeCart);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });

  // shared surface for admin.js / chatbot.js (must exist before first route)
  window.OrgLux = { t, esc, api, fmtPrice, fmtAED, fmtNum, pName, pDesc, waLink, toast, state, addToCart, applyLang };

  window.addEventListener('hashchange', route);
  await route();
}
document.addEventListener('DOMContentLoaded', init);
