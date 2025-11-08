
// games/tetris/tetris.js
import { Engine } from '../../src/core/engine.js';
import { Input } from '../../src/core/input.js';
import { Storage } from '../../src/core/storage.js';
import { Utils } from '../../src/core/utils.js';

const COLS = 10;
const ROWS = 20;
const TILE = 32; // logical tile size; we will scale to canvas

const SHAPES = {
  I: [[1,1,1,1]],
  O: [[1,1],[1,1]],
  T: [[0,1,0],[1,1,1]],
  S: [[0,1,1],[1,1,0]],
  Z: [[1,1,0],[0,1,1]],
  J: [[1,0,0],[1,1,1]],
  L: [[0,0,1],[1,1,1]]
};

const COLORS = {
  I: '#7dd3fc', O: '#fde68a', T: '#c4b5fd', S: '#86efac',
  Z: '#fca5a5', J: '#93c5fd', L: '#fbbf24'
};

// Bag randomizer
function* bag() {
  const types = Object.keys(SHAPES);
  while (true) {
    const b = types.slice();
    for (let i = b.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [b[i], b[j]] = [b[j], b[i]];
    }
    for (const t of b) yield t;
  }
}
const nextType = bag();

function rotate(matrix) {
  const N = matrix.length;
  const res = Array.from({length: N}, () => Array(N).fill(0));
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++)
      res[x][N - 1 - y] = matrix[y][x];
  return res;
}

function padShape(shape) {
  // Make all shapes NxN for simpler rotation and collision
  const N = Math.max(shape.length, shape[0].length);
  const m = Array.from({length: N}, () => Array(N).fill(0));
  for (let y = 0; y < shape.length; y++)
    for (let x = 0; x < shape[0].length; x++)
      m[y][x] = shape[y][x];
  return m;
}

class TetrisGame {
  constructor() {
    this.grid = Array.from({length: ROWS}, () => Array(COLS).fill(null));
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.dropInterval = 0.9; // seconds
    this.dropTimer = 0;
    this.hardDropped = false;
    this.spawn();
  }

  spawn() {
    this.type = nextType.next().value;
    this.matrix = padShape(SHAPES[this.type]);
    this.x = (COLS / 2 | 0) - (this.matrix.length / 2 | 0);
    this.y = -2; // start slightly above
    this.lockDelay = 0;
  }

  collide(nx = this.x, ny = this.y, mat = this.matrix) {
    for (let y = 0; y < mat.length; y++) {
      for (let x = 0; x < mat.length; x++) {
        if (!mat[y][x]) continue;
        const gx = nx + x;
        const gy = ny + y;
        if (gx < 0 || gx >= COLS || gy >= ROWS) return true;
        if (gy >= 0 && this.grid[gy][gx]) return true;
      }
    }
    return false;
  }

  merge() {
    for (let y = 0; y < this.matrix.length; y++) {
      for (let x = 0; x < this.matrix.length; x++) {
        if (!this.matrix[y][x]) continue;
        const gy = this.y + y;
        const gx = this.x + x;
        if (gy >= 0) this.grid[gy][gx] = this.type;
      }
    }
  }

  clearLines() {
    let cleared = 0;
    for (let y = ROWS - 1; y >= 0; ) {
      if (this.grid[y].every(c => c)) {
        this.grid.splice(y, 1);
        this.grid.unshift(Array(COLS).fill(null));
        cleared++;
      } else y--;
    }
    if (cleared) {
      const scores = [0, 100, 300, 500, 800];
      this.score += scores[cleared] * this.level;
      this.lines += cleared;
      this.level = 1 + Math.floor(this.lines / 10);
      this.dropInterval = Math.max(0.12, 0.9 - (this.level - 1) * 0.07);
    }
  }

  softDrop() {
    if (!this.collide(this.x, this.y + 1)) {
      this.y++;
      this.score += 1;
      return true;
    }
    return false;
  }

  hardDrop() {
    let d = 0;
    while (!this.collide(this.x, this.y + 1)) {
      this.y++; d++;
    }
    if (d) this.score += 2 * d;
    this.lockPiece();
  }

  lockPiece() {
    this.merge();
    this.clearLines();
    this.spawn();
    if (this.collide(this.x, this.y)) {
      // game over
      this.over = true;
      const best = Storage.get('tetris_highscore', 0);
      if (this.score > best) Storage.set('tetris_highscore', this.score);
    }
  }

  rotateCW() {
    const r = rotate(this.matrix);
    if (!this.collide(this.x, this.y, r)) {
      this.matrix = r;
      return;
    }
    // simple wall kicks
    if (!this.collide(this.x + 1, this.y, r)) { this.x++; this.matrix = r; return; }
    if (!this.collide(this.x - 1, this.y, r)) { this.x--; this.matrix = r; return; }
  }
}

