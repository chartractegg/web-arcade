// ============================================================
// core/input.js - Unified keyboard + touch input handling
// ============================================================

export const Input = {
  keys: {},
  touch: { x: 0, y: 0, active: false },
  onTap: null,

  init(canvas, tapHandler) {
    this.onTap = tapHandler || function () {};
    window.addEventListener('keydown', e => (this.keys[e.key] = true));
    window.addEventListener('keyup', e => (this.keys[e.key] = false));

    canvas.addEventListener('touchstart', e => {
      const touch = e.touches[0];
      this.touch.x = touch.clientX;
      this.touch.y = touch.clientY;
      this.touch.active = true;
      this.handleTap(canvas, touch.clientX, touch.clientY);
    });

    canvas.addEventListener('touchend', () => {
      this.touch.active = false;
    });
  },

  handleTap(canvas, x, y) {
    const w = canvas.width;
    const h = canvas.height;
    const left = x < w / 2;
    const top = y < h / 2;
    const quadrant = top ? (left ? 'up-left' : 'up-right') : (left ? 'down-left' : 'down-right');
    this.onTap(quadrant);
  },

  isDown(key) {
    return !!this.keys[key];
  }
};
