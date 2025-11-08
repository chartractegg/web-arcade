// ============================================================
// ui/overlay.js - reusable overlay (pause, game over, etc.)
// ============================================================

export const Overlay = {
  show(message) {
    let div = document.getElementById('overlay');
    if (!div) {
      div = document.createElement('div');
      div.id = 'overlay';
      document.body.appendChild(div);
    }
    div.innerHTML = `<div class="overlay-inner"><h2>${message}</h2></div>`;
    div.style.display = 'flex';
  },
  hide() {
    const div = document.getElementById('overlay');
    if (div) div.style.display = 'none';
  }
};
