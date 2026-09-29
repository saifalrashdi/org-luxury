'use strict';
/* ============================================================
   Org Luxury — chat assistant (rule-based, bilingual, no AI API)
   Answers delivery fees (live), payments, order status, stock
   interest, brand story, language switching; searches the live
   product catalog and replies with product cards.
   ============================================================ */
(function () {
  const C = {
    en: {
      title: 'Org Concierge', sub: 'Always here — EN / عربي',
      hello: 'Ahlan! I am the Org concierge. Ask me about delivery fees, payment methods, a watch you are hunting, or our story.',
      chips: ['Delivery fees', 'Payment methods', 'Track my order', 'Rolex', 'Our story'],
      fees: 'Here are our live delivery fees:',
      feesZones: { abudhabi: 'Abu Dhabi city', emirates: 'Other Emirates', gcc: 'Other GCC countries' },
      feesFree: 'free',
      feesOutro: 'The fee is added automatically at checkout once you pick your delivery area.',
      pay: 'Three ways to pay:\n• Cash on Delivery — pay when your piece arrives.\n• Apple Pay — we send a secure payment link on WhatsApp.\n• VISA card — same secure link via WhatsApp.\nWe never charge your card online.',
      track: 'For live order updates, message us on WhatsApp with your order number and the family will reply personally.',
      stock: 'If a piece shows "Out of stock", open its page and tap "I\'m interested — notify me". Leave your name and contact, and we will reach out first when a similar piece enters the vault.',
      story: 'We are the Org family — dealers-run, not a faceless company. We hunt, verify and price every piece ourselves. From our hands to yours. More on the About page.',
      lang: 'Use the عربي / EN button in the header — the whole boutique flips between English and Arabic, and remembers your choice.',
      found: 'I found this in the vault for you:',
      notFound: 'Nothing in the vault matches that right now. Try a brand like Rolex, Patek Philippe or Richard Mille — or ask me anything else.',
      fallback: 'I am a simple concierge and did not quite catch that. For anything specific, the family answers personally on WhatsApp — or try one of the chips below.',
      placeholder: 'Ask about a watch, delivery, payment…',
      whats: 'WhatsApp us',
      viewPiece: 'View piece',
      outNow: 'out of stock — notify-me available',
    },
    ar: {
      title: 'كونسيرج أورج', sub: 'دائماً هنا — EN / عربي',
      hello: 'أهلاً! أنا كونسيرج أورج. اسألني عن رسوم التوصيل، طرق الدفع، ساعة تبحث عنها، أو قصتنا.',
      chips: ['رسوم التوصيل', 'طرق الدفع', 'تتبع طلبي', 'رولكس', 'قصتنا'],
      fees: 'هذه رسوم التوصيل الحالية لدينا:',
      feesZones: { abudhabi: 'مدينة أبوظبي', emirates: 'الإمارات الأخرى', gcc: 'دول الخليج الأخرى' },
      feesFree: 'مجاني',
      feesOutro: 'تُضاف الرسوم تلقائياً عند إتمام الطلب فور اختيار منطقة التوصيل.',
      pay: 'ثلاث طرق للدفع:\n• الدفع عند الاستلام — ادفع عند وصول قطعتك.\n• آبل باي — نرسل رابط دفع آمن عبر واتساب.\n• بطاقة فيزا — نفس الرابط الآمن عبر واتساب.\nلا نخصم من بطاقتك عبر الموقع أبداً.',
      track: 'لتحديثات الطلب المباشرة، راسلنا على واتساب مع رقم طلبك وسترد عليك العائلة شخصياً.',
      stock: 'إذا ظهرت القطعة «نفدت الكمية»، افتح صفحتها واضغط «مهتم — أعلمني عند التوفر». اترك اسمك وبياناتك وسنتواصل معك أولاً عند دخول قطعة مشابهة إلى الخزانة.',
      story: 'نحن أسرة أورج — يديرها تجّار لا شركة بلا وجه. نبحث ونوثّق ونسعّر كل قطعة بأنفسنا. من أيدينا إلى أيديكم. المزيد في صفحة قصتنا.',
      lang: 'استخدم زر عربي / EN في الأعلى — المتجر كله يتحول بين العربية والإنجليزية، ويتذكر اختيارك.',
      found: 'وجدت هذا في الخزانة لك:',
      notFound: 'لا شيء في الخزانة يطابق طلبك حالياً. جرّب ماركة مثل رولكس أو باتيك فيليب أو ريتشارد ميل — أو اسألني عن أي شيء آخر.',
      fallback: 'أنا كونسيرج بسيط ولم أفهم قصدك تماماً. لأي استفسار محدد، العائلة ترد شخصياً على واتساب — أو جرّب أحد الأزرار أدناه.',
      placeholder: 'اسأل عن ساعة، التوصيل، الدفع…',
      whats: 'راسلنا على واتساب',
      viewPiece: 'عرض القطعة',
      outNow: 'نفدت — يمكنك التسجيل للإعلام',
    },
  };

  let open = false;
  let booted = false;

  function lang() { return (window.OrgLux && OrgLux.state.lang) || 'en'; }
  function s(key) { return C[lang()][key]; }
  function esc(x) { return window.OrgLux ? OrgLux.esc(x) : String(x); }

  /* ---------- DOM ---------- */
  function build() {
    const fab = document.createElement('button');
    fab.className = 'chat-fab'; fab.id = 'chatFab'; fab.setAttribute('aria-label', 'Chat');
    fab.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
      <path d="M21 12c0 4.4-4 8-9 8-1.2 0-2.4-.2-3.4-.6L3 20l1.3-4.1C3.5 14.6 3 13.4 3 12c0-4.4 4-8 9-8s9 3.6 9 8z"/>
      <circle cx="8.5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="12" r="1" fill="currentColor" stroke="none"/></svg>`;

    const panel = document.createElement('div');
    panel.className = 'chat-panel'; panel.id = 'chatPanel';
    panel.innerHTML = `
      <div class="chat-head"><img src="/images/logo.png" alt="" class="chat-logo"><div><div class="ch-title"></div><div class="ch-sub"></div></div></div>
      <div class="chat-log" id="chatLog"></div>
      <div class="chat-chips" id="chatChips"></div>
      <div class="chat-input-row">
        <input id="chatInput" type="text" maxlength="300">
        <button class="chat-send" id="chatSend" aria-label="Send">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
        </button>
      </div>`;
    document.body.appendChild(fab);
    document.body.appendChild(panel);

    fab.addEventListener('click', () => { open = !open; panel.classList.toggle('open', open); if (open) greet(); });
    document.getElementById('chatSend').addEventListener('click', send);
    document.getElementById('chatInput').addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
    refreshChrome();
  }
  function refreshChrome() {
    const p = document.getElementById('chatPanel');
    if (!p) return;
    p.querySelector('.ch-title').textContent = s('title');
    p.querySelector('.ch-sub').textContent = s('sub');
    document.getElementById('chatInput').placeholder = s('placeholder');
    renderChips();
  }
  function renderChips() {
    document.getElementById('chatChips').innerHTML =
      s('chips').map(c => `<button class="chat-chip">${esc(c)}</button>`).join('');
    document.querySelectorAll('.chat-chip').forEach(ch =>
      ch.addEventListener('click', () => handleUser(ch.textContent)));
  }

  /* ---------- messages ---------- */
  function addMsg(html, who) {
    const log = document.getElementById('chatLog');
    const el = document.createElement('div');
    el.className = 'chat-msg ' + who;
    el.innerHTML = html;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }
  function typingOn() {
    const log = document.getElementById('chatLog');
    const el = document.createElement('div');
    el.className = 'chat-msg bot'; el.id = 'chatTyping';
    el.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
    log.appendChild(el); log.scrollTop = log.scrollHeight;
  }
  function typingOff() { const el = document.getElementById('chatTyping'); if (el) el.remove(); }
  function botReply(html, delay = 600) {
    typingOn();
    setTimeout(() => { typingOff(); addMsg(html, 'bot'); }, delay);
  }
  function greet() {
    refreshChrome();
    if (booted) return;
    booted = true;
    botReply(esc(s('hello')), 500);
  }
  function waHTML() {
    const url = window.OrgLux ? OrgLux.waLink(lang() === 'ar' ? 'مرحباً أورج لاكجري' : 'Hello Org Luxury') : '#';
    return `<a href="${url}" target="_blank" rel="noopener">${esc(s('whats'))}</a>`;
  }

  /* ---------- intents ---------- */
  const norm = str => str.toLowerCase().trim()
    .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ');
  // naive plural handling: watches→watch, pieces→piece, etc.
  const singular = w => w.replace(/(es|s)$/i, m => (m.toLowerCase() === 'es' ? '' : ''));

  const KEYWORDS = {
    fees: ['delivery', 'shipping', 'fee', 'fees', 'deliver', 'ship', 'توصيل', 'شحن', 'رسوم', 'تكلفه'],
    pay: ['pay', 'payment', 'apple', 'visa', 'card', 'cash', 'cod', 'دفع', 'فيزا', 'بطاقه', 'ابل', 'نقد', 'كاش'],
    track: ['track', 'status', 'order', 'where', 'طلب', 'تتبع', 'حاله', 'وين'],
    stock: ['stock', 'available', 'notify', 'interested', 'sold', 'out', 'متوفر', 'نفد', 'اعلمني', 'مهتم', 'خلص'],
    story: ['story', 'about', 'who', 'family', 'org', 'قصه', 'من', 'عائله', 'اسره', 'اورج'],
    lang: ['language', 'arabic', 'english', 'switch', 'عربي', 'انجليزي', 'لغه'],
    greet: ['hi', 'hello', 'hey', 'salam', 'مرحبا', 'اهلا', 'هلا', 'سلام'],
  };
  const BRANDS = ['rolex', 'patek', 'philippe', 'richard', 'mille', 'audemars', 'piguet', 'omega',
    'cartier', 'vacheron', 'bulgari', 'van', 'cleef', 'رولكس', 'باتيك', 'فيليب', 'ريتشارد', 'ميل',
    'كارتييه', 'اوميغا', 'بولغاري'];
  const GENERIC = ['watch', 'watche', 'ring', 'bracelet', 'necklace', 'jewelry', 'jewellery', 'gold',
    'ساعه', 'ساعات', 'خاتم', 'سوار', 'قلاده', 'مجوهرات', 'ذهب'];

  async function answer(text) {
    const words = norm(text).split(' ').filter(Boolean);
    const has = list => words.some(w => list.includes(w) || list.includes(singular(w)));

    if (has(KEYWORDS.greet) && words.length <= 3) return botReply(esc(s('hello')));

    if (has(KEYWORDS.fees)) {
      try {
        const fees = await (await fetch('/api/shipping-fees')).json();
        const zones = s('feesZones');
        const lines = Object.keys(zones).map(z =>
          `• ${zones[z]}: ${Number(fees[z]) === 0 ? s('feesFree') : Number(fees[z]).toLocaleString() + ' AED'}`).join('<br>');
        return botReply(`${esc(s('fees'))}<br>${lines}<br><br>${esc(s('feesOutro'))}`);
      } catch { return botReply(esc(s('fallback')) + '<br>' + waHTML()); }
    }
    if (has(KEYWORDS.pay)) return botReply(esc(s('pay')).replace(/\n/g, '<br>'));
    if (has(KEYWORDS.track)) return botReply(esc(s('track')) + '<br><br>' + waHTML());
    if (has(KEYWORDS.stock)) return botReply(esc(s('stock')));
    if (has(KEYWORDS.story)) {
      return botReply(esc(s('story')) + `<br><br><a href="#/about">${esc(lang() === 'ar' ? 'صفحة قصتنا' : 'About page')}</a>`);
    }
    if (has(KEYWORDS.lang)) return botReply(esc(s('lang')));

    // product search: any brand/generic word, or 2+ word query → search catalog
    const isSearch = has(BRANDS) || has(GENERIC.map(singular)) || words.length >= 2;
    if (isSearch) {
      const q = words.filter(w => !['the', 'a', 'an', 'for', 'me', 'show', 'find', 'want', 'do', 'you', 'have', 'ابحث', 'عندكم', 'اريد', 'في', 'هل'].includes(w))
        .map(singular).join(' ');
      try {
        let results = await (await fetch('/api/products?q=' + encodeURIComponent(q))).json();
        if (results.length === 0) {
          // try each word alone (plural-stripped)
          for (const w of words.map(singular)) {
            if (w.length < 3) continue;
            results = await (await fetch('/api/products?q=' + encodeURIComponent(w))).json();
            if (results.length) break;
          }
        }
        if (results.length) {
          const cards = results.slice(0, 3).map(p => `
            <a class="chat-product" href="#/product/${p.id}">
              <img src="${esc(p.image)}" alt="">
              <span><span class="cp-name">${esc(OrgLux.pName(p))}</span><br>
              <span class="cp-price">${OrgLux.fmtPrice(p.price, p.currency)}</span>
              ${p.stock <= 0 ? `<br><span style="font-size:11px;color:var(--ink-faint)">${esc(s('outNow'))}</span>` : ''}</span>
            </a>`).join('');
          return botReply(esc(s('found')) + cards);
        }
        return botReply(esc(s('notFound')));
      } catch { return botReply(esc(s('fallback')) + '<br>' + waHTML()); }
    }
    return botReply(esc(s('fallback')) + '<br>' + waHTML());
  }

  function handleUser(text) {
    if (!text.trim()) return;
    addMsg(esc(text), 'user');
    answer(text);
  }
  function send() {
    const input = document.getElementById('chatInput');
    handleUser(input.value);
    input.value = '';
  }

  document.addEventListener('DOMContentLoaded', () => {
    build();
    // re-translate chrome on language switch
    const lt = document.getElementById('langToggle');
    if (lt) lt.addEventListener('click', () => setTimeout(refreshChrome, 50));
  });
})();
