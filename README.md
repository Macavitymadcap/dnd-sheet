# D&D Character Sheet

A multi-page Alpine.js character sheet for 5e, written in TypeScript and served with Bun. Light (parchment & ink) and dark (candlelit) themes, native web components for the shared chrome, and CSS cross-document view transitions between pages.

## Running it

```sh
bun install
bun run dev        # http://localhost:5173
```

Other scripts:

```sh
bun run build      # static bundle in dist/ — deployable to any static host
bun run typecheck  # tsc --noEmit
bun test scripts/  # logic smoke tests + headless page-render tests
```

`bun run dev` uses Bun's HTML imports: each page's `<script type="module" src="../src/main.ts">` and `<link>` to `styles.css` are bundled on the fly, so there is no separate build step during development.

## Structure

```
pages/            one HTML page per sheet section
  index.html      Character, Classes & Hit Dice, Abilities
  combat.html     AC, HP, speeds, death saves, conditions, attacks
  traits.html     Proficiencies, languages, features & traits
  equipment.html  Coins, attunement, equipment
  background.html Personality, appearance, allies, backstory
  spells.html     Spellcasting, Pact Magic, spell levels, innate spells
src/
  main.ts         entry: theme bootstrap, component registration, Alpine start
  sheet.ts        the Alpine component (state, derived values, actions)
  model.ts        character shape, factories, localStorage persistence, migrations
  rules.ts        5e data tables (skills, XP, classes, multiclass slots, Pact)
  lib/formula.ts  metric-tracker formula evaluator (PB/LEVEL/ability vars)
  lib/markdown.ts tiny Markdown renderer for note fields
  components/     native web components (light DOM): <sheet-nav>,
                  <sheet-toolbar>, <theme-toggle>
server.ts         Bun.serve dev server routing the six pages
styles.css        design tokens, both themes, layout, print styles
scripts/          smoke tests + the one-off page-split migration script
```

## How the pieces fit

**Alpine owns the sheet, web components own the chrome.** Every page mounts the same `sheet()` Alpine component; each renders one panel of it. The nav, toolbar, and theme toggle are custom elements rendering into light DOM so the stylesheet and theme variables reach them and Alpine never crosses a shadow boundary. The toolbar dispatches window events (`sheet-short-rest`, `sheet-long-rest`, `sheet-export`, `sheet-import`) that the Alpine component listens for, and `save()` dispatches `sheet-saved` so the nav's name/level stay current.

**State.** The whole character is one object `c` (see `defaults()` in `src/model.ts`), auto-saved to localStorage under `dnd-character-sheet-v2` — the same key as the previous single-file version, so existing characters carry over, and `load()` still migrates older shapes. Export/Import JSON round-trips the same object from any page.

**Page transitions.** `@view-transition { navigation: auto; }` in `styles.css` opts every page into cross-document view transitions: content fades and rises, the nav is pinned via `view-transition-name`. Supported in Chromium and Safari 18.2+; other browsers just navigate normally. `prefers-reduced-motion` disables the animation. No htmx or client router needed — state is client-side, so there is nothing server-rendered to swap.

**Theming.** All colour comes from custom properties on `:root[data-theme]`. A tiny inline script in each page's `<head>` applies the stored theme (or the OS preference) before first paint. Type is Cinzel for display and Alegreya for body, loaded from Google Fonts.

## Notes

- Printing exports the current page only; use each page's Print for a full sheet.
- Text areas support basic Markdown (bold, italics, code, links, lists).
- Game rules © Wizards of the Coast; this is an original sheet layout.
