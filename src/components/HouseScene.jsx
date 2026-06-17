// Login arka planı için elle çizilmiş, sanatsal SVG sahne:
// gün batımında modern bir ev — içeride sıcak ışıkla aydınlanmış, pencereden
// görünen bir mutfak (tezgah, sarkıt lambalar, dolaplar, bitki). Harici görsel
// yok; tamamen vektör. preserveAspectRatio="slice" ile ekranı kaplar.
export default function HouseScene() {
  return (
    <svg
      className="house-scene"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a2350" />
          <stop offset="38%" stopColor="#4a3f74" />
          <stop offset="68%" stopColor="#9a557e" />
          <stop offset="88%" stopColor="#e98a63" />
          <stop offset="100%" stopColor="#f6b06a" />
        </linearGradient>
        <radialGradient id="sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff3d6" />
          <stop offset="35%" stopColor="#ffd79a" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffd79a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe9b0" />
          <stop offset="100%" stopColor="#ff9d54" />
        </linearGradient>
        <linearGradient id="bodyShade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f6f1e9" />
          <stop offset="100%" stopColor="#e9e1d4" />
        </linearGradient>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a3357" />
          <stop offset="100%" stopColor="#241f3c" />
        </linearGradient>
      </defs>

      {/* Gökyüzü */}
      <rect width="1440" height="900" fill="url(#sky)" />

      {/* Yıldızlar */}
      <g fill="#ffffff" opacity="0.7">
        {[
          [120, 90], [260, 150], [410, 70], [560, 130], [700, 60],
          [880, 110], [1010, 70], [1180, 140], [1320, 80], [200, 220],
          [640, 200], [1100, 210], [1380, 200], [40, 160], [780, 250],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.8 : 1.1} />
        ))}
      </g>

      {/* Güneş parıltısı */}
      <circle cx="1080" cy="520" r="360" fill="url(#sun)" />
      <circle cx="1080" cy="520" r="62" fill="#fff1cf" opacity="0.95" />

      {/* Uzak tepeler */}
      <path d="M0 600 Q360 510 720 580 T1440 560 V900 H0 Z" fill="#6a5d8c" opacity="0.55" />
      <path d="M0 660 Q420 590 860 650 T1440 630 V900 H0 Z" fill="#534672" opacity="0.7" />

      {/* Uçan kuşlar */}
      <g stroke="#2b2440" strokeWidth="3" fill="none" opacity="0.5" strokeLinecap="round">
        <path d="M300 180 q14 -12 28 0 q14 -12 28 0" />
        <path d="M360 210 q10 -9 20 0 q10 -9 20 0" />
      </g>

      {/* ---- Ağaçlar (sol) ---- */}
      <g>
        <rect x="156" y="600" width="14" height="70" fill="#2c2440" />
        <circle cx="163" cy="585" r="48" fill="#37536b" />
        <circle cx="135" cy="610" r="34" fill="#2f4659" />
        <circle cx="192" cy="612" r="34" fill="#2f4659" />
      </g>

      {/* ---- Modern ev ---- */}
      <g>
        {/* arka kütle (alçak) */}
        <rect x="470" y="430" width="220" height="220" fill="#d9d0c2" />
        {/* ana kütle */}
        <rect x="660" y="330" width="360" height="320" fill="url(#bodyShade)" />
        {/* yan gölge yüzü */}
        <polygon points="1020,330 1100,360 1100,650 1020,650" fill="#cabfae" />
        {/* düz çatı çıkıntısı */}
        <rect x="650" y="318" width="380" height="18" fill="#2f3a47" />
        <polygon points="1030,336 1110,366 1100,360 1020,330" fill="#3a4654" />

        {/* zemin kat büyük cam — MUTFAK görünüyor */}
        <rect x="690" y="430" width="300" height="190" fill="#243042" />
        <rect x="698" y="438" width="284" height="174" fill="url(#glass)" opacity="0.92" />
        {/* iç mekan: tezgah + dolaplar */}
        <rect x="706" y="556" width="270" height="14" fill="#3a4250" />
        <rect x="706" y="570" width="270" height="42" fill="#cdb79a" />
        <rect x="752" y="576" width="2" height="30" fill="#a8906f" />
        <rect x="800" y="576" width="2" height="30" fill="#a8906f" />
        <rect x="852" y="576" width="2" height="30" fill="#a8906f" />
        <rect x="904" y="576" width="2" height="30" fill="#a8906f" />
        {/* üst dolaplar */}
        <rect x="716" y="452" width="120" height="44" fill="#e3d2b6" opacity="0.85" />
        {/* sarkıt lambalar + parıltı */}
        <g>
          <line x1="788" y1="452" x2="788" y2="512" stroke="#2b2440" strokeWidth="2" />
          <path d="M778 512 h20 l-4 14 h-12 z" fill="#3a4250" />
          <circle cx="788" cy="528" r="16" fill="#fff3c4" opacity="0.75" />
          <line x1="900" y1="452" x2="900" y2="512" stroke="#2b2440" strokeWidth="2" />
          <path d="M890 512 h20 l-4 14 h-12 z" fill="#3a4250" />
          <circle cx="900" cy="528" r="16" fill="#fff3c4" opacity="0.75" />
        </g>
        {/* bitki */}
        <rect x="940" y="588" width="20" height="24" fill="#b5651d" />
        <circle cx="950" cy="582" r="16" fill="#3f7d4e" />
        {/* pencere bölme çıtaları */}
        <line x1="840" y1="438" x2="840" y2="612" stroke="#243042" strokeWidth="4" />
        <line x1="698" y1="524" x2="982" y2="524" stroke="#243042" strokeWidth="3" opacity="0.5" />

        {/* üst kat pencereleri */}
        <rect x="700" y="356" width="80" height="56" fill="url(#glass)" opacity="0.9" />
        <rect x="812" y="356" width="80" height="56" fill="url(#glass)" opacity="0.9" />
        <rect x="924" y="356" width="64" height="56" fill="url(#glass)" opacity="0.75" />

        {/* arka kütle penceresi + kapı */}
        <rect x="500" y="470" width="70" height="70" fill="url(#glass)" opacity="0.8" />
        <rect x="596" y="540" width="54" height="110" fill="#2f3a47" />
        <circle cx="640" cy="596" r="3" fill="#ffd79a" />
      </g>

      {/* ---- Ağaç (sağ) ---- */}
      <g>
        <rect x="1140" y="560" width="16" height="92" fill="#241f3c" />
        <circle cx="1148" cy="540" r="56" fill="#314a5f" />
        <circle cx="1112" cy="566" r="38" fill="#2a4053" />
        <circle cx="1186" cy="566" r="38" fill="#2a4053" />
      </g>

      {/* Zemin */}
      <rect x="0" y="648" width="1440" height="252" fill="url(#ground)" />
      {/* yürüyüş yolu */}
      <polygon points="623,652 663,652 760,900 520,900" fill="#3f3a5c" opacity="0.7" />
      {/* ön çalılar */}
      <g fill="#26354a">
        <circle cx="430" cy="660" r="26" />
        <circle cx="470" cy="668" r="20" />
        <circle cx="1010" cy="664" r="24" />
        <circle cx="1050" cy="670" r="18" />
      </g>
    </svg>
  );
}
