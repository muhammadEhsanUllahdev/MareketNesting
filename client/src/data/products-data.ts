// products-data.ts
// NOTE: Category IDs come from your DB screenshot. Replace any that changed.

type ImageObj = { url: string; uploadMethod: "url" | "upload" | "existing" };

export type SeedProduct = {
  translations: {
    en: { name: string; description: string; highlights?: string };
    fr?: { name?: string; description?: string; highlights?: string };
    ar?: { name?: string; description?: string; highlights?: string };
  };
  brand: string;
  sku: string;
  price: number;
  originalPrice?: number;
  purchasePrice?: number;
  minThreshold: number;
  suggestedQuantity: number;
  stock: number;
  categoryId: string;
  status: "active" | "inactive";
  images: ImageObj[];
  specifications?: { featureName: string; featureValue: string; featureType: string }[];
  faqs?: { question: string; answer: string }[];
  isFeatured?: boolean;
  // For BEs that also read top-level fields (back-compat),
  // you can set them while seeding if needed:
  name?: string;
  description?: string;
  highlights?: string;
};

// ---- Category IDs (from your latest screenshot) ----
const CAT = {
  ELECTRONICS: "33be3820-792e-4d55-9c0d-365b3b824312",
  HOME_APPLIANCES: "810ce7c9-6447-4fd5-943c-07623d9ce6fa",
  HEALTH_BEAUTY: "f5dd4312-537b-43ca-92ad-c7ab33bc7899",
  HOME_KITCHEN: "cbf21724-0ace-46b7-86f6-a2986067c828",
  PHONES_ACCESSORIES: "f82e44d3-79a2-4c3c-90c2-fdcc9a1bbdc5",
  COMPUTING: "af861590-e04c-4173-9689-da3c7ec94e96",
  BABY_CHILDCARE: "7c0c1d1d-fdf0-41ec-8422-c168a77dd100",
  TOYS_VIDEO_GAMES: "330232f9-5387-4464-b406-7cf1d0ced41b",
  SPORTS_ITEMS: "fd4b281c-46c5-48a4-8e59-cee5ba21a7ff",
  CAR_MOTORCYCLE: "d69225ec-e6f4-4d50-b44c-49ea3218f11d",
  OTHER: "adc1e765-0d14-4721-a939-de4a6378bd5f",
  FASHION: "ba30cc34-b91b-4f60-b39a-eac5794076a8",
  HOME_GARDEN: "4ecbf7db-48b7-4b6d-aa5c-c953a1c7d58a", // new category
};


// Small helpers for dummy text & images
const img = (q: string): ImageObj => ({
  url: `https://source.unsplash.com/900x900/?${encodeURIComponent(q)}`,
  uploadMethod: "url",
});
const en = (s: string) => s;
const fr = (s: string) => s; // keep simple placeholders
const ar = (s: string) => s;

