import { forwardRef } from "react";

// Babylon'un render hedefi olan canvas. ref dışarıdan (App) verilir.
const Viewport = forwardRef(function Viewport(_, ref) {
  return <canvas ref={ref} className="viewport" data-testid="space-scene-canvas" touch-action="none" />;
});

export default Viewport;
