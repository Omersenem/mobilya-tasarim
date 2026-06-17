# 🍳 Mutfak Tasarım 3D — Planner

IKEA mutfak/oda planlayıcısı tarzında, **React + Babylon.js** ile yeniden kurulmuş
3D mutfak tasarım demosu. Eşyaları sürükleyerek yerleştir, döndür, renklendir,
temayı değiştir ve tasarımının **fotoğrafını indir**.

## Çalıştırma

İki parça var: **Go Fiber backend** (kimlik + tasarım kayıtları) ve **React frontend**.

```bash
# 1) Backend  (port 3001)
cd server
go run .

# 2) Frontend (port 5173) — ayrı terminalde
npm install
npm run dev        # http://localhost:5173
```

Vite, `/api` isteklerini otomatik olarak backend'e (`localhost:3001`) yönlendirir.
İlk açılışta **kayıt ol**, sonra planner açılır.

Üretim derlemesi:

```bash
npm run build && npm run preview
```

## Özellikler

- **Babylon.js 8** motoru (IKEA planner ile aynı motor) — gerçek zamanlı 3D, gölgeler.
- **Sürükle-bırak yerleştirme**, grid'e kenetlenme, oda sınırına klipsleme.
- **Hazır mutfaklar**: L Mutfak, Tek Duvar, Ada Mutfak.
- **Katalog**: alt/üst/boy dolap, tezgah, buzdolabı, fırın, ocak, evye, bulaşık
  makinesi, davlumbaz + dekor (halı, bitki, tabure, masa).
- **Temalar**: Modern Ahşap, Akşam Loft, Klasik Fayans (ışık + zemin + duvar paketi).
- **Kalın fayanslı duvarlar** — IKEA planner gibi kalınlığı olan, üstü pahlı kutu duvarlar.
- **📏 Ölçüm modu** — bir eşyayı seç, ölçüm ikonuna bas; en/derinlik/yükseklik
  etiketleri 3D köşebent ile gösterilir. **cm / inç** birim seçici.
- **Renk değiştir / döndür (R) / sil (Del)** araçları.
- **📸 Fotoğraf indir** — sahnenin 1920×1280 PNG render'ını kaydeder.
- **🔑 Giriş / kayıt** — Go Fiber + JWT tabanlı kimlik doğrulama.
- **💾 Tasarımlarım** — tasarımı kaydet, listele, geri yükle, güncelle, sil
  (kullanıcıya özel, backend'de saklanır).
- **📐 Oda boyutları** — genişlik / derinlik / yükseklik (cm) girilebilir; oda
  anında yeniden boyutlanır ve eşyalar yeni sınıra çekilir.
- **L tezgah köşe dolabı** — L mutfakta iki kol köşede boşluksuz birleşir.
- **Açılır-kapanır sol menü** — kategoriler (dolaplar, beyaz eşya, dekor) tıkla-aç.

## Mimari

```
src/                       # Frontend (React + Babylon)
├── data/catalog.js        # Tüm veri: katalog, temalar, şablonlar, oda ölçüleri
├── api.js                 # Backend API istemcisi (fetch + JWT)
├── engine/                # Babylon katmanı (React'tan bağımsız)
│   ├── textures.js        # Prosedürel canvas dokuları (ahşap, fayans, duvar, mermer)
│   ├── materials.js       # MaterialLibrary — paylaşılan materyaller
│   ├── factories.js       # Mobilya mesh fabrikaları (her eşya = TransformNode)
│   ├── presets.js         # Hazır mutfak düzenleri (L köşe dahil)
│   ├── MeasureTool.js     # Ölçüm etiketleri (Babylon GUI ile mesh'e bağlı rozetler)
│   └── KitchenEngine.js   # Sahne, kamera, ışık, etkileşim, dinamik oda, serialize/load
├── hooks/
│   ├── useKitchen.js      # Babylon ⇄ React köprüsü
│   └── useAuth.js         # Oturum durumu
└── components/            # Sidebar (akordeon), Toolbar, RightPanel, Login, Viewport, HelpBar

server/                    # Backend (Go Fiber)
├── main.go                # Fiber app, route'lar, CORS, JSON hata handler
├── auth.go                # register/login/me + JWT + bcrypt
├── designs.go             # tasarım CRUD (kullanıcıya özel)
└── store.go               # JSON dosya tabanlı store (data.json)
```

**Tasarım ilkesi:** 3D mantığı `engine/` içinde React'tan tamamen ayrıdır;
React yalnızca `KitchenEngine`'in public metotlarını çağırır ve `onChange` ile
durumu dinler. Yeni bir eşya eklemek için `data/catalog.js` + `engine/factories.js`
dışında bir yere dokunmak gerekmez.

> Eski Three.js tek-dosya prototipi `legacy-threejs-demo.html` olarak saklandı.
