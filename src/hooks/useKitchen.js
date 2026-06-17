import { useEffect, useRef, useState, useCallback } from "react";
import { KitchenEngine } from "../engine/KitchenEngine.js";

// Babylon motorunu bir React canvas'ına bağlayan köprü. Motorun durumunu
// (seçim, sayım, tema...) React state'ine yansıtır ve aksiyonları döndürür.
export function useKitchen() {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const [state, setState] = useState({
    count: 0,
    selected: null,
    themeName: "",
    themeIdx: 0,
    snapOn: true,
    lShape: true,
    decorOn: true,
    measureOn: false,
    unit: "cm",
    roomX: 4.4,
    roomZ: 4.4,
    wallH: 2.7,
  });

  useEffect(() => {
    const engine = new KitchenEngine(canvasRef.current);
    engineRef.current = engine;
    engine.onChange = setState;
    engine.buildPreset("L"); // açılışta hazır L mutfak

    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);

    const onKey = (e) => {
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "r" || e.key === "R") engine.rotateSelected();
      else if (e.key === "Delete" || e.key === "Backspace") engine.deleteSelected();
      else if (e.key === "Escape") engine.select(null);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  const call = (fn) => (...args) => engineRef.current && fn(engineRef.current, ...args);

  const actions = {
    addItem: useCallback(call((e, type) => e.addItem(type)), []),
    buildPreset: useCallback(call((e, id) => e.buildPreset(id)), []),
    rotate: useCallback(call((e) => e.rotateSelected()), []),
    remove: useCallback(call((e) => e.deleteSelected()), []),
    color: useCallback(call((e) => e.colorSelected()), []),
    clear: useCallback(call((e) => e.clearAll()), []),
    nextTheme: useCallback(call((e) => e.applyTheme(e.themeIdx + 1)), []),
    toggleLayout: useCallback(call((e) => e.setLayout(!e.lShape)), []),
    toggleSnap: useCallback(call((e) => e.setSnap(!e.snapOn)), []),
    toggleDecor: useCallback(call((e) => e.toggleDecor()), []),
    toggleMeasure: useCallback(call((e) => e.setMeasure(!e.measureOn)), []),
    setUnit: useCallback(call((e, u) => e.setUnit(u)), []),
    setRoom: useCallback(call((e, x, z, h) => e.setRoom(x, z, h)), []),
    serialize: useCallback(call((e) => e.serialize()), []),
    load: useCallback(call((e, data) => e.load(data)), []),
    screenshot: useCallback(call((e) => e.screenshot()), []),
  };

  return { canvasRef, state, actions };
}
