import { useEffect, useState, useCallback } from "react";
import { api } from "../api.js";
import Tools from "./Tools.jsx";

// Açılır-kapanır bölüm (sidebar ile aynı stil).
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

// Sağ panel: hesap, oda boyutları ve kayıtlı tasarımlar.
export default function RightPanel({ user, onLogout, state, actions, open: drawerOpen }) {
  const [open, setOpen] = useState({ tools: true, room: true, designs: true });
  const toggle = (k) => setOpen((o) => ({ ...o, [k]: !o[k] }));

  // ---- Oda boyutları (cm) ----
  const [w, setW] = useState(Math.round(state.roomX * 100));
  const [d, setD] = useState(Math.round(state.roomZ * 100));
  const [h, setH] = useState(Math.round(state.wallH * 100));
  // Motor (preset/yükleme) ölçüyü değiştirince input'ları senkronla.
  useEffect(() => setW(Math.round(state.roomX * 100)), [state.roomX]);
  useEffect(() => setD(Math.round(state.roomZ * 100)), [state.roomZ]);
  useEffect(() => setH(Math.round(state.wallH * 100)), [state.wallH]);
  const applyRoom = () => actions.setRoom(w / 100, d / 100, h / 100);

  // ---- Tasarımlar ----
  const [designs, setDesigns] = useState([]);
  const [name, setName] = useState("");
  const [loadedId, setLoadedId] = useState(null);
  const [msg, setMsg] = useState("");

  const refresh = useCallback(async () => {
    try {
      setDesigns(await api.listDesigns());
    } catch (e) {
      setMsg(e.message);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveNew = async () => {
    const nm = name.trim() || "Tasarım " + (designs.length + 1);
    try {
      const data = actions.serialize();
      const created = await api.createDesign(nm, data);
      setName("");
      setLoadedId(created.id);
      setMsg("Kaydedildi ✓");
      refresh();
    } catch (e) {
      setMsg(e.message);
    }
  };

  const update = async () => {
    if (!loadedId) return;
    try {
      await api.updateDesign(loadedId, undefined, actions.serialize());
      setMsg("Güncellendi ✓");
      refresh();
    } catch (e) {
      setMsg(e.message);
    }
  };

  const load = async (id) => {
    try {
      const design = await api.getDesign(id);
      actions.load(design.data);
      setLoadedId(id);
      setName(design.name);
      setMsg("Yüklendi: " + design.name);
    } catch (e) {
      setMsg(e.message);
    }
  };

  const remove = async (id) => {
    try {
      await api.deleteDesign(id);
      if (loadedId === id) setLoadedId(null);
      refresh();
    } catch (e) {
      setMsg(e.message);
    }
  };

  return (
    <aside className={"right-panel" + (drawerOpen ? " open" : "")}>
      <div className="account">
        <span className="acc-email" title={user.email}>
          👤 {user.email}
        </span>
        <button className="acc-logout" onClick={onLogout}>
          Çıkış
        </button>
      </div>

      {/* Araçlar — yalnızca mobil/tablet çekmecesinde görünür (üst toolbar gizli). */}
      <div className="mobile-only">
        <Section title="Araçlar" icon="🧰" open={open.tools} onToggle={() => toggle("tools")}>
          <div className="panel-tools">
            <Tools state={state} actions={actions} />
          </div>
        </Section>
      </div>

      <Section title="Oda Boyutları" icon="📐" open={open.room} onToggle={() => toggle("room")}>
        <div className="dim-row">
          <label>Genişlik</label>
          <input type="number" value={w} min={240} max={1000} onChange={(e) => setW(+e.target.value)} />
          <span>cm</span>
        </div>
        <div className="dim-row">
          <label>Derinlik</label>
          <input type="number" value={d} min={240} max={1000} onChange={(e) => setD(+e.target.value)} />
          <span>cm</span>
        </div>
        <div className="dim-row">
          <label>Yükseklik</label>
          <input type="number" value={h} min={200} max={400} onChange={(e) => setH(+e.target.value)} />
          <span>cm</span>
        </div>
        <button className="panel-btn" onClick={applyRoom}>
          Uygula
        </button>
      </Section>

      <Section title="Tasarımlarım" icon="💾" open={open.designs} onToggle={() => toggle("designs")}>
        <div className="save-row">
          <input
            type="text"
            placeholder="Tasarım adı"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="save-actions">
          <button className="panel-btn primary" onClick={saveNew}>
            💾 Kaydet
          </button>
          {loadedId && (
            <button className="panel-btn" onClick={update}>
              ♻️ Güncelle
            </button>
          )}
        </div>

        <div className="design-list">
          {designs.length === 0 && <div className="empty">Henüz kayıt yok</div>}
          {designs.map((dz) => (
            <div key={dz.id} className={"design-item" + (dz.id === loadedId ? " active" : "")}>
              <button className="design-load" onClick={() => load(dz.id)} title="Yükle">
                {dz.name}
              </button>
              <button className="design-del" onClick={() => remove(dz.id)} title="Sil">
                🗑️
              </button>
            </div>
          ))}
        </div>
        {msg && <div className="panel-msg">{msg}</div>}
      </Section>
    </aside>
  );
}
