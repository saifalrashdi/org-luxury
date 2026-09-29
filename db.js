'use strict';
/**
 * db.js — SQLite layer for Org Luxury.
 * - Auto-creates the database file on first run.
 * - Creates tables, runs lightweight migrations (PRAGMA table_info + ALTER TABLE),
 *   and seeds ~20 sample products + default shipping fees when empty.
 */
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'orglux.db');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/* ------------------------------------------------------------------ */
/* Schema                                                              */
/* ------------------------------------------------------------------ */
db.exec(`
CREATE TABLE IF NOT EXISTS products (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  name_ar       TEXT DEFAULT '',
  brand         TEXT DEFAULT '',
  category      TEXT NOT NULL DEFAULT 'watches',
  price         REAL NOT NULL DEFAULT 0,
  currency      TEXT NOT NULL DEFAULT 'AED',
  stock         INTEGER NOT NULL DEFAULT 0,
  description   TEXT DEFAULT '',
  description_ar TEXT DEFAULT '',
  image         TEXT DEFAULT '',
  featured      INTEGER NOT NULL DEFAULT 0,
  hidden        INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  order_no       TEXT NOT NULL UNIQUE,
  customer_name  TEXT NOT NULL,
  phone          TEXT NOT NULL,
  email          TEXT DEFAULT '',
  address        TEXT NOT NULL,
  notes          TEXT DEFAULT '',
  location       TEXT NOT NULL,
  shipping_zone  TEXT NOT NULL,
  shipping_fee   REAL NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL,
  newsletter     INTEGER NOT NULL DEFAULT 0,
  subtotal       REAL NOT NULL DEFAULT 0,
  total          REAL NOT NULL DEFAULT 0,
  status         TEXT NOT NULL DEFAULT 'pending',
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER,
  name       TEXT NOT NULL,
  price      REAL NOT NULL,
  currency   TEXT NOT NULL DEFAULT 'AED',
  qty        INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS interest_requests (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  name       TEXT NOT NULL,
  contact    TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS shipping_fees (
  zone TEXT PRIMARY KEY,
  fee  REAL NOT NULL DEFAULT 0
);
`);

/* ------------------------------------------------------------------ */
/* Lightweight migrations: add columns that older databases may lack.  */
/* ------------------------------------------------------------------ */
function ensureColumn(table, column, ddl) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name);
  if (!cols.includes(column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
    console.log(`[db] migration: added ${table}.${column}`);
  }
}
ensureColumn('products', 'name_ar', "name_ar TEXT DEFAULT ''");
ensureColumn('products', 'description_ar', "description_ar TEXT DEFAULT ''");
ensureColumn('products', 'currency', "currency TEXT NOT NULL DEFAULT 'AED'");
ensureColumn('products', 'featured', 'featured INTEGER NOT NULL DEFAULT 0');
ensureColumn('products', 'hidden', 'hidden INTEGER NOT NULL DEFAULT 0');
ensureColumn('orders', 'payment_method', "payment_method TEXT NOT NULL DEFAULT 'cod'");
ensureColumn('orders', 'newsletter', 'newsletter INTEGER NOT NULL DEFAULT 0');
ensureColumn('orders', 'shipping_zone', "shipping_zone TEXT NOT NULL DEFAULT 'abudhabi'");
ensureColumn('orders', 'location', "location TEXT NOT NULL DEFAULT ''");
ensureColumn('orders', 'shipping_fee', 'shipping_fee REAL NOT NULL DEFAULT 0');
ensureColumn('orders', 'subtotal', 'subtotal REAL NOT NULL DEFAULT 0');
ensureColumn('orders', 'status', "status TEXT NOT NULL DEFAULT 'pending'");

/* ------------------------------------------------------------------ */
/* Shipping zones + delivery locations                                 */
/* ------------------------------------------------------------------ */
const LOCATIONS = [
  { id: 'abu-dhabi',      group: 'uae',   zone: 'abudhabi' },
  { id: 'dubai',          group: 'uae',   zone: 'emirates' },
  { id: 'sharjah',        group: 'uae',   zone: 'emirates' },
  { id: 'ajman',          group: 'uae',   zone: 'emirates' },
  { id: 'ras-al-khaimah', group: 'uae',   zone: 'emirates' },
  { id: 'fujairah',       group: 'uae',   zone: 'emirates' },
  { id: 'umm-al-quwain',  group: 'uae',   zone: 'emirates' },
  { id: 'saudi-arabia',   group: 'gcc',   zone: 'gcc' },
  { id: 'kuwait',         group: 'gcc',   zone: 'gcc' },
  { id: 'qatar',          group: 'gcc',   zone: 'gcc' },
  { id: 'bahrain',        group: 'gcc',   zone: 'gcc' },
  { id: 'oman',           group: 'gcc',   zone: 'gcc' },
];
const ZONES = ['abudhabi', 'emirates', 'gcc'];

