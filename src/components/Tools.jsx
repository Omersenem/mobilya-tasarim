// Araç butonları (tema, dekor, düzen, döndür, sil, ölçüm, fotoğraf…).
// Hem üst toolbar'da (masaüstü) hem de sağ panelin "Araçlar" bölümünde (mobil)
// kullanılır.
export default function Tools({ state, actions }) {
  const sel = state.selected;
  return (
    <>
      <span className="pill theme" onClick={actions.nextTheme}>
        🎨 Görünüm: {state.themeName}
      </span>
      <span className={"pill" + (state.decorOn ? " on" : "")} onClick={actions.toggleDecor}>
        🛋️ Dekor: {state.decorOn ? "Açık" : "Kapalı"}
      </span>
      <span className={"pill" + (state.lShape ? " on" : "")} onClick={actions.toggleLayout}>
        {state.lShape ? "📐 L Köşe" : "▭ Tek Duvar"}
      </span>
      <span className={"pill" + (state.snapOn ? " on" : "")} onClick={actions.toggleSnap}>
        🧲 Izgara{state.snapOn ? "" : " (kapalı)"}
      </span>

      <span className="sep" />

      <span className={"pill" + (sel ? "" : " disabled")} onClick={actions.rotate}>
        🔄 Döndür
      </span>
      <span className={"pill" + (sel?.colorable ? "" : " disabled")} onClick={actions.color}>
        🎨 Renk
      </span>
      <span className={"pill danger" + (sel ? "" : " disabled")} onClick={actions.remove}>
        🗑️ Sil
      </span>
      <span className="pill" onClick={actions.clear}>
        ♻️ Temizle
      </span>

      <span className="sep" />

      <span className={"pill" + (state.measureOn ? " on" : "")} onClick={actions.toggleMeasure}>
        📏 {state.measureOn ? "Ölçümleri Kapat" : "Ölçüm"}
      </span>
      {state.measureOn && (
        <span className="unit-toggle">
          <button className={state.unit === "cm" ? "on" : ""} onClick={() => actions.setUnit("cm")}>
            cm
          </button>
          <button className={state.unit === "in" ? "on" : ""} onClick={() => actions.setUnit("in")}>
            in
          </button>
        </span>
      )}

      <span className="pill capture" onClick={actions.screenshot}>
        📸 Fotoğraf İndir
      </span>
    </>
  );
}
