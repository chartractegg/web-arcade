// ============================================================
// web-arcade-engine - core/engine.js
// Handles the main game loop, rendering, and timing.
// ============================================================

export class Engine {
  constructor({ update, render, onInit }) {
    this.update = update || function () {};
    this.render = render || function () {};
    this.onInit = onInit || function () {};
    this.running = false;
    this.lastTime = 0;
    this.delta = 0;
    this.fps = 60;
    this.ctx = null;
  }

  attachCanvas(canvasId = 'game') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) throw new Error(`Canvas with id '${canvasId}' not found.`);
    this.ctx = canvas.getContext('2d');
    this.resizeCanvas(canvas);
    window.addEventListener('resize', () => this.resizeCanvas(canvas));
  }

  resizeCanvas(canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  start() {
    this.running = true;
    this.onInit();
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  loop(timestamp) {
    if (!this.running) return;
    const dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;
    this.update(dt);
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.render(this.ctx);
    requestAnimationFrame(this.loop.bind(this));
  }

  stop() {
    this.running = false;
  }
}