/* Fixed display rates → AED (pegged/indicative, no external APIs). */
const FX_TO_AED = { AED: 1, USD: 3.6725, EUR: 3.95, GBP: 4.65, SAR: 0.979, KWD: 11.96, QAR: 1.009, BHD: 9.74, OMR: 9.54, CHF: 4.1 };

function seedShippingFees() {
  const count = db.prepare('SELECT COUNT(*) AS c FROM shipping_fees').get().c;
  if (count === 0) {
    const ins = db.prepare('INSERT INTO shipping_fees (zone, fee) VALUES (?, ?)');
    ins.run('abudhabi', 15);
    ins.run('emirates', 30);
    ins.run('gcc', 80);
    console.log('[db] seeded shipping fees: abudhabi=15, emirates=30, gcc=80 AED');
  }
}

/* ------------------------------------------------------------------ */
/* Seed products                                                       */
/* ------------------------------------------------------------------ */
const SEED_PRODUCTS = [
  { name: 'Rolex Submariner Date 16610 "Kermit"', name_ar: 'رولكس سابمارينر ديت 16610 «كيرميت»', brand: 'Rolex', category: 'rolex', price: 58000, currency: 'AED', stock: 2, featured: 1, image: '/images/products/p01.jpg',
    description: '50th-anniversary Submariner with green aluminium bezel insert, Mark I dial, full set with box and papers, 2004.',
    description_ar: 'سابمارينر الذكرى الخمسون بإطار أخضر من الألومنيوم، قرص مارك I، طقم كامل مع العلبة والأوراق، ٢٠٠٤.' },
  { name: 'Rolex Cosmograph Daytona 116520 White', name_ar: 'رولكس كوزموغراف دايتونا 116520 أبيض', brand: 'Rolex', category: 'rolex', price: 112000, currency: 'AED', stock: 1, featured: 1, image: '/images/products/p02.jpg',
    description: 'Final series of the in-house 4130 debut reference. White dial, steel bezel, unpolished case, 2012.',
    description_ar: 'السلسلة الأخيرة من مرجع كاليبر ٤١٣٠ الداخلي. قرص أبيض، إطار فولاذي، علبة غير مصقولة، ٢٠١٢.' },
  { name: 'Rolex Datejust 36 1601 Linen Dial, 1972', name_ar: 'رولكس ديت جاست ٣٦ 1601 قرص كتاني، ١٩٧٢', brand: 'Rolex', category: 'rolex', price: 9800, currency: 'USD', stock: 3, featured: 0, image: '/images/products/p03.jpg',
    description: 'Rare silver linen-texture dial, fluted white-gold bezel, serviced movement, excellent vintage condition.',
    description_ar: 'قرص فضي نادر بنقشة الكتان، إطار مخدد من الذهب الأبيض، حركة مشمولة بالصيانة، حالة فينتاج ممتازة.' },
  { name: 'Rolex GMT-Master II 16710 "Pepsi"', name_ar: 'رولكس GMT ماستر II 16710 «بيبسي»', brand: 'Rolex', category: 'rolex', price: 64500, currency: 'AED', stock: 1, featured: 1, image: '/images/products/p04.jpg',
    description: 'Iconic red/blue "Pepsi" bezel, solid-link Oyster bracelet, recently serviced, 2006 papers.',
    description_ar: 'إطار «بيبسي» الأيقوني باللونين الأحمر والأزرق، سوار أويستر بوصلات صلبة، صيانتها حديثة، أوراق ٢٠٠٦.' },
  { name: 'Rolex Day-Date 1803 Yellow Gold, 1977', name_ar: 'رولكس داي ديت 1803 ذهب أصفر، ١٩٧٧', brand: 'Rolex', category: 'rolex', price: 24500, currency: 'USD', stock: 1, featured: 0, image: '/images/products/p05.jpg',
    description: 'The "President" in 18k yellow gold, champagne pie-pan dial, matching President bracelet, sharp case lines.',
    description_ar: '«الرئيس» من الذهب الأصفر عيار ١٨، قرص شمبين باي-بان، سوار برزيدنت مطابق، خطوط علبة حادة.' },
  { name: 'Patek Philippe Nautilus 5711/1A Blue', name_ar: 'باتيك فيليب نوتيلوس 5711/1A أزرق', brand: 'Patek Philippe', category: 'patek', price: 385000, currency: 'AED', stock: 1, featured: 1, image: '/images/products/p06.jpg',
    description: 'The grail: discontinued 5711 with blue graduated dial, full collector set, unworn stickers removed 2021.',
    description_ar: 'التحفة المرغوبة: 5711 المتوقف إنتاجها بقرص أزرق متدرج، طقم هواة كامل، ٢٠٢١.' },
  { name: 'Patek Philippe Calatrava 5196J', name_ar: 'باتيك فيليب كالاترافا 5196J', brand: 'Patek Philippe', category: 'patek', price: 19200, currency: 'USD', stock: 2, featured: 0, image: '/images/products/p07.jpg',
    description: 'Pure dress watch in 18k yellow gold, 37mm, manual-wind calibre 215 PS, cream lacquered dial.',
    description_ar: 'ساعة رسمية نقية من الذهب الأصفر عيار ١٨، ٣٧ ملم، كاليبر يدوي 215 PS، قرص كريمي مطلي.' },
  { name: 'Patek Philippe Aquanaut 5167A', name_ar: 'باتيك فيليب أكوانوت 5167A', brand: 'Patek Philippe', category: 'patek', price: 168000, currency: 'AED', stock: 1, featured: 0, image: '/images/products/p08.jpg',
    description: 'Steel Aquanaut on tropical composite strap, embossed black dial, 2019 full set.',
    description_ar: 'أكوانوت فولاذية على سوار مركب تروبيكال، قرص أسود منقوش، طقم كامل ٢٠١٩.' },
  { name: 'Richard Mille RM 010 Titanium', name_ar: 'ريتشارد ميل RM 010 تيتانيوم', brand: 'Richard Mille', category: 'richard-mille', price: 720000, currency: 'AED', stock: 1, featured: 1, image: '/images/products/p09.jpg',
    description: 'Tonneau case in grade-5 titanium, skeletonised automatic RMAS7, variable-geometry rotor.',
    description_ar: 'علبة تونو من التيتانيوم درجة ٥، حركة أوتوماتيكية مفرّغة RMAS7، دوّار بهندسة متغيرة.' },
  { name: 'Richard Mille RM 011 Felipe Massa', name_ar: 'ريتشارد ميل RM 011 فيليبي ماسا', brand: 'Richard Mille', category: 'richard-mille', price: 890000, currency: 'AED', stock: 0, featured: 0, image: '/images/products/p10.jpg',
    description: 'Flyback chronograph with annual calendar, black DLC titanium case, the definitive early RM.',
    description_ar: 'كرونوغراف فلاي باك مع تقويم سنوي، علبة تيتانيوم DLC سوداء، من أيقونات ريتشارد ميل المبكرة.' },
  { name: 'Audemars Piguet Royal Oak 15400ST', name_ar: 'أوديمار بيغيه رويال أوك 15400ST', brand: 'Audemars Piguet', category: 'vintage', price: 145000, currency: 'AED', stock: 2, featured: 0, image: '/images/products/p11.jpg',
    description: '41mm steel Royal Oak, black "Grande Tapisserie" dial, 2017 full set, sharp edges throughout.',
    description_ar: 'رويال أوك فولاذية ٤١ ملم، قرص أسود «غراند تابيسري»، طقم كامل ٢٠١٧، حواف حادة.' },
  { name: 'Omega Speedmaster Professional 3570.50', name_ar: 'أوميغا سبيدماستر بروفيشنال 3570.50', brand: 'Omega', category: 'vintage', price: 5400, currency: 'USD', stock: 4, featured: 0, image: '/images/products/p12.jpg',
    description: 'The classic Moonwatch, hesalite crystal, calibre 1861, on steel bracelet with box.',
    description_ar: 'ساعة القمر الكلاسيكية، زجاج هيسالايت، كاليبر ١٨٦١، على سوار فولاذي مع العلبة.' },
  { name: 'Cartier Tank Louis Small, Rose Gold', name_ar: 'كارتييه تانك لوي صغيرة، ذهب وردي', brand: 'Cartier', category: 'vintage', price: 42000, currency: 'AED', stock: 2, featured: 0, image: '/images/products/p13.jpg',
    description: '18k rose-gold Tank Louis Cartier, silvered beaded dial, manual movement, blue cabochon crown.',
    description_ar: 'تانك لوي كارتييه من الذهب الوردي عيار ١٨، قرص فضي مخرّم، حركة يدوية، تاج كابوشون أزرق.' },
  { name: 'Vacheron Constantin Patrimony 81180', name_ar: 'فاشيرون كونستانتين باتريموني 81180', brand: 'Vacheron Constantin', category: 'vintage', price: 68000, currency: 'AED', stock: 1, featured: 0, image: '/images/products/p14.jpg',
    description: 'Ultra-thin 40mm in 18k pink gold, hand-wound calibre 1400 with Geneva Seal.',
    description_ar: 'فائقة الرقة ٤٠ ملم من الذهب الوردي عيار ١٨، كاليبر يدوي ١٤٠٠ بختم جنيف.' },
  { name: 'Rolex Oyster Perpetual 36 "Turquoise"', name_ar: 'رولكس أويستر بيربتشوال ٣٦ «فيروزي»', brand: 'Rolex', category: 'rolex', price: 71000, currency: 'AED', stock: 0, featured: 0, image: '/images/products/p15.jpg',
    description: 'Cult "Tiffany" turquoise lacquer dial, discontinued 2022, one of the most sought-after modern OPs.',
    description_ar: 'قرص لاكر فيروزي «تيفاني» الشهير، توقف إنتاجها ٢٠٢٢، من أكثر أويستر بيربتشوال الحديثة طلباً.' },
  { name: 'Cartier Love Bracelet, Yellow Gold', name_ar: 'سوار كارتييه لوف، ذهب أصفر', brand: 'Cartier', category: 'jewelry', price: 24500, currency: 'AED', stock: 5, featured: 1, image: '/images/products/p16.jpg',
    description: 'Classic 18k yellow-gold Love bracelet, size 17, with screwdriver, box and certificate.',
    description_ar: 'سوار لوف الكلاسيكي من الذهب الأصفر عيار ١٨، مقاس ١٧، مع المفك والعلبة والشهادة.' },
  { name: 'Van Cleef & Arpels Alhambra Necklace', name_ar: 'قلادة فان كليف أند آربلز ألهامبرا', brand: 'Van Cleef & Arpels', category: 'jewelry', price: 19800, currency: 'AED', stock: 3, featured: 0, image: '/images/products/p17.jpg',
    description: 'Vintage Alhambra pendant, 18k yellow gold with carnelian clover motif, full set.',
    description_ar: 'قلادة ألهامبرا فينتاج، ذهب أصفر عيار ١٨ مع نقشة البرسيم من العقيق، طقم كامل.' },
  { name: 'Bulgari Serpenti Tubogas 35mm', name_ar: 'بولغاري سيربنتي توبوغاس ٣٥ ملم', brand: 'Bulgari', category: 'jewelry', price: 56000, currency: 'AED', stock: 1, featured: 0, image: '/images/products/p18.jpg',
    description: 'Single-spiral Serpenti Tubogas in steel and rose gold, diamond-set head, opaline dial.',
    description_ar: 'سيربنتي توبوغاس بلفة واحدة من الفولاذ والذهب الوردي، رأس مرصع بالألماس، قرص أوبالين.' },
  { name: 'Vintage Diamond Cocktail Ring, 1960s', name_ar: 'خاتم كوكتيل فينتاج بالألماس، ستينيات', brand: 'Estate', category: 'jewelry', price: 12500, currency: 'USD', stock: 1, featured: 0, image: '/images/products/p19.jpg',
    description: 'Estate piece: 18k white gold, centre old-European-cut diamond ~1.2ct with calibre-cut sapphire halo.',
    description_ar: 'قطعة إستيت: ذهب أبيض عيار ١٨، ألماسة مركزية بقطع أوروبي قديم ~١.٢ قيراط بهالة ياقوت.' },
  { name: 'Patek Philippe Pocket Watch 18k, 1948', name_ar: 'ساعة جيب باتيك فيليب ذهب ١٨ قيراط، ١٩٤٨', brand: 'Patek Philippe', category: 'patek', price: 34000, currency: 'USD', stock: 1, featured: 0, image: '/images/products/p20.jpg',
    description: 'Hunter-case pocket watch in 18k yellow gold, enamel-white dial, archive extract included.',
    description_ar: 'ساعة جيب بغلاف هانتر من الذهب الأصفر عيار ١٨، قرص أبيض مينائي، مع مستخرج الأرشيف.' },
];

