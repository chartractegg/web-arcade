// ============================================================
// core/utils.js - math helpers, RNG, collision
// ============================================================

export const Utils = {
  rand(min, max) {
    return Math.random() * (max - min) + min;
  },
  randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },
  rectsIntersect(a, b) {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }
};
