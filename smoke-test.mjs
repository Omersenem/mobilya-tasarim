import puppeteer from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const URL = "http://localhost:5173/";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

const errors = [];
page.on("console", (m) => {
  if (m.type() === "error") errors.push("console.error: " + m.text());
});
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

const log = (k, v) => console.log(k.padEnd(22), ":", v);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 30000 });

// 1) Login ekranı geldi mi
await page.waitForSelector(".login-card", { timeout: 10000 });
log("login ekranı", "var ✓");

// 2) Kayıt moduna geç ve kayıt ol (benzersiz e-posta)
await page.click(".login-switch a");
await wait(150);
const email = `u${Date.now()}@test.com`;
await page.type(".login-card input[type=email]", email);
await page.type(".login-card input[type=password]", "1234");
await page.click(".login-btn");

// 3) Planner mount oldu mu (canvas)
await page.waitForSelector('canvas[data-testid="space-scene-canvas"]', { timeout: 15000 });
await wait(2500);
log("planner mount", "var ✓");

// 4) Akordeon: sidebar bölümleri ve sağ panel
const sections = await page.$$eval(".section-head", (e) => e.length);
log("akordeon bölümleri", sections);
const hasRight = !!(await page.$(".right-panel"));
log("sağ panel", hasRight);

// 5) "Beyaz Eşya" bölümünü aç, sonra bir eşya ekle
await page.$$eval(".section-head", (els) => els.find((e) => e.textContent.includes("Beyaz Eşya"))?.click());
await wait(300);
await page.$$eval(".item-btn", (els) => els.find((e) => e.textContent.includes("Buzdolabı"))?.click());
await wait(400);
const count1 = await page.$eval(".count", (el) => el.textContent.trim());
log("eşya eklendi (sayaç)", count1);

// 6) Oda boyutu değiştir (genişlik 360 cm) → Uygula
const wInput = await page.$(".dim-row input");
await wInput.click({ clickCount: 3 });
await wInput.type("360");
await page.$$eval(".panel-btn", (els) => els.find((e) => e.textContent.includes("Uygula"))?.click());
await wait(600);
log("oda boyutu uygulandı", "ok");

// 7) Tasarımı kaydet
await page.type(".save-row input", "Test Tasarımı");
await page.$$eval(".panel-btn", (els) => els.find((e) => e.textContent.includes("Kaydet"))?.click());
await wait(700);
const designCount = await page.$$eval(".design-item", (e) => e.length);
log("kayıtlı tasarım sayısı", designCount);
const designName = await page.$eval(".design-load", (e) => e.textContent.trim()).catch(() => "(yok)");
log("kayıtlı tasarım adı", designName);

// 8) L preset + ölçüm + screenshot
await page.$$eval(".item-btn.preset", (els) => els.find((e) => e.textContent.includes("L Mutfak"))?.click());
await wait(800);
await page.$$eval(".item-btn", (els) => els.find((e) => e.textContent.includes("Alt Dolap"))?.click());
await wait(300);
await page.$$eval(".pill", (els) => els.find((e) => e.textContent.trim().startsWith("📏"))?.click());
await wait(700);
const countL = await page.$eval(".count", (el) => el.textContent.trim());
log("L preset sonrası", countL);

// 9) Kayıtlı tasarımı geri yükle
await page.click(".design-load");
await wait(900);
const countLoaded = await page.$eval(".count", (el) => el.textContent.trim());
log("yükleme sonrası sayaç", countLoaded);

await page.screenshot({ path: "smoke-screenshot.png" });
await browser.close();

console.log("hata sayısı".padEnd(22), ":", errors.length);
if (errors.length) {
  console.log("--- HATALAR ---");
  errors.forEach((e) => console.log(e));
  process.exit(1);
}
console.log("✅ Tüm akış geçti");