export function startTetris() {
  const game = new TetrisGame();

  const engine = new Engine({
    update(dt) {
      if (game.over) return;
      // input
      if (Input.isDown('ArrowLeft') && !game._leftHeld) {
        game._leftHeld = true;
        if (!game.collide(game.x - 1, game.y)) game.x--;
      }
      if (!Input.isDown('ArrowLeft')) game._leftHeld = false;

      if (Input.isDown('ArrowRight') && !game._rightHeld) {
        game._rightHeld = true;
        if (!game.collide(game.x + 1, game.y)) game.x++;
      }
      if (!Input.isDown('ArrowRight')) game._rightHeld = false;

      if (Input.isDown('ArrowUp') && !game._rotHeld) {
        game._rotHeld = true;
        game.rotateCW();
      }
      if (!Input.isDown('ArrowUp')) game._rotHeld = false;

      if (Input.isDown(' ') && !game._hardHeld) {
        game._hardHeld = true;
        game.hardDrop();
      }
      if (!Input.isDown(' ')) game._hardHeld = false;

      // soft drop hold
      if (Input.isDown('ArrowDown')) game.softDrop();

      game.dropTimer += dt;
      if (game.dropTimer >= game.dropInterval) {
        game.dropTimer = 0;
        if (!game.softDrop()) {
          // piece rests; lock
          game.lockPiece();
        }
      }
    },
    render(ctx) {
      // scale to fit
      const W = ctx.canvas.width;
      const H = ctx.canvas.height;

      // compute playfield area
      const playW = Math.min(W * 0.6, ROWS * TILE * (COLS/ROWS));
      const scale = Math.floor(playW / (COLS * TILE)) * TILE || TILE;
      const cell = Math.floor(Math.min(W/(COLS+12), H/(ROWS+2)));
      const tile = Math.max(16, Math.min(40, cell));

      const fieldW = COLS * tile;
      const fieldH = ROWS * tile;
      const ox = Math.floor((W - fieldW) / 2);
      const oy = Math.floor((H - fieldH) / 2);

      // background
      ctx.fillStyle = '#0b0f14';
      ctx.fillRect(0,0,W,H);

      // frame
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 2;
      ctx.strokeRect(ox-12, oy-12, fieldW+24, fieldH+24);

      // grid background
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(ox, oy, fieldW, fieldH);

      // draw locked grid
      for (let y=0;y<ROWS;y++) {
        for (let x=0;x<COLS;x++) {
          const t = game.grid[y][x];
          if (!t) continue;
          drawTile(ctx, ox + x*tile, oy + y*tile, tile, COLORS[t]);
        }
      }

      // draw current piece
      if (!game.over) {
        for (let y=0;y<game.matrix.length;y++) {
          for (let x=0;x<game.matrix.length;x++) {
            if (!game.matrix[y][x]) continue;
            const gx = game.x + x;
            const gy = game.y + y;
            if (gy >= 0) drawTile(ctx, ox + gx*tile, oy + gy*tile, tile, COLORS[game.type]);
          }
        }
      }

      // HUD
      ctx.fillStyle = '#e7f1ff';
      ctx.font = '16px ui-sans-serif, system-ui';
      const best = Storage.get('tetris_highscore', 0);
      const hudX = ox + fieldW + 24;
      const hudY = oy;
      ctx.fillText(`Score: ${game.score}`, hudX, hudY + 20);
      ctx.fillText(`Lines: ${game.lines}`, hudX, hudY + 44);
      ctx.fillText(`Level: ${game.level}`, hudX, hudY + 68);
      ctx.fillText(`Best:  ${best}`,  hudX, hudY + 92);

      if (game.over) {
        ctx.fillStyle = 'rgba(3,7,18,0.75)';
        ctx.fillRect(ox, oy, fieldW, fieldH);
        ctx.fillStyle = '#e7f1ff';
        ctx.font = 'bold 22px ui-sans-serif, system-ui';
        ctx.fillText('Game Over', ox + fieldW/2 - 60, oy + fieldH/2 - 10);
        ctx.font = '14px ui-sans-serif, system-ui';
        ctx.fillText('Press R to restart', ox + fieldW/2 - 70, oy + fieldH/2 + 16);
      }
    },
    onInit() {
      const canvas = document.getElementById('game');
      Input.init(canvas, (quad)=>{
        // simple quadrant mapping: up-right rotate, up-left left, down-right right, down-left drop
        if (quad === 'up-right') game.rotateCW();
        if (quad === 'up-left')  { if (!game.collide(game.x-1, game.y)) game.x--; }
        if (quad === 'down-right'){ if (!game.collide(game.x+1, game.y)) game.x++; }
        if (quad === 'down-left'){ game.softDrop(); }
      });
      window.addEventListener('keypress', (e)=>{
        if (e.key.toLowerCase() === 'r') {
          // restart
          Object.assign(game, new TetrisGame());
        }
        if (e.key.toLowerCase() === 'p') {
          engine.running ? engine.stop() : engine.start();
        }
      });
    }
  });

  engine.attachCanvas('game');
  engine.start();
}

function drawTile(ctx, x, y, size, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, size, size);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(x, y, size, 4);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(x, y+size-4, size, 4);
}
