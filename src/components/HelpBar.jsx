// Alt yardım çubuğu + obje sayacı.
export default function HelpBar({ count, selected }) {
  return (
    <>
      <div className="help">
        <b>Kamera:</b> sol tık döndür · tekerlek yakınlaş ·{" "}
        <b>Eşya:</b> tıkla seç + sürükle · <kbd>R</kbd> döndür · <kbd>Del</kbd> sil ·{" "}
        <kbd>Esc</kbd> bırak
      </div>
      <div className="count">
        {selected ? `▸ ${selected.label}  ·  ` : ""}
        {count} obje
      </div>
    </>
  );
}
