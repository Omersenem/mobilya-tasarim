import {
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  DirectionalLight,
  PointLight,
  ShadowGenerator,
  Vector3,
  Color3,
  Color4,
  MeshBuilder,
  StandardMaterial,
  TransformNode,
  HighlightLayer,
  Matrix,
  Plane,
  PointerEventTypes,
  Tools,
  Mesh,
  Scalar,
} from "@babylonjs/core";

import { MaterialLibrary } from "./materials.js";
import { createFactories } from "./factories.js";
import { buildPreset } from "./presets.js";
import { MeasureTool } from "./MeasureTool.js";
import { THEMES, PALETTE, ROOM } from "../data/catalog.js";

const WALL_T = 0.1; // duvar kalınlığı (kutu görünümü için)

// Babylon sahnesini ve tüm etkileşimi kapsayan motor. React tarafı yalnızca
// public metotları çağırır ve onChange ile durum değişimlerini dinler.
export class KitchenEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    this.scene = new Scene(this.engine);
    this.scene.clearColor = Color4.FromHexString("#d7dde3ff");
    this.scene.ambientColor = new Color3(0.35, 0.35, 0.35);

    // Oda ölçüleri (metre) — kullanıcı tarafından değiştirilebilir.
    this.roomX = ROOM.size;
    this.roomZ = ROOM.size;
    this.wallH = ROOM.wallHeight;

    this.items = [];
    this.selected = null;
    this.snapOn = true;
    this.lShape = true;
    this.themeIdx = 0;
    this.colorIdx = 0;
    this.measureOn = false;
    this.unit = "cm";
    this.roomMeshes = [];
    this.onChange = null; // React callback

    this._setupCamera();
    this._setupLights();
    this.mat = new MaterialLibrary(this.scene);
    this.factories = createFactories(this.scene, this.mat);
    this.highlight = new HighlightLayer("hl", this.scene);
    this.measure = new MeasureTool(this.scene);

    this._buildRoom();
    this._buildGrid();
    this._buildDecor();
    this._setupPointer();

    this.applyTheme(0);

    this.scene.onBeforeRenderObservable.add(() => this.measure.update());
    this.engine.runRenderLoop(() => this.scene.render());
  }

  _halfX() {
    return this.roomX / 2;
  }
  _halfZ() {
    return this.roomZ / 2;
  }

  // ---------- Kurulum ----------
  _setupCamera() {
    const cam = new ArcRotateCamera("cam", 0.9, 1.15, 7.8, new Vector3(0, 0.9, 0), this.scene);
    cam.lowerRadiusLimit = 2.6;
    cam.upperRadiusLimit = 20;
    cam.upperBetaLimit = Math.PI / 2.04;
    cam.wheelDeltaPercentage = 0.02;
    cam.panningSensibility = 0;
    cam.attachControl(this.canvas, true);
    this.camera = cam;
  }

  _setupLights() {
    this.hemi = new HemisphericLight("hemi", new Vector3(0, 1, 0), this.scene);
    this.hemi.intensity = 0.55;
    this.hemi.groundColor = new Color3(0.45, 0.43, 0.38);

    this.sun = new DirectionalLight("sun", new Vector3(-0.5, -1.1, -0.6), this.scene);
    this.sun.position = new Vector3(4.5, 7.5, 5);
    this.sun.intensity = 1.7;
    this.shadow = new ShadowGenerator(2048, this.sun);
    this.shadow.useBlurExponentialShadowMap = true;
    this.shadow.blurKernel = 32;
    this.shadow.darkness = 0.6;
  }

  // Odayı (zemin/duvar/süpürgelik/tavan/pencere) güncel ölçülerle kurar.
  _buildRoom() {
    const hx = this._halfX();
    const hz = this._halfZ();
    const H = this.wallH;
    const track = (m) => {
      this.roomMeshes.push(m);
      return m;
    };

    // Zemin
    this.floor = track(MeshBuilder.CreateGround("floor", { width: this.roomX, height: this.roomZ }, this.scene));
    this.floorMat = this.mat.floor("woodLight");
    this.floor.material = this.floorMat;
    this.floor.receiveShadows = true;

    // Duvarlar — kalınlığı olan kutular, köşede boşluk kalmayacak şekilde.
    this.wallBack = track(
      MeshBuilder.CreateBox("wallBack", { width: this.roomX + WALL_T, height: H, depth: WALL_T }, this.scene)
    );
    this.wallBack.position.set(-WALL_T / 2, H / 2, -hz - WALL_T / 2);
    this.wallBack.receiveShadows = true;
    this.wallBack.isPickable = false;

    this.wallLeft = track(
      MeshBuilder.CreateBox("wallLeft", { width: WALL_T, height: H, depth: this.roomZ }, this.scene)
    );
    this.wallLeft.position.set(-hx - WALL_T / 2, H / 2, 0);
    this.wallLeft.receiveShadows = true;
    this.wallLeft.isPickable = false;

    // Süpürgelik
    const bbMat = this.mat.matte("#f4f1ec", 0.1);
    const bb1 = track(MeshBuilder.CreateBox("bb1", { width: this.roomX, height: 0.1, depth: 0.02 }, this.scene));
    bb1.position.set(0, 0.05, -hz + 0.012);
    bb1.material = bbMat;
    bb1.isPickable = false;
    const bb2 = track(MeshBuilder.CreateBox("bb2", { width: this.roomZ, height: 0.1, depth: 0.02 }, this.scene));
    bb2.rotation.y = Math.PI / 2;
    bb2.position.set(-hx + 0.012, 0.05, 0);
    bb2.material = bbMat;
    bb2.isPickable = false;
    this.baseboardLeft = bb2;

    // Tavan
    const ceil = track(
      MeshBuilder.CreatePlane("ceiling", { width: this.roomX, height: this.roomZ, sideOrientation: Mesh.DOUBLESIDE }, this.scene)
    );
    ceil.rotation.x = -Math.PI / 2;
    ceil.position.y = H;
    ceil.material = this.mat.matte("#f6f5f2", 0.05);
    ceil.isPickable = false;

    this._buildWindow(hz, H);

    // Mevcut düzeni uygula (tek duvar modunda sol duvar gizli).
    this.wallLeft.setEnabled(this.lShape);
    this.baseboardLeft.setEnabled(this.lShape);
  }

  _buildWindow(hz, H) {
    const g = new TransformNode("window", this.scene);
    this.windowNode = g;
    const viewMat = new StandardMaterial("view", this.scene);
    viewMat.diffuseTexture = this.mat.tex.sky;
    viewMat.emissiveColor = new Color3(0.9, 0.95, 1);
    viewMat.disableLighting = true;
    const view = MeshBuilder.CreatePlane("view", { width: 1.5, height: 1.1 }, this.scene);
    view.material = viewMat;
    view.position.z = 0.01;
    view.parent = g;
    view.isPickable = false;

    const fm = this.mat.matte("#ffffff", 0.3);
    const bar = (w, h, x, y) => {
      const b = MeshBuilder.CreateBox("bar", { width: w, height: h, depth: 0.06 }, this.scene);
      b.material = fm;
      b.position.set(x, y, 0.03);
      b.parent = g;
      b.isPickable = false;
    };
    bar(1.62, 0.07, 0, 0.57);
    bar(1.62, 0.07, 0, -0.57);
    bar(0.07, 1.2, -0.79, 0);
    bar(0.07, 1.2, 0.79, 0);
    bar(0.06, 1.14, 0, 0);
    g.position.set(Math.min(0.3, hz - 1), Math.min(1.55, H - 1.15), -hz + 0.02);
    this.roomMeshes.push(g);
  }

  _buildGrid() {
    const hx = this._halfX();
    const hz = this._halfZ();
    const step = 0.4;
    const lines = [];
    for (let x = -hx; x <= hx + 0.001; x += step) lines.push([new Vector3(x, 0.005, -hz), new Vector3(x, 0.005, hz)]);
    for (let z = -hz; z <= hz + 0.001; z += step) lines.push([new Vector3(-hx, 0.005, z), new Vector3(hx, 0.005, z)]);
    this.grid = MeshBuilder.CreateLineSystem("grid", { lines }, this.scene);
    this.grid.color = new Color3(0.6, 0.65, 0.7);
    this.grid.alpha = 0.5;
    this.grid.isPickable = false;
  }

  _buildDecor() {
    this.decor = new TransformNode("decor", this.scene);
    this.decorOn = true;
    this.pendants = [];

    this.rugMesh = MeshBuilder.CreatePlane("decor-rug", { width: 2.0, height: 2.8 }, this.scene);
    this.rugMesh.material = this.mat.rug("#b07a4a");
    this.rugMesh.rotation.x = Math.PI / 2;
    this.rugMesh.parent = this.decor;
    this.rugMesh.isPickable = false;
    this.rugMesh.receiveShadows = true;

    this.plant1 = this.factories.plant();
    this.plant1.parent = this.decor;
    this._registerShadows(this.plant1);
    this.plant2 = this.factories.plant();
    this.plant2.scaling.setAll(0.8);
    this.plant2.parent = this.decor;
    this._registerShadows(this.plant2);

    for (const x of [-0.2, 0.9]) {
      const lg = new TransformNode("pendant", this.scene);
      const cord = MeshBuilder.CreateCylinder("cord", { diameterTop: 0.012, diameterBottom: 0.012, height: 0.6, tessellation: 6 }, this.scene);
      cord.material = this.mat.matte("#222222", 0.1);
      cord.position.y = 2.4;
      cord.parent = lg;
      cord.isPickable = false;
      const shade = MeshBuilder.CreateCylinder("shade", { diameterTop: 0, diameterBottom: 0.32, height: 0.2, tessellation: 18 }, this.scene);
      shade.material = this.mat.matte("#33404d", 0.4);
      shade.position.y = 2.0;
      shade.parent = lg;
      shade.isPickable = false;
      const bulbMat = new StandardMaterial("bulb", this.scene);
      bulbMat.diffuseColor = Color3.FromHexString("#fff3d0");
      bulbMat.emissiveColor = new Color3(0.3, 0.25, 0.15);
      const bulb = MeshBuilder.CreateCylinder("bulb", { diameter: 0.1, height: 0.04, tessellation: 12 }, this.scene);
      bulb.material = bulbMat;
      bulb.position.y = 1.95;
      bulb.parent = lg;
      bulb.isPickable = false;
      const pl = new PointLight("pl", new Vector3(0, 1.92, 0), this.scene);
      pl.diffuse = Color3.FromHexString("#ffd9a0");
      pl.intensity = 0;
      pl.range = 4;
      pl.parent = lg;
      lg.parent = this.decor;
      this.pendants.push({ pl, bulbMat, lg, baseX: x });
    }
    this._layoutDecor();
  }

  // Dekoru güncel oda ölçülerine göre konumlandırır.
  _layoutDecor() {
    const hx = this._halfX();
    const hz = this._halfZ();
    this.rugMesh.position.set(0, 0.012, Math.min(0.9, hz - 0.8));
    this.plant1.position.set(hx - 0.4, 0, hz - 0.4);
    this.plant2.position.set(-hx + 0.35, 0, hz - 0.5);
    for (const p of this.pendants) p.lg.position.set(p.baseX, 0, Math.min(0.7, hz - 0.8));
  }

  _registerShadows(node) {
    for (const m of node.getChildMeshes()) {
      this.shadow.addShadowCaster(m);
      m.receiveShadows = true;
    }
  }

  // ---------- Oda boyutları ----------
  setRoom(x, z, h) {
    this.roomX = Scalar.Clamp(x, 2.4, 10);
    this.roomZ = Scalar.Clamp(z, 2.4, 10);
    this.wallH = Scalar.Clamp(h, 2.0, 4.0);
    // Eski oda + grid mesh'lerini at (paylaşılan materyallere dokunmadan).
    for (const m of this.roomMeshes) m.dispose();
    this.roomMeshes = [];
    this.grid.dispose();
    this._buildRoom();
    this._buildGrid();
    this._layoutDecor();
    this.applyTheme(this.themeIdx); // doku/renkleri yeni mesh'lere uygula
    for (const g of this.items) this._applySnap(g); // eşyaları yeni sınıra çek
    this._notify();
  }

  // ---------- Etkileşim ----------
  _setupPointer() {
    const groundPlane = Plane.FromPositionAndNormal(Vector3.Zero(), new Vector3(0, 1, 0));
    let dragging = false;
    const dragOffset = new Vector3();

    const groundPoint = () => {
      const ray = this.scene.createPickingRay(this.scene.pointerX, this.scene.pointerY, Matrix.Identity(), this.camera);
      const d = ray.intersectsPlane(groundPlane);
      return d == null ? null : ray.origin.add(ray.direction.scale(d));
    };

    this.scene.onPointerObservable.add((pi) => {
      if (pi.type === PointerEventTypes.POINTERDOWN) {
        if (pi.event.button !== 0) return;
        const pick = this.scene.pick(this.scene.pointerX, this.scene.pointerY, (m) => this._rootOf(m) != null);
        if (pick?.hit) {
          const root = this._rootOf(pick.pickedMesh);
          this.select(root);
          const gp = groundPoint();
          if (gp) dragOffset.set(root.position.x - gp.x, 0, root.position.z - gp.z);
          dragging = true;
          this.camera.detachControl();
        } else {
          this.select(null);
        }
      } else if (pi.type === PointerEventTypes.POINTERMOVE) {
        if (!dragging || !this.selected) return;
        const gp = groundPoint();
        if (gp) {
          this.selected.position.x = gp.x + dragOffset.x;
          this.selected.position.z = gp.z + dragOffset.z;
          this._applySnap(this.selected);
        }
      } else if (pi.type === PointerEventTypes.POINTERUP) {
        if (dragging) {
          dragging = false;
          this.camera.attachControl(this.canvas, true);
        }
      }
    });
  }

  _rootOf(mesh) {
    let n = mesh;
    while (n) {
      if (this.items.includes(n)) return n;
      n = n.parent;
    }
    return null;
  }

  _applySnap(g) {
    const hx = this._halfX();
    const hz = this._halfZ();
    let x = g.position.x;
    let z = g.position.z;
    if (this.snapOn && !g.metadata.flat) {
      x = Math.round(x / ROOM.snap) * ROOM.snap;
      z = Math.round(z / ROOM.snap) * ROOM.snap;
    }
    const fw = (g.metadata.foot?.[0] || 0.6) / 2;
    const fd = (g.metadata.foot?.[1] || 0.6) / 2;
    g.position.x = Scalar.Clamp(x, -hx + fw, hx - fw);
    g.position.z = Scalar.Clamp(z, -hz + fd, hz - fd);
  }

  // ---------- Eşya yönetimi ----------
  _spawn(type) {
    const g = this.factories[type]();
    g.metadata.type = type;
    this.items.push(g);
    this._registerShadows(g);
    return g;
  }

  addItem(type) {
    const g = this._spawn(type);
    const hx = this._halfX();
    const hz = this._halfZ();
    g.position.set(-hx + 0.5 + ((this.items.length * 0.18) % 1.4), 0, -hz + 0.5);
    this._applySnap(g);
    this.select(g);
    this._notify();
    return g;
  }

  place(type, x, z, rotDeg = 0) {
    const g = this._spawn(type);
    g.position.set(x, 0, z);
    if (rotDeg) {
      g.rotation.y = (rotDeg * Math.PI) / 180;
      if (rotDeg % 180 !== 0) {
        const f = g.metadata.foot;
        if (f) g.metadata.foot = [f[1], f[0]];
      }
    }
    this._applySnap(g);
    return g;
  }

  select(node) {
    this.selected = node;
    this.highlight.removeAllMeshes();
    if (node) {
      for (const m of node.getChildMeshes()) this.highlight.addMesh(m, new Color3(0.15, 0.4, 0.95));
    }
    this.measure.setNode(node);
    this._notify();
  }

  deleteSelected() {
    if (!this.selected) return;
    const g = this.selected;
    this.highlight.removeAllMeshes();
    this.measure.setNode(null);
    this.items.splice(this.items.indexOf(g), 1);
    g.dispose(false, true);
    this.selected = null;
    this._notify();
  }

  clearAll() {
    this.highlight.removeAllMeshes();
    this.measure.setNode(null);
    for (const g of this.items) g.dispose(false, true);
    this.items = [];
    this.selected = null;
    this._notify();
  }

  rotateSelected() {
    if (!this.selected) return;
    this.selected.rotation.y += Math.PI / 2;
    const f = this.selected.metadata.foot;
    if (f) this.selected.metadata.foot = [f[1], f[0]];
    this._applySnap(this.selected);
  }

  _applyColor(node, hex) {
    node.metadata.color = hex;
    const c = Color3.FromHexString(hex);
    for (const m of node.metadata.doorMeshes) if (m.material) m.material.diffuseColor = c;
  }

  colorSelected() {
    if (!this.selected || !this.selected.metadata.colorable) return;
    const hex = PALETTE[this.colorIdx++ % PALETTE.length];
    this._applyColor(this.selected, hex);
  }

  buildPreset(id) {
    this.clearAll();
    buildPreset(id, { place: (t, x, z, r) => this.place(t, x, z, r), setLayout: (on) => this.setLayout(on) });
    this.select(null);
    this._notify();
  }

  // ---------- Görünüm / ayarlar ----------
  applyTheme(i) {
    this.themeIdx = ((i % THEMES.length) + THEMES.length) % THEMES.length;
    const t = THEMES[this.themeIdx];
    this.floorMat.diffuseTexture = this.mat.tex[t.floor];
    const wm = this.mat.wallMats[t.id];
    this.wallBack.material = wm;
    this.wallLeft.material = wm;
    this.scene.clearColor = Color4.FromHexString(t.bg + "ff");
    this.hemi.intensity = t.hemi;
    this.sun.intensity = t.sun;
    this.sun.diffuse = Color3.FromHexString(t.sunColor);
    if (this.rugMesh) this.rugMesh.material = this.mat.rug(t.rug);
    for (const p of this.pendants) {
      p.pl.intensity = t.pendant;
      const e = t.pendant ? 1.6 : 0.3;
      p.bulbMat.emissiveColor = new Color3(e, e * 0.85, e * 0.55);
    }
    this._notify();
    return t;
  }

  setLayout(on) {
    this.lShape = on;
    this.wallLeft.setEnabled(on);
    this.baseboardLeft.setEnabled(on);
    this._notify();
  }

  setSnap(on) {
    this.snapOn = on;
    this._notify();
  }

  setMeasure(on) {
    this.measureOn = on;
    this.measure.setActive(on);
    this.measure.setNode(this.selected);
    this._notify();
  }

  setUnit(unit) {
    this.unit = unit;
    this.measure.setUnit(unit);
    this._notify();
  }

  toggleDecor() {
    this.decorOn = !this.decorOn;
    this.decor.setEnabled(this.decorOn);
    this._notify();
  }

  // ---------- Kaydet / Yükle ----------
  serialize() {
    return {
      room: { x: +this.roomX.toFixed(2), z: +this.roomZ.toFixed(2), h: +this.wallH.toFixed(2) },
      themeIdx: this.themeIdx,
      lShape: this.lShape,
      decorOn: this.decorOn,
      items: this.items.map((g) => ({
        type: g.metadata.type,
        x: +g.position.x.toFixed(3),
        z: +g.position.z.toFixed(3),
        rotDeg: ((Math.round((g.rotation.y * 180) / Math.PI) % 360) + 360) % 360,
        color: g.metadata.color || null,
      })),
    };
  }

  load(data) {
    if (!data) return;
    this.clearAll();
    this.lShape = data.lShape ?? true;
    const r = data.room || {};
    this.setRoom(r.x || ROOM.size, r.z || ROOM.size, r.h || ROOM.wallHeight);
    this.applyTheme(data.themeIdx || 0);
    this.decorOn = data.decorOn ?? true;
    this.decor.setEnabled(this.decorOn);
    for (const it of data.items || []) {
      const g = this.place(it.type, it.x, it.z, it.rotDeg || 0);
      if (it.color) this._applyColor(g, it.color);
    }
    this.select(null);
    this._notify();
  }

  // ---------- Fotoğraf indir ----------
  screenshot() {
    const wasGrid = this.grid.isEnabled();
    const hadSel = this.selected;
    this.grid.setEnabled(false);
    this.highlight.removeAllMeshes();
    this.scene.render();
    Tools.CreateScreenshotUsingRenderTarget(this.engine, this.camera, { width: 1920, height: 1280 }, (data) => {
      const a = document.createElement("a");
      a.href = data;
      a.download = "mutfak-tasarim.png";
      a.click();
      this.grid.setEnabled(wasGrid);
      if (hadSel) this.select(hadSel);
    });
  }

  // ---------- React köprüsü ----------
  state() {
    return {
      count: this.items.length,
      selected: this.selected
        ? { label: this.selected.metadata.label, colorable: !!this.selected.metadata.colorable }
        : null,
      themeName: THEMES[this.themeIdx].name,
      themeIdx: this.themeIdx,
      snapOn: this.snapOn,
      lShape: this.lShape,
      decorOn: this.decorOn,
      measureOn: this.measureOn,
      unit: this.unit,
      roomX: +this.roomX.toFixed(2),
      roomZ: +this.roomZ.toFixed(2),
      wallH: +this.wallH.toFixed(2),
    };
  }

  _notify() {
    if (this.onChange) this.onChange(this.state());
  }

  resize() {
    this.engine.resize();
  }

  dispose() {
    this.engine.stopRenderLoop();
    this.measure.dispose();
    this.scene.dispose();
    this.engine.dispose();
  }
}
