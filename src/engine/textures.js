import { DynamicTexture, Texture } from "@babylonjs/core";

// Harici görsel dosyası kullanmadan, canvas 2D context'i ile prosedürel dokular
// üretiyoruz. Babylon'da DynamicTexture tam da bunun için: getContext() ile
// standart bir 2D canvas çizip update() çağırıyoruz.

function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  r = Math.min(255, r * f);
  g = Math.min(255, g * f);
  b = Math.min(255, b * f);
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

// Deterministik (seed'siz ama sabit) gürültü — her render aynı sonucu versin.
function noise(ctx, w, h, amt) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    const v = (n - 0.5) * amt;
    d[i] += v;
    d[i + 1] += v;
    d[i + 2] += v;
  }
  ctx.putImageData(img, 0, 0);
}

function makeTex(name, size, draw, repeat, scene) {
  const tex = new DynamicTexture(name, { width: size, height: size }, scene, true);
  const ctx = tex.getContext();
  draw(ctx, size);
  tex.update();
  tex.wrapU = Texture.WRAP_ADDRESSMODE;
  tex.wrapV = Texture.WRAP_ADDRESSMODE;
  tex.uScale = repeat;
  tex.vScale = repeat;
  tex.anisotropicFilteringLevel = 4;
  return tex;
}

export function woodTexture(name, base, plankShade, repeat, scene) {
  return makeTex(
    name,
    512,
    (ctx) => {
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, 512, 512);
      const pw = 73;
      for (let x = 0; x < 512; x += pw) {
        const sh = 1 + Math.sin(x) * 0.5 * plankShade;
        ctx.fillStyle = shade(base, sh);
        ctx.fillRect(x, 0, pw - 2, 512);
        ctx.strokeStyle = "rgba(0,0,0,0.05)";
        for (let g = 0; g < 7; g++) {
          ctx.beginPath();
          const gx = x + 6 + g * 9;
          ctx.moveTo(gx, 0);
          ctx.bezierCurveTo(gx + 4, 170, gx - 4, 340, gx + 2, 512);
          ctx.stroke();
        }
        ctx.fillStyle = "rgba(0,0,0,0.18)";
        ctx.fillRect(x, (x * 37) % 512, pw - 2, 2);
      }
      noise(ctx, 512, 512, 14);
    },
    repeat,
    scene
  );
}

export function tileTexture(name, base, grout, repeat, scene) {
  return makeTex(
    name,
    512,
    (ctx) => {
      ctx.fillStyle = grout;
      ctx.fillRect(0, 0, 512, 512);
      const t = 122,
        gap = 6;
      for (let y = 0; y < 512; y += t)
        for (let x = 0; x < 512; x += t) {
          ctx.fillStyle = shade(base, 1 + ((x + y) % 3) * 0.012);
          ctx.fillRect(x + gap / 2, y + gap / 2, t - gap, t - gap);
        }
      noise(ctx, 512, 512, 6);
    },
    repeat,
    scene
  );
}

export function marbleTexture(name, scene) {
  return makeTex(
    name,
    512,
    (ctx) => {
      ctx.fillStyle = "#ece9e3";
      ctx.fillRect(0, 0, 512, 512);
      ctx.lineWidth = 2;
      for (let i = 0; i < 14; i++) {
        ctx.strokeStyle = `rgba(120,116,110,${0.18 + (i % 3) * 0.06})`;
        ctx.beginPath();
        let x = (i * 53) % 512,
          y = 0;
        ctx.moveTo(x, y);
        while (y < 512) {
          x += Math.sin(y * 0.05 + i) * 26;
          y += 24;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      noise(ctx, 512, 512, 8);
    },
    1,
    scene
  );
}

export function rugTexture(name, col, scene) {
  return makeTex(
    name,
    256,
    (ctx) => {
      ctx.fillStyle = col;
      ctx.fillRect(0, 0, 256, 256);
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 10;
      ctx.strokeRect(16, 16, 224, 224);
      ctx.strokeStyle = "rgba(0,0,0,0.18)";
      ctx.lineWidth = 4;
      ctx.strokeRect(34, 34, 188, 188);
      for (let i = 50; i < 206; i += 18) {
        ctx.beginPath();
        ctx.moveTo(50, i);
        ctx.lineTo(206, i);
        ctx.stroke();
      }
      noise(ctx, 256, 256, 10);
    },
    1,
    scene
  );
}

// Duvar fayansı — fotodaki banyo duvarı gibi büyük açık kareler + ince derz.
export function wallTexture(name, base, repeat, scene) {
  return makeTex(
    name,
    512,
    (ctx) => {
      const grout = shade(base, 0.9);
      ctx.fillStyle = grout;
      ctx.fillRect(0, 0, 512, 512);
      const t = 128,
        gap = 3;
      for (let y = 0; y < 512; y += t)
        for (let x = 0; x < 512; x += t) {
          ctx.fillStyle = shade(base, 1 + ((x + y) % 2) * 0.02);
          ctx.fillRect(x + gap / 2, y + gap / 2, t - gap, t - gap);
        }
      noise(ctx, 512, 512, 4);
    },
    repeat,
    scene
  );
}

// Pencere dışı manzara (gökyüzü + çimen) — basit gradient.
export function skyTexture(name, scene) {
  return makeTex(
    name,
    64,
    (ctx) => {
      const grad = ctx.createLinearGradient(0, 0, 0, 64);
      grad.addColorStop(0, "#acd6f5");
      grad.addColorStop(0.6, "#dceefb");
      grad.addColorStop(0.6, "#9fc08a");
      grad.addColorStop(1, "#7fae6a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
    },
    1,
    scene
  );
}
