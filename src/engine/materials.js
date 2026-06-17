import { StandardMaterial, Color3 } from "@babylonjs/core";
import {
  woodTexture,
  tileTexture,
  marbleTexture,
  rugTexture,
  skyTexture,
  wallTexture,
} from "./textures.js";
import { THEMES } from "../data/catalog.js";

// Materyalleri tek bir kütüphanede topluyoruz. Çevre HDR'ına bağımlı kalmamak
// için StandardMaterial kullanıyoruz: metaller specular highlight ile parlıyor,
// böylece çevrimdışı da güvenilir çalışıyor.

const hex = (h) => Color3.FromHexString(h);

export class MaterialLibrary {
  constructor(scene) {
    this.scene = scene;

    // Paylaşılan zemin dokuları (tema değişiminde yeniden kullanılır).
    this.tex = {
      woodLight: woodTexture("woodLight", "#b78a5a", 0.18, 2, scene),
      woodDark: woodTexture("woodDark", "#6f4a30", 0.22, 2, scene),
      tile: tileTexture("tile", "#e7e3da", "#b9b3a6", 3, scene),
      marble: marbleTexture("marble", scene),
      sky: skyTexture("sky", scene),
    };

    // Tema başına fayanslı duvar materyali (önceden üretilip yeniden kullanılır).
    this.wallMats = {};
    for (const t of THEMES) {
      const m = new StandardMaterial("wall_" + t.id, scene);
      m.diffuseTexture = wallTexture("wall_" + t.id, t.wall, 4, scene);
      m.specularColor = new Color3(0.03, 0.03, 0.03);
      this.wallMats[t.id] = m;
    }
  }

  /** Boyalı/mat gövde malzemesi. */
  matte(color, gloss = 0.3) {
    const m = new StandardMaterial("matte", this.scene);
    m.diffuseColor = hex(color);
    m.specularColor = new Color3(gloss, gloss, gloss);
    m.specularPower = 32;
    return m;
  }

  steel() {
    const m = new StandardMaterial("steel", this.scene);
    m.diffuseColor = hex("#c2c8ce");
    m.specularColor = new Color3(0.9, 0.92, 0.95);
    m.specularPower = 64;
    return m;
  }

  chrome() {
    const m = new StandardMaterial("chrome", this.scene);
    m.diffuseColor = hex("#dfe3e7");
    m.specularColor = new Color3(1, 1, 1);
    m.specularPower = 128;
    return m;
  }

  glass() {
    const m = new StandardMaterial("glass", this.scene);
    m.diffuseColor = hex("#10151b");
    m.specularColor = new Color3(0.8, 0.85, 0.9);
    m.specularPower = 96;
    return m;
  }

  counter() {
    const m = new StandardMaterial("counter", this.scene);
    m.diffuseTexture = this.tex.marble;
    m.specularColor = new Color3(0.3, 0.3, 0.3);
    m.specularPower = 48;
    return m;
  }

  floor(texKey) {
    const m = new StandardMaterial("floor", this.scene);
    m.diffuseTexture = this.tex[texKey];
    m.specularColor = new Color3(0.05, 0.05, 0.05);
    return m;
  }

  rug(color) {
    const m = new StandardMaterial("rug", this.scene);
    m.diffuseTexture = rugTexture("rug_" + color, color, this.scene);
    m.specularColor = new Color3(0.02, 0.02, 0.02);
    return m;
  }
}
