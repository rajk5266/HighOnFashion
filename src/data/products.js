// src/data/products.js

export const products = [
  /* ================= AFTERGLOW ORANGE (Oversized Edit) ================= */
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
    id: "os-002",
    title: "Washed Grey Fade Oversized Tee",
    slug: "washed-grey-fade-oversized-tee-os002",
    price: 949,
    originalPrice: 1350,
    collectionId: "afterglow-orange",
    brand: "Zara",

    taggedSize: "M",
    fitsLike: "L (Oversized Cut)",
    measurements: {
      pitToPitInches: 22.5,
      lengthInches: 28.0,
      shoulderInches: 20.5
    },

    category: "tshirt",
    gender: "unisex",
    style: ["oversized", "streetwear", "vintage"],
    era: "Modern Thrift",

    condition: {
      grade: "Grade B",
      label: "Good Vintage",
      description: "Light intentional wash fade across seams."
    },
    flaws: ["Light wash fade near hem"],

    stock: 1,
    isSold: false,
    isFeatured: true,

    images: {
      main: "/images/products/grey-oversized-tee-front.png",
      back: "/images/products/grey-oversized-tee-back.png",
      flaws: [],
      gallery: []
    },
    alt: "Washed grey oversized t-shirt with vintage fade"
  },
  {
    id: "os-003",
    title: "Beige Minimalist Heavyweight Tee",
    slug: "beige-minimalist-heavyweight-tee-os003",
    price: 899,
    originalPrice: 1199,
    collectionId: "afterglow-orange",
    brand: "Uniqlo",

    taggedSize: "XL",
    fitsLike: "XL (Relaxed Fit)",
    measurements: {
      pitToPitInches: 24.0,
      lengthInches: 29.0,
      shoulderInches: 22.0
    },

    category: "tshirt",
    gender: "unisex",
    style: ["oversized", "minimalist"],
    era: "Modern Thrift",

    condition: {
      grade: "Grade A",
      label: "Mint / Like-New",
      description: "Thick heavy cotton, clean neckline, ready to wear."
    },
    flaws: [],

    stock: 1,
    isSold: false,
    isFeatured: false,

    images: {
      main: "/images/products/beige-oversized-tee-front.png",
      back: "/images/products/beige-oversized-tee-back.png",
      flaws: [],
      gallery: []
    },
    alt: "Beige heavy cotton minimalist oversized tee"
  },

  /* ================= LUCID PURPLE (Statement Streetwear Edit) ================= */
  {
    id: "vt-001",
    title: "Vintage Nike Center Swoosh Tee",
    slug: "vintage-nike-center-swoosh-tee-vt001",
    price: 1499,
    originalPrice: 2000,
    collectionId: "lucid-purple",
    brand: "Nike",

    taggedSize: "XL",
    fitsLike: "L (Boxy Vintage Fit)",
    measurements: {
      pitToPitInches: 23.5,
      lengthInches: 27.5,
      shoulderInches: 21.0
    },

    category: "tshirt",
    gender: "unisex",
    style: ["streetwear", "vintage", "retro"],
    era: "90s / Single Stitch",

    condition: {
      grade: "Grade B",
      label: "Good Vintage",
      description: "Authentic 90s wash tone with light print cracking."
    },
    flaws: [
      "Minor graphic micro-cracking",
      "Slight fading around neck band"
    ],

    stock: 1,
    isSold: false,
    isFeatured: true,

    images: {
      main: "/images/products/nike-center-swoosh-front.png",
      back: "/images/products/nike-center-swoosh-back.png",
      flaws: ["/images/products/nike-center-swoosh-cracking.png"],
      gallery: []
    },
    alt: "90s Vintage Nike Center Swoosh Navy Graphic T-Shirt"
  },

  /* ================= PULSE GREEN (Winter & Heavyweight Edit) ================= */
  {
    id: "sw-001",
    title: "Sunfaded Heavyweight Grey Pullover Hoodie",
    slug: "sunfaded-heavyweight-grey-pullover-hoodie-sw001",
    price: 1899,
    originalPrice: 2500,
    collectionId: "pulse-green",
    brand: "Puma",

    taggedSize: "L",
    fitsLike: "L (Heavyweight Relaxed)",
    measurements: {
      pitToPitInches: 24.5,
      lengthInches: 28.0,
      sleeveInches: 24.0
    },

    category: "sweatshirt",
    gender: "unisex",
    style: ["winterwear", "streetwear"],
    era: "Y2K (Early 2000s)",

    condition: {
      grade: "Grade B",
      label: "Good Vintage",
      description: "Heavy fleece interior with nice lived-in wash."
    },
    flaws: ["Faint bleach speck near right cuff"],

    stock: 1,
    isSold: false,
    isFeatured: true,

    images: {
      main: "/images/products/grey-pullover-hoodie.png",
      back: "/images/products/grey-pullover-hoodie-back.png",
      flaws: ["/images/products/grey-hoodie-cuff-flaw.png"],
      gallery: []
    },
    alt: "Sunfaded heavyweight grey pullover hoodie"
  },

  /* ================= ASTRAL BLUE (Retro Archive Edit) ================= */
  {
    id: "dn-001",
    title: "Distressed Levi's 501 Sunfaded Denim",
    slug: "distressed-levis-501-sunfaded-denim-dn001",
    price: 2199,
    originalPrice: 3000,
    collectionId: "astral-blue",
    brand: "Levi’s",

    taggedSize: "W34 L32",
    fitsLike: "W32 L30 (Shrunken Vintage Fit)",
    measurements: {
      waistInches: 32.0,
      lengthInches: 40.0,
      inseamInches: 30.0,
      legOpeningInches: 8.0
    },

    category: "jeans",
    gender: "unisex",
    style: ["vintage", "retro", "distressed"],
    era: "90s Archive",

    condition: {
      grade: "Grade C",
      label: "Distressed / Well-Loved",
      description: "Heavy natural distressing with sun-faded patina."
    },
    flaws: [
      "Knee blowout distressing",
      "Fraying on back heel hem"
    ],

    stock: 1,
    isSold: false,
    isFeatured: true,

    images: {
      main: "/images/products/levis-501-front.png",
      back: "/images/products/levis-501-back.png",
      flaws: ["/images/products/levis-501-knee-flaw.png"],
      gallery: []
    },
    alt: "Vintage distressed Levi's 501 sunfaded denim jeans"
  }
];
