import { ROOM } from "../data/catalog.js";

// Hazır mutfak düzenleri. Her şablon, motorun `place(type, x, z, rotDeg)` ve
// `setLayout(isL)` fonksiyonlarını kullanarak sahneyi kurar. Koordinatlar oda
// merkezine göre metre cinsinden.

const HALF = ROOM.size / 2;
const FRONT = -HALF + 0.32; // duvar önü merkez ekseni
const WALL = -HALF + 0.2; // üst dolap / davlumbaz ekseni

export function buildPreset(id, { place, setLayout }) {
  if (id === "single") {
    setLayout(false);
    const xs = [-1.6, -1.0, -0.4, 0.2, 0.8, 1.4];
    place("tall", xs[0], FRONT);
    place("base", xs[1], FRONT);
    place("sink", xs[2], FRONT);
    place("stove", xs[3], FRONT);
    place("dishwasher", xs[4], FRONT);
    place("base", xs[5], FRONT);
    [xs[1], xs[2], xs[4], xs[5]].forEach((x) => place("wall", x, WALL));
    place("hood", xs[3], -HALF + 0.24);
    place("table", 0.4, 1.2);
    place("stool", -0.2, 1.2);
    place("stool", 1.0, 1.2);
    return;
  }

  if (id === "L") {
    setLayout(true);
    // Köşe dolabı: iki tezgah kolunu boşluksuz birleştirir.
    place("cornerBase", -HALF + 0.45, -HALF + 0.45);
    // Arka duvar kolu (köşeden sonra başlar, kesintisiz tezgah)
    place("sink", -1.0, FRONT);
    place("stove", -0.4, FRONT);
    place("base", 0.2, FRONT);
    place("dishwasher", 0.8, FRONT);
    [-1.0, 0.2, 0.8].forEach((x) => place("wall", x, WALL));
    place("hood", -0.4, -HALF + 0.24);
    // Sol duvar kolu (köşeden sonra başlar, 90° döndürülmüş)
    place("base", FRONT, -1.0, 90);
    place("base", FRONT, -0.4, 90);
    place("tall", FRONT, 0.2, 90);
    place("fridge", FRONT, 0.8, 90);
    // Yemek alanı
    place("table", 0.8, 1.2);
    place("stool", 0.3, 1.2);
    place("stool", 1.3, 1.2);
    return;
  }

  if (id === "island") {
    setLayout(true);
    const bx = [-1.4, -0.8, -0.2, 0.4, 1.0, 1.6];
    place("tall", bx[0], FRONT);
    place("sink", bx[1], FRONT);
    place("base", bx[2], FRONT);
    place("stove", bx[3], FRONT);
    place("base", bx[4], FRONT);
    place("fridge", bx[5], FRONT);
    [bx[1], bx[2], bx[4]].forEach((x) => place("wall", x, WALL));
    place("hood", bx[3], -HALF + 0.24);
    // ada
    place("counter", -0.3, 0.7);
    place("counter", 0.6, 0.7);
    place("base", -0.3, 1.3, 180);
    place("base", 0.6, 1.3, 180);
    place("stool", -0.5, 1.7);
    place("stool", 0.1, 1.7);
    place("stool", 0.7, 1.7);
    return;
  }
}
