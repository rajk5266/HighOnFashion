// src/data/products.js

export const products = [
  /* ================= AFTERGLOW ORANGE (Oversized Edit) ================= */

  {
    id: "ts-005",
    title: "Abstract Art Print White Crewneck Tee",
    slug: "abstract-art-print-white-crewneck-tee-ts005",
    price: 799,
    originalPrice: 1199,
    collectionId: "afterglow-orange",
    brand: "Unbranded / Thrifted",
    
    // Thrift Sizing System
    taggedSize: "M",
    fitsLike: "M (Relaxed Casual Fit)",
    measurements: {
      pitToPitInches: 19.0,
      lengthInches: 24.5,
      shoulderInches: 16.5
    },

    // Category & Style
    category: "tshirt",
    gender: "women",
    style: ["minimalist", "casual", "streetwear"],
    era: "Modern Thrift",

    // Condition & Flaws (Using your 3-tier system)
    condition: {
      grade: "Tier 1",
      label: "Superb",
      description: "Clean white fabric with intact abstract artwork graphic featuring glitter accent details. No visible stains, holes, or fading."
    },
    flaws: [],

    // Inventory Control
    stock: 1,
    isSold: false,
    isFeatured: false,

    // Media
    images: {
      main: "/product/abstract-art-print-white-crewneck-tee-ts005.webp",
      flaws: [],
      gallery: [
          "/product/abstract-art-print-white-crewneck-tee-ts005.webp"
        ]
    },
    alt: "White scoop crewneck t-shirt featuring an abstract muted print with text 'RECONNECT WITH NATURE AND EACH OTHER'"
  },

  /* ================= LUCID PURPLE (Statement Streetwear Edit) ================= */
   {
    id: "top-004",
    title: "Floral Printed Noodle Strap Camisole Top",
    slug: "floral-printed-noodle-strap-camisole-top-top004",
    price: 699,
    originalPrice: 999,
    collectionId: "lucid-purple",
    brand: "Unbranded / Thrifted",

    // Thrift Sizing System
    taggedSize: "M",
    fitsLike: "S/M (Relaxed Flowy Fit)",
    measurements: {
      pitToPitInches: 17.5,
      lengthInches: 23.0,
      strapLengthInches: 6.0
    },

    // Category & Style
    category: "tops",
    gender: "women",
    style: ["casual", "summerwear", "vintage", "y2k"],
    era: "Y2K / Early 00s",

    // Condition & Flaws
    condition: {
      grade: "Grade A",
      label: "Mint / Like-New",
      description: "Clean fabric with crisp floral printing, sturdy straps, and no visible wear."
    },
    flaws: [],

    // Inventory Control
    stock: 1,
    isSold: false,
    isFeatured: false,

    // Media
    images: {
      main: "/product/floral-printed-noodle-strap-camisole-top-top004.webp",
      flaws: [],
      gallery: [
        "/product/floral-printed-noodle-strap-camisole-top-top004.webp",
        "/product/floral-printed-noodle-strap-camisole-top-top004.webp",
      ]
    },
    alt: "White floral printed camisole top with thin spaghetti straps"
  },
  {
    id: "top-005",
    title: "Navy Blue Sheer Floral Lace Long-Sleeve Top",
    slug: "navy-blue-sheer-floral-lace-long-sleeve-top-top005",
    price: 899,
    originalPrice: 1299,
    collectionId: "lucid-purple",
    brand: "Unbranded / Thrifted",
    
    // Thrift Sizing System
    taggedSize: "M",
    fitsLike: "M (Relaxed Flowy Fit)",
    measurements: {
      pitToPitInches: 18.5,
      lengthInches: 24.0,
      sleeveInches: 23.0,
      shoulderInches: 15.5
    },

    // Category & Style
    category: "tops",
    gender: "women",
    style: ["vintage", "y2k", "boho", "minimalist"],
    era: "Y2K / Early 00s",

    // Condition & Flaws (Using your 3-tier system)
    condition: {
      grade: "Tier 1",
      label: "Superb",
      description: "Intricate metallic-finish navy lace with full elasticity intact. No snagging, tears, or loose threads."
    },
    flaws: [],

    // Inventory Control
    stock: 1,
    isSold: false,
    isFeatured: true,

    // Media
    images: {
      main: "/product/navy-lace-top-front.webp",
      back: "/product/navy-lace-top-back.webp",
      flaws: [],
      gallery: [
        "/product/navy-lace-top-front.webp",
        "/product/navy-lace-top-back.webp",
        "/product/navy-lace-top-back.webp"
      ]
    },
    alt: "Sheer navy blue floral lace long-sleeve top with subtle shimmer"
  },

  /* ================= PULSE GREEN (Winter & Heavyweight Edit) ================= */
{
    id: "hd-002",
    title: "Pastel Yellow Heavyweight Pullover Hoodie",
    slug: "pastel-yellow-heavyweight-pullover-hoodie-hd002",
    price: 1299,
    originalPrice: 1799,
    collectionId: "pulse-green",
    brand: "Unbranded / Thrifted",
    
    // Thrift Sizing System
    taggedSize: "L",
    fitsLike: "L (Relaxed Drop-Shoulder Fit)",
    measurements: {
      pitToPitInches: 23.5,
      lengthInches: 27.5,
      sleeveInches: 24.0,
      shoulderInches: 22.0
    },

    // Category & Style
    category: "sweatshirt",
    gender: "unisex",
    style: ["streetwear", "winterwear", "minimalist", "oversized"],
    era: "Modern Thrift",

    // Condition & Flaws
    condition: {
      grade: "Grade A",
      label: "Mint / Like-New",
      description: "Clean pastel yellow fabric, crisp ribbed cuffs and hem, sturdy drawstrings, and a spotless kangaroo pocket."
    },
    flaws: [],

    // Inventory Control
    stock: 1,
    isSold: false,
    isFeatured: true,

    // Media
    images: {
      main: "/product/pastel-yellow-heavyweight-pullover-hoodie-hd002.webp",
      flaws: [],
      gallery: [
        "/product/pastel-yellow-heavyweight-pullover-hoodie-hd002.webp"
      ]
    },
    alt: "Pastel yellow oversized pullover hoodie with front kangaroo pocket"
  },




  /* ================= ASTRAL BLUE (Retro Archive Edit) ================= */
{
    id: "jk-001",
    title: "Embellished Geometric Trim Denim Jacket",
    slug: "embellished-geometric-trim-denim-jacket-jk001",
    price: 1799,
    originalPrice: 2499,
    collectionId: "astral-blue",
    brand: "Unbranded / Thrifted",
    
    // Thrift Sizing System
    taggedSize: "M",
    fitsLike: "M (Structured Fit)",
    measurements: {
      pitToPitInches: 19.5,
      lengthInches: 22.0,
      sleeveInches: 23.5,
      shoulderInches: 16.5
    },

    // Category & Style
    category: "jacket",
    gender: "women",
    style: ["vintage", "retro", "boho", "streetwear"],
    era: "Y2K / Early 00s",

    // Condition & Flaws
    condition: {
      grade: "Grade A",
      label: "Mint / Like-New",
      description: "Medium-wash denim with intricate beaded geometric trim along the shoulder yoke, chest pocket flap, and hem. All buttons and embellishments intact."
    },
    flaws: [],

    // Inventory Control
    stock: 1,
    isSold: false,
    isFeatured: true,

    // Media
    images: {
      main: "/product/embellished-geometric-trim-denim-jacket-jk001.webp",
      flaws: [],
      gallery: [
        "/product/embellished-geometric-trim-denim-jacket-jk001.webp"
      ]
    },
    alt: "Medium wash blue denim jacket featuring beaded geometric embroidery on shoulders and hem"
  }
];
