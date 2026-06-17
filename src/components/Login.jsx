import { useState } from "react";
import HouseScene from "./HouseScene.jsx";

// Giriş / kayıt ekranı — sanatsal arka plan + cam (glassmorphism) kart.
export default function Login({ onLogin, onRegister }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      if (mode === "login") await onLogin(email, password);
      else await onRegister(email, password);
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-screen">
      <HouseScene />
      <div className="login-overlay" />

      {/* Sol taraf — marka/tanıtım */}
      <div className="login-hero">
        <div className="brand">
          <span className="brand-mark">🍳</span>
          <span className="brand-name">Mutfak Tasarım 3D</span>
        </div>
        <h2 className="hero-title">
          Hayalindeki mutfağı
          <br />
          <span className="grad">3 boyutlu</span> tasarla.
        </h2>
        <p className="hero-sub">
          Dolapları sürükle, ölçüleri gör, temayı değiştir ve tasarımını kaydet.
          IKEA planner deneyimi — tarayıcında.
        </p>
        <ul className="hero-points">
          <li>📐 Gerçek ölçüler &amp; oda boyutları</li>
          <li>🎨 Temalar &amp; anlık renk</li>
          <li>💾 Tasarımlarını kaydet &amp; geri yükle</li>
        </ul>
      </div>

      {/* Sağ taraf — form kartı */}
      <form className="login-card" onSubmit={submit}>
        <h1>{mode === "login" ? "Tekrar hoş geldin" : "Hesap oluştur"}</h1>
        <p className="login-sub">
          {mode === "login" ? "Tasarımlarına erişmek için giriş yap" : "Birkaç saniyede başla"}
        </p>

        <label>E-posta</label>
        <div className="field">
          <span className="field-ico">✉️</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ornek@mail.com"
            autoComplete="email"
            required
          />
        </div>

        <label>Şifre</label>
        <div className="field">
          <span className="field-ico">🔒</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="en az 4 karakter"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
          />
        </div>

        {err && <div className="login-err">{err}</div>}

        <button type="submit" className="login-btn" disabled={busy}>
          {busy ? "Lütfen bekle…" : mode === "login" ? "Giriş Yap" : "Kayıt Ol"}
        </button>

        <div className="login-switch">
          {mode === "login" ? "Hesabın yok mu?" : "Zaten hesabın var mı?"}{" "}
          <a onClick={() => { setErr(""); setMode(mode === "login" ? "register" : "login"); }}>
            {mode === "login" ? "Kayıt ol" : "Giriş yap"}
          </a>
        </div>
      </form>
    </div>
  );
}