function seedProducts() {
  const count = db.prepare('SELECT COUNT(*) AS c FROM products').get().c;
  if (count > 0) return;
  const ins = db.prepare(`INSERT INTO products
    (name, name_ar, brand, category, price, currency, stock, description, description_ar, image, featured)
    VALUES (@name, @name_ar, @brand, @category, @price, @currency, @stock, @description, @description_ar, @image, @featured)`);
  const tx = db.transaction((rows) => rows.forEach(r => ins.run(r)));
  tx(SEED_PRODUCTS);
  console.log(`[db] seeded ${SEED_PRODUCTS.length} products`);
}

seedShippingFees();
seedProducts();

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
function getFees() {
  const rows = db.prepare('SELECT zone, fee FROM shipping_fees').all();
  const fees = { abudhabi: 15, emirates: 30, gcc: 80 };
  for (const r of rows) fees[r.zone] = r.fee;
  return fees;
}
function toAED(amount, currency) {
  const rate = FX_TO_AED[(currency || 'AED').toUpperCase()] || 1;
  return Math.round(amount * rate * 100) / 100;
}
function locationById(id) {
  return LOCATIONS.find(l => l.id === id) || null;
}

module.exports = { db, LOCATIONS, ZONES, FX_TO_AED, getFees, toAED, locationById, DB_PATH };
