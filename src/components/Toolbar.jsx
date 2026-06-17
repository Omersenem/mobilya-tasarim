import Tools from "./Tools.jsx";

// Üst araç çubuğu (masaüstü). Mobilde gizlenir; araçlar sağ panele taşınır.
export default function Toolbar({ state, actions }) {
  return (
    <div className="toolbar">
      <Tools state={state} actions={actions} />
    </div>
  );
}
