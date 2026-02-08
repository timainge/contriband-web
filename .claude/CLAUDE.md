# Claude Code Instructions

You are working on **contriband web editor**, a visual canvas for designing GitHub contribution graph art.

## Project Overview

Design pixel art templates for GitHub contribution graphs. The web editor provides a calendar-aware grid canvas with drawing tools. Templates can be exported and applied using the companion [contriband CLI](https://github.com/timainge/contriband-cli).

## Key Principles

1. **Do simplest thing first**: Avoid over-engineering. Build the minimal version, iterate.
2. **Composable singleton**: All grid state lives in `useTemplate()` — one reactive state shared across components.
3. **Calendar-aware grid**: Maps to real GitHub contribution dates with safety margins.

## Architecture

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

**Stack**: Vue 3 + TypeScript + Composition API, Vite, Tailwind CSS v4

**Key patterns**:
- `useTemplate()` is a module-scope singleton (not per-component). All components share one reactive template state.
- Grid is calendar-aware: maps to real GitHub contribution dates with 1-column safety margins on left/right.
- `fitToCalendar()` pads/truncates imported templates to match the calendar width.
- CSS uses custom properties (`--color-*`, `--shadow-*`) defined in `style.css` for theming.
- Tailwind v4 (import-based, no config file): `@import "tailwindcss"` in style.css.

## Editor Features

- Grid is the primary UI (app-like canvas, no wizard steps)
- Toolbar with modes: **Draw** (paint intensity), **Text** (ghost preview + place), **Sprite** (stamp patterns)
- Active pixel cursor for positioning text/sprites
- Export to TOML or self-contained bash script
- Grid scales to fill available viewport width on desktop
- Keyboard shortcuts: 0-4 for intensity, D/T/S for modes, Ctrl+Z undo

## Commands

```bash
npm run dev           # Dev server at localhost:5173
npm run build         # Production build (vue-tsc + vite)
```

## Implementation Notes

- Templates: 7 rows (weekdays) x N columns (weeks), levels 0-4
- Grid: 1-column safety margins on left/right (non-editable, crosshatch visual)
- Template grid width = usableColumns (totalColumns - 2 margins)
- anchorDate = graphStartDate + 7 days (first usable column Sunday)
- TOML export includes `[meta]` section with `anchor_date`, `columns`, `rows`
