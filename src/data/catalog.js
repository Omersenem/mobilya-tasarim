// Mutfak planlayıcısının tüm veri katmanı.
// 3D motoru (engine/) bu tanımları okuyarak mesh üretir; UI (components/) de
// menüleri buradan kurar. Böylece yeni bir eşya eklemek tek bir yer değişikliği.

/** Kategoriye ayrılmış katalog. `type` alanı engine/factories.js içindeki
 *  fabrika anahtarıyla birebir eşleşir. */
export const CATALOG = [
  {
    group: "Dolaplar",
    icon: "🗄️",
    items: [
      { type: "base", label: "Alt Dolap", icon: "🗄️", colorable: true },
      { type: "cornerBase", label: "Köşe Dolap", icon: "🔲", colorable: true },
      { type: "wall", label: "Üst Dolap", icon: "📦", colorable: true },
      { type: "tall", label: "Boy Dolap", icon: "🚪", colorable: true },
      { type: "counter", label: "Tezgah Parçası", icon: "▬" },
    ],
  },
  {
    group: "Beyaz Eşya",
    icon: "🧊",
    items: [
      { type: "fridge", label: "Buzdolabı", icon: "🧊" },
      { type: "oven", label: "Fırın", icon: "🔥" },
      { type: "stove", label: "Ocak", icon: "🍳" },
      { type: "sink", label: "Evye", icon: "🚰" },
      { type: "dishwasher", label: "Bulaşık Mak.", icon: "💧" },
      { type: "hood", label: "Davlumbaz", icon: "🌀" },
    ],
  },
  {
    group: "Dekor",
    icon: "🪴",
    items: [
      { type: "rug", label: "Halı", icon: "🟫" },
      { type: "plant", label: "Saksı Bitki", icon: "🪴" },
      { type: "stool", label: "Tabure", icon: "🪑" },
      { type: "table", label: "Yemek Masası", icon: "🍽️" },
    ],
  },
];

/** Hazır mutfak şablonları — sidebar'daki "tek tık" düzenler. */
export const PRESETS = [
  { id: "L", label: "L Mutfak", icon: "📐" },
  { id: "single", label: "Tek Duvar", icon: "▭" },
  { id: "island", label: "Ada Mutfak", icon: "🏝️" },
];

/** Görünüm temaları — zemin/duvar/ışık paketleri. */
export const THEMES = [
  {
    id: "wood",
    name: "Modern Ahşap",
    floor: "woodLight",
    wall: "#eae6df",
    bg: "#d7dde3",
    hemi: 0.55,
    sun: 1.7,
    sunColor: "#fff4e0",
    pendant: 0,
    rug: "#b07a4a",
  },
  {
    id: "loft",
    name: "Akşam Loft",
    floor: "woodDark",
    wall: "#2c3440",
    bg: "#1c2531",
    hemi: 0.25,
    sun: 0.45,
    sunColor: "#ffd9a0",
    pendant: 1.4,
    rug: "#6d4030",
  },
  {
    id: "tile",
    name: "Klasik Fayans",
    floor: "tile",
    wall: "#f3efe7",
    bg: "#e7eaee",
    hemi: 0.6,
    sun: 1.9,
    sunColor: "#ffffff",
    pendant: 0,
    rug: "#7c93a8",
  },
];

/** Kapak rengi paleti (renk değiştir aracı için). */
export const PALETTE = [
  "#f2f1ee",
  "#33404d",
  "#b45309",
  "#3f6212",
  "#274060",
  "#d9c7a3",
  "#6b2f1a",
  "#4b5563",
];

/** Oda ölçüleri — metre cinsinden. */
export const ROOM = { size: 4.4, wallHeight: 2.7, snap: 0.1 };
