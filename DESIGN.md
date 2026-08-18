# Design Policy

Reference: [sachie-me.pages.dev](https://sachie-me.pages.dev/) (previous version of this blog) — the target aesthetic to move back toward.

## Philosophy

- **Content and hypertext first.** Text linking to text is the core of the site. Anything that competes with that for attention is suspect.
- **Simple, not bare.** Strip decoration that doesn't serve legibility or navigation — but a small amount of modern polish (subtle rounded corners, soft shadows) stays. This is not a brutalist/retro exercise.
- **Cut before adding.** When in doubt, remove a rule rather than add one.
- Header/toolbar (search, dark mode, reader mode icons) is currently out of scope for simplification — left as-is for now.

## Decisions made so far

| Area | Decision | File |
|---|---|---|
| Base font size | `html { font-size: 14px }` (was 16px, matches reference) | [quartz/styles/base.scss](quartz/styles/base.scss) |
| Tag pages (`/tags`, `/tags/*`) | Hide the per-entry tag badge list — redundant once you're already looking at that tag's page | [quartz/styles/base.scss](quartz/styles/base.scss) |
| Callouts | Monochrome (single `--color`/`--border`/`--bg` for all types) instead of a different color per callout type; icons still differ per type | [quartz/styles/callouts.scss](quartz/styles/callouts.scss) |
| Popover preview shadow | Softened from `6px 6px 36px rgba(0,0,0,.25)` to `0 4px 16px rgba(0,0,0,.1)` | [quartz/components/styles/popover.scss](quartz/components/styles/popover.scss) |
| Sidebar width | `$sidePanelWidth` 320px → 260px, to reduce empty right-column space on pages without TOC/backlinks | [quartz/styles/variables.scss](quartz/styles/variables.scss) |
| Border-radius (rounded corners) | **Kept intentionally** — explicitly asked to keep, as a bit of modern touch | throughout |

## Color palette

Defined in [quartz.config.yaml](quartz.config.yaml) under `theme.colors`. Each color swaps role between light/dark mode rather than having separate light/dark values — the palette is the same four colors, roles rotate.

| Color | Role |
|---|---|
| `#EB5F2D` (orange) | `tertiary` — hover/selection accent (text-selection background, hover states). Also used at low opacity as `highlight`. |
| `#4C9E5E` (green) | `secondary` — link and interactive-accent color (links, checkboxes, active states, blockquote/callout left-border). Same value in both light and dark mode. |
| `#2B2621` (dark warm brown/black) | `darkgray`/`dark` in light mode — body text color. Becomes the `light` background color in dark mode. |
| `#C8C8D2` (cool light gray) | `gray` in light mode — muted/secondary text (e.g. struck-through checkboxes, subtle borders). Becomes `darkgray`/`dark` (body text) in dark mode. |

`#2B2621` and `#C8C8D2` are the light/dark inverse pair: text color in one mode is the background in the other, and vice versa.

## Open ideas (not yet implemented)

- Search box border/styling in the left sidebar — deferred, header is off-limits for now.
- Further tightening of overall page/grid width if the right-column whitespace is still too generous after the sidebar-width change.

## How to use this doc

When making further visual changes, check this table first so changes stay consistent with prior decisions instead of re-litigating them. Update the table when a new decision is made.
