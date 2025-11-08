// ============================================================
// core/storage.js - localStorage wrapper for high scores
// ============================================================

export const Storage = {
  get(key, def = null) {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : def;
  },
  set(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }
};
