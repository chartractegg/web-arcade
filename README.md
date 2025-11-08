# Web Arcade Engine

A lightweight JavaScript engine for small web games like Snake, Tetris, 2048, Pong, and more.

## Features
- Shared main loop and timing
- Unified keyboard and touch input
- Basic collision and math helpers
- LocalStorage-based highscores
- Modular UI (menu + overlay)

## Usage
```bash
npm install
npm run dev
```

Each game imports from this repo:
```js
import { Engine, Input, Storage, Utils } from 'web-arcade-engine';
```

## License
vibe coded with support from ChatGPT
