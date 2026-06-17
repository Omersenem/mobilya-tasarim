import { MeshBuilder, Vector3, Color3 } from "@babylonjs/core";
import { AdvancedDynamicTexture, Rectangle, TextBlock } from "@babylonjs/gui";

// Seçili eşyanın en/derinlik/yükseklik ölçülerini IKEA planner tarzında
// gösterir: ön-üst-sağ köşede 3 eksenli beyaz köşebent + üstünde cm/inç
// rozetleri. Etiketler Babylon GUI ile mesh'e bağlanır; kamera döndükçe
// otomatik takip ederler (React tarafında 60fps yeniden render gerektirmez).
export class MeasureTool {
  constructor(scene) {
    this.scene = scene;
    this.node = null;
    this.active = false;
    this.unit = "cm";

    this.ui = AdvancedDynamicTexture.CreateFullscreenUI("measureUI", true, scene);

    // Etiketlerin tutunacağı görünmez 3D çapa noktaları.
    const anchor = (name) => {
      const m = MeshBuilder.CreateBox(name, { size: 0.001 }, scene);
      m.isVisible = false;
      m.isPickable = false;
      return m;
    };
    this.aW = anchor("anchorW");
    this.aD = anchor("anchorD");
    this.aH = anchor("anchorH");

    this.tW = this._badge(this.aW);
    this.tD = this._badge(this.aD);
    this.tH = this._badge(this.aH);

    // Köşebent çizgileri (genişlik/derinlik/yükseklik kenarları).
    this.lines = MeshBuilder.CreateLineSystem(
      "measLines",
      {
        lines: [
          [new Vector3(0, 0, 0), new Vector3(0, 0, 0)],
          [new Vector3(0, 0, 0), new Vector3(0, 0, 0)],
          [new Vector3(0, 0, 0), new Vector3(0, 0, 0)],
        ],
        updatable: true,
      },
      scene
    );
    this.lines.color = new Color3(1, 1, 1);
    this.lines.isPickable = false;

    this._setVisible(false);
  }

  _badge(anchor) {
    const rect = new Rectangle();
    rect.adaptWidthToChildren = true;
    rect.height = "26px";
    rect.cornerRadius = 9;
    rect.thickness = 0;
    rect.background = "rgba(15,20,28,0.92)";
    const tb = new TextBlock();
    tb.text = "";
    tb.color = "#ffffff";
    tb.fontSize = 14;
    tb.fontWeight = "600";
    tb.resizeToFit = true;
    tb.paddingLeft = "11px";
    tb.paddingRight = "11px";
    rect.addControl(tb);
    this.ui.addControl(rect);
    rect.linkWithMesh(anchor);
    rect.linkOffsetY = -4;
    rect.isVisible = false;
    return tb;
  }

  _fmt(meters) {
    if (this.unit === "in") return (meters * 39.3701).toFixed(1) + " in";
    return Math.round(meters * 100) + " cm";
  }

  _setVisible(v) {
    this.tW.isVisible = v;
    this.tD.isVisible = v;
    this.tH.isVisible = v;
    // GUI rect'leri TextBlock'un parent'ı; onları da gizle/göster.
    this.tW.parent.isVisible = v;
    this.tD.parent.isVisible = v;
    this.tH.parent.isVisible = v;
    this.lines.setEnabled(v);
  }

  setActive(on) {
    this.active = on;
    this._setVisible(on && !!this.node);
  }

  setNode(node) {
    this.node = node;
    this._setVisible(this.active && !!node);
  }

  setUnit(unit) {
    this.unit = unit;
  }

  /** Render döngüsünde her karede çağrılır. */
  update() {
    if (!this.active || !this.node) return;
    const { min, max } = this.node.getHierarchyBoundingVectors();
    const w = max.x - min.x;
    const h = max.y - min.y;
    const d = max.z - min.z;

    this.aW.position.set((min.x + max.x) / 2, max.y, max.z);
    this.aD.position.set(max.x, max.y, (min.z + max.z) / 2);
    this.aH.position.set(max.x, (min.y + max.y) / 2, max.z);

    this.tW.text = this._fmt(w);
    this.tD.text = this._fmt(d);
    this.tH.text = this._fmt(h);

    this.lines = MeshBuilder.CreateLineSystem("measLines", {
      lines: [
        [new Vector3(min.x, max.y, max.z), new Vector3(max.x, max.y, max.z)], // en
        [new Vector3(max.x, max.y, min.z), new Vector3(max.x, max.y, max.z)], // derinlik
        [new Vector3(max.x, min.y, max.z), new Vector3(max.x, max.y, max.z)], // yükseklik
      ],
      instance: this.lines,
    });
  }

  dispose() {
    this.ui.dispose();
    this.lines.dispose();
    this.aW.dispose();
    this.aD.dispose();
    this.aH.dispose();
  }
}
