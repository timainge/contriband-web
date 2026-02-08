# contriband web editor

[![CI](https://github.com/timainge/contriband-web/actions/workflows/ci.yml/badge.svg)](https://github.com/timainge/contriband-web/actions/workflows/ci.yml)

Visual canvas for designing GitHub contribution graph art. Paint pixel templates that can be exported and applied using the [contriband CLI](https://github.com/timainge/contriband-cli).

**Repos**: [contriband-web](https://github.com/timainge/contriband-web) | [contriband-cli](https://github.com/timainge/contriband-cli)

## Features

- Calendar-aware grid mapped to real GitHub contribution dates
- Draw mode: paint intensity levels 0-4 directly on the grid
- Text mode: type text using built-in 5x7 pixel font with live preview
- Sprite mode: stamp patterns onto the grid
- Export to TOML or self-contained bash script
- Keyboard shortcuts: 0-4 intensity, D/T/S modes, Ctrl+Z undo

## Development

```bash
npm install
npm run dev       # Dev server at localhost:5173
npm run build     # Production build (vue-tsc + vite)
```

## Tech Stack

- Vue 3 + TypeScript + Composition API
- Vite
- Tailwind CSS v4

## Project Structure

```
src/
├── App.vue                    # Main app layout
├── components/                # Vue SFCs
├── composables/
│   └── useTemplate.ts         # Reactive singleton - ALL grid state lives here
├── lib/
│   ├── font.ts                # 5x7 pixel font (ported from Python)
│   ├── grid.ts                # Calendar date calculations, margins
│   └── template.ts            # Template model, TXT/TOML serialize/parse
└── style.css                  # Tailwind v4 + CSS custom properties
```
