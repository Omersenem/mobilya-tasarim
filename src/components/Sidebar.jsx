import { useState } from "react";
import { CATALOG, PRESETS } from "../data/catalog.js";

// Açılır-kapanır (akordeon) kategori başlığı.
function Section({ title, icon, open, onToggle, children }) {
  return (
    <div className="section">
      <button className={"section-head" + (open ? " open" : "")} onClick={onToggle}>
        <span className="section-title">
          {icon} {title}
        </span>
        <span className="chevron">{open ? "▾" : "▸"}</span>
      </button>
      {open && <div className="section-body">{children}</div>}
    </div>
  );
}

// Sol panel: hazır mutfaklar + kategoriye ayrılmış, başlığa basılınca açılan
// menü şeklinde eşya kataloğu.
export default function Sidebar({ onAdd, onPreset, open: drawerOpen }) {
  // Başlangıçta "Hazır Mutfaklar" ve ilk kategori açık.
  const [open, setOpen] = useState({ presets: true, Dolaplar: true });
  const toggle = (key) => setOpen((o) => ({ ...o, [key]: !o[key] }));

  return (
    <aside className={"sidebar" + (drawerOpen ? " open" : "")}>
      <header>
        <h1>🍳 Mutfak Tasarım 3D</h1>
        <p className="sub">Tıkla → ekle · Sürükle → yerleştir</p>
      </header>

      <Section title="Hazır Mutfaklar" icon="⚡" open={!!open.presets} onToggle={() => toggle("presets")}>
        {PRESETS.map((p) => (
          <button key={p.id} className="item-btn preset" onClick={() => onPreset(p.id)}>
            <span className="ico">{p.icon}</span>
            {p.label}
          </button>
        ))}
      </Section>

      {CATALOG.map((cat) => (
        <Section key={cat.group} title={cat.group} icon={cat.icon} open={!!open[cat.group]} onToggle={() => toggle(cat.group)}>
          {cat.items.map((it) => (
            <button key={it.type} className="item-btn" onClick={() => onAdd(it.type)}>
              <span className="ico">{it.icon}</span>
              {it.label}
            </button>
          ))}
        </Section>
      ))}
    </aside>
  );
}