// ---------------- Products ----------------
export const products: SeedProduct[] = [
  // ---------- Home Appliances ----------
  {
    translations: {
      en: {
        name: "Smart Air Fryer 5.5L",
        description: en("Versatile 5.5L air fryer with digital touch and 8 preset modes for healthy, oil-free cooking."),
        highlights: en("<ul><li>5.5L capacity</li><li>Rapid hot air tech</li><li>Non-stick basket</li></ul>"),
      },
      fr: {
        name: "Friteuse à air intelligente 5,5L",
        description: fr("Friteuse 5,5L avec écran tactile et 8 modes pour une cuisson saine sans huile."),
        highlights: fr("<ul><li>Capacité 5,5L</li><li>Air chaud rapide</li><li>Panier antiadhésif</li></ul>"),
      },
      ar: {
        name: "قلاية هوائية ذكية 5.5 لتر",
        description: ar("قلاية 5.5 لتر مع شاشة لمس و8 أوضاع لطبخ صحي بدون زيت."),
        highlights: ar("<ul><li>سعة 5.5 لتر</li><li>تقنية الهواء الساخن</li><li>سلة غير لاصقة</li></ul>"),
      },
    },
    brand: "AirChef",
    sku: "HA-AIRF-001",
    price: 79.99,
    originalPrice: 99.99,
    purchasePrice: 60,
    minThreshold: 5,
    suggestedQuantity: 40,
    stock: 120,
    categoryId: CAT.HOME_APPLIANCES,
    status: "active",
    images: [img("air fryer kitchen"), img("healthy cooking appliance")],
    specifications: [
    ],
    faqs: [],
    isFeatured: true,
    name: "Smart Air Fryer 5.5L",
    description: "Versatile 5.5L air fryer with digital touch and 8 preset modes for healthy, oil-free cooking.",
    highlights: "5.5L capacity; Rapid hot air; Non-stick basket",
  },
  {
    translations: {
      en: {
        name: "Steam Iron 2600W",
        description: "High-power steam iron with ceramic soleplate and anti-drip.",
      },
      fr: { name: "Fer à repasser vapeur 2600W", description: "Semelle céramique, anti-goutte, vapeur puissante." },
      ar: { name: "مكواة بخار 2600 واط", description: "قاعدة سيراميك مع خاصية منع التقطير وبخار قوي." },
    },
    brand: "SteamPro",
    sku: "HA-IRON-002",
    price: 39.9,
    originalPrice: 49.9,
    purchasePrice: 28,
    minThreshold: 5,
    suggestedQuantity: 60,
    stock: 200,
    categoryId: CAT.HOME_APPLIANCES,
    status: "active",
    images: [img("steam iron")],
    isFeatured: true,
  },

  // ---------- Fashion ----------
  {
    translations: {
      en: {
        name: "Men’s Running Shoes",
        description: "Breathable mesh upper, cushioned midsole, anti-slip outsole.",
        highlights: "<ul><li>Lightweight</li><li>Shock absorption</li><li>All-day comfort</li></ul>",
      },
      fr: {
        name: "Chaussures de course homme",
        description: "Maille respirante, semelle amortie, adhérence optimale.",
      },
      ar: { name: "حذاء ركض رجالي", description: "قماش شبكي، توسيد مريح، نعل مقاوم للانزلاق." },
    },
    brand: "StrideX",
    sku: "FA-SHOE-001",
    price: 59.0,
    originalPrice: 79.0,
    purchasePrice: 40,
    minThreshold: 8,
    suggestedQuantity: 80,
    stock: 150,
    categoryId: CAT.FASHION,
    status: "active",
    images: [img("running shoes")],
    isFeatured: true,
  },
  {
    translations: {
      en: { name: "Classic Cotton T-Shirt", description: "100% combed cotton, soft touch, regular fit." },
      fr: { name: "T-shirt coton classique", description: "100% coton peigné, toucher doux, coupe régulière." },
      ar: { name: "قميص قطني كلاسيكي", description: "قطن ممشط 100٪، لمسة ناعمة، قصة عادية." },
    },
    brand: "CottonLab",
    sku: "FA-TSHIRT-002",
    price: 12.5,
    minThreshold: 10,
    suggestedQuantity: 200,
    stock: 500,
    categoryId: CAT.FASHION,
    status: "active",
    images: [img("plain t-shirt white")],
    isFeatured: true,
  },

  // ---------- Health & Beauty ----------
  {
    translations: {
      en: { name: "Vitamin C Face Serum 30ml", description: "Brightening serum with hyaluronic acid." },
      fr: { name: "Sérum visage Vitamine C 30ml", description: "Éclat et hydratation à l’acide hyaluronique." },
      ar: { name: "سيروم فيتامين سي 30 مل", description: "تفتيح وترطيب بحمض الهيالورونيك." },
    },
    brand: "Glowify",
    sku: "HB-SERUM-001",
    price: 18.9,
    originalPrice: 24.9,
    purchasePrice: 12,
    minThreshold: 15,
    suggestedQuantity: 120,
    stock: 300,
    categoryId: CAT.HEALTH_BEAUTY,
    status: "active",
    images: [img("vitamin c serum skincare")],
    isFeatured: true,
  },
  {
    translations: {
      en: { name: "Electric Toothbrush", description: "4 modes, 2-min timer, fast charging." },
      fr: { name: "Brosse à dents électrique", description: "4 modes, minuterie 2 min, charge rapide." },
      ar: { name: "فرشاة أسنان كهربائية", description: "أربع أوضاع ومؤقت دقيقتين وشحن سريع." },
    },
    brand: "SmileOne",
    sku: "HB-TOOTH-002",
    price: 22.0,
    minThreshold: 10,
    suggestedQuantity: 100,
    stock: 180,
    categoryId: CAT.HEALTH_BEAUTY,
    status: "active",
    images: [img("electric toothbrush minimal")],
    isFeatured: true,
  },

  // ---------- Home & Kitchen ----------
  {
    translations: {
      en: { name: "Non-Stick Cookware Set (8-Piece)", description: "Die-cast aluminum, PFOA-free non-stick." },
      fr: { name: "Batterie de cuisine antiadhésive (8 pcs)", description: "Aluminium moulé, revêtement sans PFOA." },
      ar: { name: "طقم قدور غير لاصق (8 قطع)", description: "ألمنيوم مصبوب وطبقة غير لاصقة بدون PFOA." },
    },
    brand: "ChefSuite",
    sku: "HK-COOK-001",
    price: 89.9,
    originalPrice: 119.0,
    purchasePrice: 65,
    minThreshold: 6,
    suggestedQuantity: 50,
    stock: 90,
    categoryId: CAT.HOME_KITCHEN,
    status: "active",
    images: [img("cookware set nonstick")],
    isFeatured: true,
  },
  {
    translations: {
      en: { name: "Stainless Steel Knife Set (6)", description: "Ergonomic handle, pro-grade blades." },
      fr: { name: "Coffret couteaux inox (6)", description: "Manche ergonomique, lames pro." },
      ar: { name: "طقم سكاكين ستانلس (6)", description: "مقابض مريحة وشفرات احترافية." },
    },
    brand: "SteelEdge",
    sku: "HK-KNIFE-002",
    price: 34.5,
    minThreshold: 6,
    suggestedQuantity: 60,
    stock: 140,
    categoryId: CAT.HOME_KITCHEN,
    status: "active",
    images: [img("kitchen knife set")],
    isFeatured: true,
  },

  // ---------- Phones & Accessories ----------
  {
    translations: {
      en: { name: "Wireless Earbuds ANC", description: "Bluetooth 5.3, ANC, 30h battery." },
      fr: { name: "Écouteurs sans fil ANC", description: "Bluetooth 5.3, réduction de bruit, 30h." },
      ar: { name: "سماعات لاسلكية مع عزل الضجيج", description: "بلوتوث 5.3 وبطارية 30 ساعة." },
    },
    brand: "SonicBud",
    sku: "PH-EARB-001",
    price: 49.0,
    originalPrice: 69.0,
    purchasePrice: 35,
    minThreshold: 12,
    suggestedQuantity: 120,
    stock: 220,
    categoryId: CAT.PHONES_ACCESSORIES,
    status: "active",
    images: [img("wireless earbuds anc black")],
    isFeatured: true,
  },
  {
    translations: {
      en: { name: "20W Fast Charger + Cable", description: "USB-C PD adapter with 1m cable." },
      fr: { name: "Chargeur rapide 20W + câble", description: "Adaptateur USB-C PD avec câble 1m." },
      ar: { name: "شاحن سريع 20 واط + كابل", description: "شاحن USB-C PD مع كابل 1 متر." },
    },
    brand: "PowerGo",
    sku: "PH-CHRG-002",
    price: 14.9,
    minThreshold: 20,
    suggestedQuantity: 200,
    stock: 600,
    categoryId: CAT.PHONES_ACCESSORIES,
    status: "active",
    images: [img("usb c fast charger cable")],
    isFeatured: true,
  },

  // ---------- Computing ----------
  {
    translations: {
      en: { name: "15.6\" Laptop 16GB/512GB", description: "Slim laptop, 12-core CPU, IPS display." },
      fr: { name: "PC Portable 15,6\" 16Go/512Go", description: "Processeur 12 cœurs, écran IPS fin." },
      ar: { name: "حاسوب محمول 15.6\" 16GB/512GB", description: "معالج قوي وشاشة IPS نحيفة." },
    },
    brand: "NovaBook",
    sku: "CP-LAP-001",
    price: 699,
    originalPrice: 799,
    purchasePrice: 560,
    minThreshold: 3,
    suggestedQuantity: 20,
    stock: 45,
    categoryId: CAT.COMPUTING,
    status: "active",
    images: [img("laptop 15 inch workspace")],
    isFeatured: true,
  },
  {
    translations: {
      en: { name: "Mechanical Keyboard RGB", description: "Hot-swap switches, full RGB, USB-C." },
      fr: { name: "Clavier mécanique RGB", description: "Switches hot-swap, RGB complet, USB-C." },
      ar: { name: "لوحة مفاتيح ميكانيكية RGB", description: "مفاتيح قابلة للاستبدال وRGB كامل." },
    },
    brand: "KeyForge",
    sku: "CP-KBD-002",
    price: 69,
    minThreshold: 8,
    suggestedQuantity: 80,
    stock: 160,
    categoryId: CAT.COMPUTING,
    status: "active",
    images: [img("mechanical keyboard rgb desk")],
    isFeatured: true,
  },

  // ---------- Baby & Childcare ----------
  {
    translations: {
      en: { name: "Baby Stroller (Foldable)", description: "Lightweight, one-hand fold, sun canopy." },
      fr: { name: "Poussette bébé (pliable)", description: "Légère, pliage à une main, pare-soleil." },
      ar: { name: "عربة أطفال قابلة للطي", description: "خفيفة مع طي بيد واحدة ومظلة." },
    },
    brand: "KidMove",
    sku: "BC-STROLLER-001",
    price: 119,
    originalPrice: 149,
    purchasePrice: 92,
    minThreshold: 4,
    suggestedQuantity: 30,
    stock: 60,
    categoryId: CAT.BABY_CHILDCARE,
    status: "active",
    images: [img("baby stroller foldable")],
    isFeatured: true,
  },
  {
    translations: {
      en: { name: "Baby Monitor 1080p", description: "Camera + app, night vision, 2-way audio." },
      fr: { name: "Babyphone 1080p", description: "Caméra + app, vision nocturne, audio bidirectionnel." },
      ar: { name: "مراقب أطفال 1080p", description: "كاميرا مع تطبيق ورؤية ليلية وصوت ثنائي الاتجاه." },
    },
    brand: "CareView",
    sku: "BC-MON-002",
    price: 59,
    minThreshold: 6,
    suggestedQuantity: 50,
    stock: 110,
    categoryId: CAT.BABY_CHILDCARE,
    status: "active",
    images: [img("baby monitor camera night vision")],
    isFeatured: true,
  },

  // ---------- Toys & Video Games ----------
  {
    translations: {
      en: { name: "Console Wireless Controller", description: "Ergonomic pad, vibration, USB-C." },
      fr: { name: "Manette sans fil pour console", description: "Ergonomique, vibration, USB-C." },
      ar: { name: "ذراع تحكم لاسلكي", description: "مريح مع اهتزاز ومنفذ USB-C." },
    },
    brand: "GamePulse",
    sku: "TVG-CONT-001",
    price: 39,
    originalPrice: 49,
    purchasePrice: 28,
    minThreshold: 10,
    suggestedQuantity: 120,
    stock: 240,
    categoryId: CAT.TOYS_VIDEO_GAMES,
    status: "active",
    images: [img("wireless game controller")],
    isFeatured: true,
  },
  {
    translations: {
      en: { name: "STEM Robot Kit", description: "Build-and-code robot for kids 8+." },
      fr: { name: "Kit robot STEM", description: "Robot à construire et programmer dès 8 ans." },
      ar: { name: "عدة روبوت STEM", description: "روبوت للتجميع والبرمجة للأطفال +8." },
    },
    brand: "EduBots",
    sku: "TVG-ROBO-002",
    price: 52,
    minThreshold: 8,
    suggestedQuantity: 80,
    stock: 90,
    categoryId: CAT.TOYS_VIDEO_GAMES,
    status: "active",
    images: [img("kids robotics kit")],
    isFeatured: true,
  },

  // ---------- Sports ----------
  {
    translations: {
      en: { name: "Adjustable Dumbbells (Pair 2x24kg)", description: "Quick-lock system, compact design." },
      fr: { name: "Haltères réglables (2x24kg)", description: "Système à verrouillage rapide, compacts." },
      ar: { name: "دامبلز قابلة للتعديل (2×24 كج)", description: "قفل سريع وتصميم مدمج." },
    },
    brand: "PowerFit",
    sku: "SP-DBL-001",
    price: 219,
    originalPrice: 259,
    purchasePrice: 180,
    minThreshold: 3,
    suggestedQuantity: 20,
    stock: 25,
    categoryId: CAT.SPORTS_ITEMS,
    status: "active",
    images: [img("adjustable dumbbells gym")],
    isFeatured: true,
  },
  {
    translations: {
      en: { name: "Yoga Mat 8mm Non-Slip", description: "High-density TPE, strap included." },
      fr: { name: "Tapis de yoga 8mm antidérapant", description: "TPE haute densité, sangle incluse." },
      ar: { name: "بساط يوجا 8مم غير قابل للانزلاق", description: "TPE كثافة عالية مع حزام." },
    },
    brand: "ZenFlex",
    sku: "SP-YOGA-002",
    price: 17.5,
    minThreshold: 10,
    suggestedQuantity: 120,
    stock: 260,
    categoryId: CAT.SPORTS_ITEMS,
    status: "active",
    images: [img("yoga mat non slip")],
    isFeatured: true,
  },

  // ---------- Car & Motorcycle ----------
  {
    translations: {
      en: { name: "Car Vacuum Cleaner 120W", description: "12V portable vacuum with HEPA filter." },
      fr: { name: "Aspirateur voiture 120W", description: "12V portable avec filtre HEPA." },
      ar: { name: "مكنسة سيارة 120 واط", description: "محمولة 12V مع فلتر HEPA." },
    },
    brand: "AutoClean",
    sku: "CM-VAC-001",
    price: 24.9,
    minThreshold: 8,
    suggestedQuantity: 80,
    stock: 140,
    categoryId: CAT.CAR_MOTORCYCLE,
    status: "active",
    images: [img("car vacuum handheld")],
    isFeatured: true,
  },
  {
    translations: {
      en: { name: "Motorcycle Phone Mount", description: "Aluminum bracket, 360° rotation." },
      fr: { name: "Support téléphone moto", description: "Aluminium, rotation 360°." },
      ar: { name: "حامل هاتف للدراجة النارية", description: "حامل ألمنيوم بدوران 360°." },
    },
    brand: "RideGrip",
    sku: "CM-PHMT-002",
    price: 15.0,
    minThreshold: 10,
    suggestedQuantity: 120,
    stock: 220,
    categoryId: CAT.CAR_MOTORCYCLE,
    status: "active",
    images: [img("motorcycle phone mount")],
    isFeatured: true,
  },

  // ---------- Other ----------
  {
    translations: {
      en: { name: "LED Strip Lights 5m", description: "RGB with remote, USB powered." },
      fr: { name: "Bande LED 5m", description: "RGB avec télécommande, USB." },
      ar: { name: "شريط إضاءة LED بطول 5م", description: "RGB مع جهاز تحكم وطاقة USB." },
    },
    brand: "GlowLine",
    sku: "OT-LED-001",
    price: 12.9,
    minThreshold: 12,
    suggestedQuantity: 150,
    stock: 400,
    categoryId: CAT.ELECTRONICS,
    status: "active",
    images: [img("rgb led strip room")],
    isFeatured: true,
  },
];
