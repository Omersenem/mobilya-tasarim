import {
  MeshBuilder,
  TransformNode,
  Vector3,
  Color3,
  Mesh,
} from "@babylonjs/core";

// Her fabrika bir TransformNode (kök) döndürür ve altına mesh'leri parent'lar.
// Kökün metadata'sında: { foot:[genişlik,derinlik], label, flat?, doorMeshes[] }.
// foot = oda içi yerleşim ve grid kenetlenmesinde kullanılan taban ölçüsü.

export function createFactories(scene, mat) {
  // --- Mesh kısayolları ---
  const box = (name, w, h, d, material) => {
    const m = MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, scene);
    m.material = material;
    return m;
  };
  const cyl = (name, dt, db, h, seg, material) => {
    const m = MeshBuilder.CreateCylinder(
      name,
      { diameterTop: dt, diameterBottom: db, height: h, tessellation: seg },
      scene
    );
    m.material = material;
    return m;
  };
  const plane = (name, w, h, material) => {
    const m = MeshBuilder.CreatePlane(name, { width: w, height: h, sideOrientation: Mesh.DOUBLESIDE }, scene);
    m.material = material;
    return m;
  };

  // Shaker tarzı kapak: çerçeve + iç pano + krom kulp. doorMeshes'e eklenen
  // mesh'ler "renk değiştir" aracıyla yeniden boyanabilir.
  function door(w, h, color, z, doorMeshes) {
    const g = new TransformNode("door", scene);
    const face = box("door-face", w, h, 0.03, mat.matte(color, 0.25));
    face.parent = g;
    const inset = box("door-inset", w * 0.72, h * 0.78, 0.012, mat.matte(color, 0.35));
    inset.position.z = 0.021;
    inset.parent = g;
    const handle = cyl("door-handle", 0.016, 0.016, h * 0.32, 10, mat.chrome());
    handle.position.set(w * 0.36, 0, 0.04);
    handle.parent = g;
    g.position.z = z;
    doorMeshes.push(face, inset);
    return g;
  }

  function toeKick(w, d) {
    const t = box("toekick", w - 0.04, 0.1, d - 0.06, mat.matte("#2a2f35", 0.1));
    t.position.y = 0.05;
    return t;
  }

  function root(label, foot, extra = {}) {
    const g = new TransformNode("furniture", scene);
    g.metadata = { label, foot, doorMeshes: [], ...extra };
    return g;
  }

  const carcass = mat.matte("#f0efec", 0.2);

  // --- Fabrikalar ---
  const F = {
    base(color = "#f2f1ee") {
      const g = root("Alt Dolap", [0.64, 0.6], { colorable: true });
      const d = g.metadata.doorMeshes;
      toeKick(0.6, 0.58).parent = g;
      const body = box("body", 0.6, 0.72, 0.56, carcass);
      body.position.y = 0.46;
      body.parent = g;
      const dL = door(0.27, 0.66, color, 0.285, d);
      dL.position.set(-0.145, 0.46, 0.285);
      dL.parent = g;
      const dR = door(0.27, 0.66, color, 0.285, d);
      dR.position.set(0.145, 0.46, 0.285);
      dR.getChildMeshes().find((m) => m.name === "door-handle").position.x = -0.097;
      dR.parent = g;
      const top = box("top", 0.64, 0.05, 0.6, mat.counter());
      top.position.y = 0.845;
      top.parent = g;
      return g;
    },

    wall(color = "#f2f1ee") {
      const g = root("Üst Dolap", [0.6, 0.34], { colorable: true });
      const body = box("body", 0.6, 0.7, 0.34, carcass);
      body.position.y = 1.85;
      body.parent = g;
      const d = door(0.54, 0.66, color, 0.18, g.metadata.doorMeshes);
      d.position.set(0, 1.85, 0.18);
      d.parent = g;
      return g;
    },

    tall(color = "#f2f1ee") {
      const g = root("Boy Dolap", [0.6, 0.58], { colorable: true });
      const d = g.metadata.doorMeshes;
      toeKick(0.6, 0.58).parent = g;
      const body = box("body", 0.6, 2.0, 0.56, carcass);
      body.position.y = 1.05;
      body.parent = g;
      const dT = door(0.54, 0.9, color, 0.285, d);
      dT.position.set(0, 1.5, 0.285);
      dT.parent = g;
      const dB = door(0.54, 0.9, color, 0.285, d);
      dB.position.set(0, 0.55, 0.285);
      dB.parent = g;
      return g;
    },

    // Köşe alt dolabı — L tezgahı köşede boşluksuz birleştirir. Kare gövde,
    // çapraz (45°) kapak, taban izi komşu dolaplarla örtüşecek kadar büyük.
    cornerBase(color = "#f2f1ee") {
      const g = root("Köşe Dolap", [0.9, 0.9], { colorable: true });
      const d = g.metadata.doorMeshes;
      toeKick(0.88, 0.88).parent = g;
      const body = box("body", 0.86, 0.72, 0.86, carcass);
      body.position.y = 0.46;
      body.parent = g;
      const door45 = door(0.55, 0.66, color, 0, d);
      door45.rotation.y = Math.PI / 4; // çapraz yüz odaya baksın
      door45.position.set(0.3, 0.46, 0.3);
      door45.parent = g;
      const top = box("top", 0.96, 0.05, 0.96, mat.counter());
      top.position.y = 0.845;
      top.parent = g;
      return g;
    },

    counter() {
      const g = root("Tezgah", [0.94, 0.6]);
      toeKick(0.9, 0.58).parent = g;
      const body = box("body", 0.9, 0.72, 0.56, carcass);
      body.position.y = 0.46;
      body.parent = g;
      const top = box("top", 0.94, 0.05, 0.6, mat.counter());
      top.position.y = 0.845;
      top.parent = g;
      return g;
    },

    fridge() {
      const g = root("Buzdolabı", [0.74, 0.7]);
      const body = box("body", 0.74, 1.88, 0.7, mat.steel());
      body.position.y = 0.94;
      body.parent = g;
      const seam = box("seam", 0.75, 0.014, 0.01, mat.matte("#8a9298", 0.4));
      seam.position.set(0, 1.08, 0.352);
      seam.parent = g;
      for (const y of [1.5, 0.55]) {
        const h = box("handle", 0.03, 0.5, 0.04, mat.chrome());
        h.position.set(-0.31, y, 0.37);
        h.parent = g;
      }
      return g;
    },

    oven() {
      const g = F.base("#eceae6");
      g.metadata.label = "Fırın";
      g.metadata.colorable = false;
      const panel = box("oven-panel", 0.5, 0.46, 0.02, mat.glass());
      panel.position.set(0, 0.45, 0.305);
      panel.parent = g;
      const bar = cyl("oven-bar", 0.036, 0.036, 0.46, 12, mat.chrome());
      bar.rotation.z = Math.PI / 2;
      bar.position.set(0, 0.72, 0.32);
      bar.parent = g;
      for (let i = 0; i < 4; i++) {
        const k = cyl("knob", 0.044, 0.044, 0.03, 16, mat.matte("#2a2f35", 0.5));
        k.rotation.x = Math.PI / 2;
        k.position.set(-0.18 + i * 0.12, 0.8, 0.315);
        k.parent = g;
      }
      return g;
    },

    stove() {
      const g = F.base("#eceae6");
      g.metadata.label = "Ocak";
      g.metadata.colorable = false;
      const cook = box("cooktop", 0.62, 0.04, 0.58, mat.matte("#14181d", 0.6));
      cook.position.y = 0.87;
      cook.parent = g;
      for (const [x, z] of [
        [-0.14, -0.13],
        [0.14, -0.13],
        [-0.14, 0.13],
        [0.14, 0.13],
      ]) {
        const b = cyl("burner", 0.15, 0.15, 0.012, 24, mat.matte("#2b2f34", 0.5));
        b.position.set(x, 0.892, z);
        b.parent = g;
        const r = cyl("ring", 0.1, 0.1, 0.014, 20, mat.matte("#1a1d21", 0.6));
        r.position.set(x, 0.9, z);
        r.parent = g;
      }
      return g;
    },

    sink() {
      const g = F.base("#eceae6");
      g.metadata.label = "Evye";
      g.metadata.colorable = false;
      const basin = box("basin", 0.44, 0.12, 0.4, mat.chrome());
      basin.position.y = 0.8;
      basin.parent = g;
      const inner = box("basin-inner", 0.36, 0.1, 0.32, mat.matte("#9aa1a7", 0.5));
      inner.position.y = 0.83;
      inner.parent = g;
      const fb = cyl("faucet-base", 0.04, 0.044, 0.22, 14, mat.chrome());
      fb.position.set(0, 0.96, -0.17);
      fb.parent = g;
      const fs = cyl("faucet-spout", 0.032, 0.032, 0.18, 14, mat.chrome());
      fs.rotation.z = Math.PI / 2.4;
      fs.position.set(0.04, 1.06, -0.13);
      fs.parent = g;
      return g;
    },

    dishwasher() {
      const g = root("Bulaşık Mak.", [0.64, 0.6]);
      const body = box("body", 0.6, 0.82, 0.56, mat.steel());
      body.position.y = 0.46;
      body.parent = g;
      const strip = box("strip", 0.5, 0.05, 0.015, mat.matte("#2a2f35", 0.5));
      strip.position.set(0, 0.77, 0.29);
      strip.parent = g;
      const handle = cyl("handle", 0.028, 0.028, 0.5, 12, mat.chrome());
      handle.rotation.z = Math.PI / 2;
      handle.position.set(0, 0.68, 0.3);
      handle.parent = g;
      const top = box("top", 0.64, 0.05, 0.6, mat.counter());
      top.position.y = 0.845;
      top.parent = g;
      return g;
    },

    hood() {
      const g = root("Davlumbaz", [0.52, 0.46]);
      const body = MeshBuilder.CreateCylinder(
        "hood-body",
        { diameterTop: 0.72, diameterBottom: 0.6, height: 0.18, tessellation: 4 },
        scene
      );
      body.material = mat.steel();
      body.rotation.y = Math.PI / 4;
      body.position.y = 1.55;
      body.parent = g;
      const chim = box("chimney", 0.2, 1.0, 0.2, mat.steel());
      chim.position.y = 2.13;
      chim.parent = g;
      return g;
    },

    // --- Dekor ---
    rug() {
      const g = root("Halı", [1.6, 2.4], { flat: true });
      const r = plane("rug", 1.6, 2.4, mat.rug("#b07a4a"));
      r.rotation.x = Math.PI / 2;
      r.position.y = 0.012;
      r.parent = g;
      return g;
    },

    plant() {
      const g = root("Bitki", [0.3, 0.3]);
      const pot = cyl("pot", 0.28, 0.2, 0.22, 16, mat.matte("#b5651d", 0.3));
      pot.position.y = 0.11;
      pot.parent = g;
      const soil = cyl("soil", 0.24, 0.24, 0.02, 16, mat.matte("#3b2a1a", 0.1));
      soil.position.y = 0.22;
      soil.parent = g;
      for (let i = 0; i < 5; i++) {
        const leaf = MeshBuilder.CreateIcoSphere("leaf", { radius: 0.14 + i * 0.02, subdivisions: 1 }, scene);
        leaf.material = mat.matte("#3f7d2e", 0.15);
        leaf.position.set(Math.sin(i * 1.3) * 0.07, 0.34 + i * 0.07, Math.cos(i * 1.3) * 0.07);
        leaf.parent = g;
      }
      return g;
    },

    stool() {
      const g = root("Tabure", [0.4, 0.4]);
      const seat = cyl("seat", 0.36, 0.36, 0.05, 20, mat.matte("#33404d", 0.3));
      seat.position.y = 0.62;
      seat.parent = g;
      for (const [x, z] of [
        [0.12, 0.12],
        [-0.12, 0.12],
        [0.12, -0.12],
        [-0.12, -0.12],
      ]) {
        const l = cyl("leg", 0.03, 0.03, 0.6, 8, mat.chrome());
        l.position.set(x, 0.31, z);
        l.parent = g;
      }
      return g;
    },

    table() {
      const g = root("Masa", [1.2, 0.75]);
      const top = box("top", 1.2, 0.06, 0.75, mat.matte("#8a5a32", 0.25));
      top.position.y = 0.74;
      top.parent = g;
      for (const [x, z] of [
        [0.52, 0.3],
        [-0.52, 0.3],
        [0.52, -0.3],
        [-0.52, -0.3],
      ]) {
        const l = box("leg", 0.06, 0.72, 0.06, mat.matte("#6b4423", 0.2));
        l.position.set(x, 0.37, z);
        l.parent = g;
      }
      return g;
    },
  };

  return F;
}
