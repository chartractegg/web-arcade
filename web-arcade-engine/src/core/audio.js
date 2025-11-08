// ============================================================
// core/audio.js - simple audio utility
// ============================================================

export const Audio = {
  play(src) {
    const s = new Audio(src);
    s.volume = 0.5;
    s.play().catch(() => {}); // ignore autoplay blocks
  }
};
