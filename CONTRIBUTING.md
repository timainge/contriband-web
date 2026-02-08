# Contributing to ContriBand

Thanks for your interest. Here's how to get involved.

Before starting work on a PR, please [open an issue](https://github.com/timainge/contriband-web/issues) to discuss what you have in mind. This helps avoid duplicated effort and makes sure the change fits the project direction.

## Sprites

The easiest way to contribute is by adding new sprites. Sprites live in `src/lib/sprites.ts` as 7-row grid arrays with intensity levels 0-4.

When adding a sprite:
- Keep it within a 7-row height (matching the contribution graph)
- Use all intensity levels where it makes sense
- Name it clearly

## Features

If you're interested in getting more involved lets discuss a backend hosted library for sprites and artworks or any other features that might be of interest.

## Development

```bash
npm install
npm run dev       # Dev server at localhost:5173
npm run build     # Type-check + production build
```

## Pull requests

- Keep changes focused — one feature or fix per PR
- Make sure `npm run build` passes
- Describe what you changed and why
