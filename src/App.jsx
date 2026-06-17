import { useState } from "react";
import Viewport from "./components/Viewport.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Toolbar from "./components/Toolbar.jsx";
import HelpBar from "./components/HelpBar.jsx";
import RightPanel from "./components/RightPanel.jsx";
import Login from "./components/Login.jsx";
import { useKitchen } from "./hooks/useKitchen.js";
import { useAuth } from "./hooks/useAuth.js";

// Planner — yalnızca giriş yapıldığında mount edilir (canvas/motor o anda kurulur).
function Planner({ user, onLogout }) {
  const { canvasRef, state, actions } = useKitchen();
  // Tablet/mobilde panelleri çekmece (drawer) olarak aç/kapat.
  const [menuOpen, setMenuOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div className="app">
      <Viewport ref={canvasRef} />

      {/* Küçük ekran çekmece butonları (CSS ile yalnızca dar ekranda görünür) */}
      <button className={"drawer-toggle left" + (menuOpen ? " active" : "")} onClick={() => { setMenuOpen((o) => !o); setPanelOpen(false); }} aria-label="Katalog">
        {menuOpen ? "✕" : "☰"}
      </button>
      <button className={"drawer-toggle right" + (panelOpen ? " active" : "")} onClick={() => { setPanelOpen((o) => !o); setMenuOpen(false); }} aria-label="Panel">
        {panelOpen ? "✕" : "⚙"}
      </button>

      {(menuOpen || panelOpen) && (
        <div className="drawer-scrim" onClick={() => { setMenuOpen(false); setPanelOpen(false); }} />
      )}

      <Sidebar open={menuOpen} onAdd={actions.addItem} onPreset={actions.buildPreset} />
      <Toolbar state={state} actions={actions} />
      <RightPanel open={panelOpen} user={user} onLogout={onLogout} state={state} actions={actions} />
      <HelpBar count={state.count} selected={state.selected} />
    </div>
  );
}

export default function App() {
  const { user, ready, login, register, logout } = useAuth();

  if (!ready) {
    return <div className="loading">Yükleniyor…</div>;
  }
  if (!user) {
    return <Login onLogin={login} onRegister={register} />;
  }
  return <Planner user={user} onLogout={logout} />;
}
