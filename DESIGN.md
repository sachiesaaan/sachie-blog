# Design Policy

References:
- [sachie-me.pages.dev](https://sachie-me.pages.dev/) (previous version of this blog) — the target overall aesthetic to move back toward.
- [yuriumemoto.com](https://www.yuriumemoto.com/20260814/) — the target article text width and top-left plain-text branding treatment.

## Philosophy

- **Content and hypertext first.** Text linking to text is the core of the site. Anything that competes with that for attention is suspect.
- **Simple, not bare.** Strip decoration that doesn't serve legibility or navigation — but a small amount of modern polish (subtle rounded corners, soft shadows) stays. This is not a brutalist/retro exercise.
- **Cut before adding.** When in doubt, remove a rule rather than add one.

## Decisions made so far

| Area | Decision | File |
|---|---|---|
| Base font size | `html { font-size: 14px }` (was 16px, matches reference) | [quartz/styles/base.scss](quartz/styles/base.scss) |
| Tag pages (`/tags`, `/tags/*`) | Hide the per-entry tag badge list — redundant once you're already looking at that tag's page | [quartz/styles/base.scss](quartz/styles/base.scss) |
| Callouts | Monochrome (single `--color`/`--border`/`--bg` for all types) instead of a different color per callout type; icons still differ per type | [quartz/styles/callouts.scss](quartz/styles/callouts.scss) |
| Popover preview shadow | Softened from `6px 6px 36px rgba(0,0,0,.25)` to `0 4px 16px rgba(0,0,0,.1)` | [quartz/components/styles/popover.scss](quartz/components/styles/popover.scss) |
| Sidebar width | `$sidePanelWidth` 320px → 260px, to reduce empty right-column space on pages without TOC/backlinks | [quartz/styles/variables.scss](quartz/styles/variables.scss) |
| Border-radius (rounded corners) | **Kept intentionally** — explicitly asked to keep, as a bit of modern touch | throughout |
| Article text width | Capped at `740px`, centered, matching the yuriumemoto.com reference | [quartz/styles/base.scss](quartz/styles/base.scss) |
| Site title | Renamed "sachie" → "sachie.blog"; restyled to plain body-text size (`1rem`, was `1.75rem`) in the orange accent color (`--tertiary`) instead of an oversized bold green heading | [quartz.config.yaml](quartz.config.yaml), [quartz/styles/base.scss](quartz/styles/base.scss) |
| Header layout | Search / dark-mode / reader-mode toggle moved from the left sidebar (stacked under the title) to the top of the right sidebar, so they sit at the same height as the title on the opposite corner. `toolbar` group priority lowered so it renders above the table of contents on article pages | [quartz.config.yaml](quartz.config.yaml) |
| Folder/tag pages, right column | Table of contents explicitly excluded (via full plugin source name — `exclude` only matches on the exact string for `@quartz-community/*` packages, see note below) instead of blanking the whole right position, so the moved toolbar still shows there | [quartz.config.yaml](quartz.config.yaml) |
| Page header width | `.page-header` (title + tags) capped at the same `740px` as the article body and centered, so the title no longer overflows past the text column | [quartz/styles/base.scss](quartz/styles/base.scss) |
| Properties box | `note-properties`' boxed/collapsible "Properties" panel chrome (border, "Properties" summary label, table borders) stripped via CSS, leaving just the tag pills. `includedProperties` narrowed to `[tags]` only (dropped `description`, `aliases`) since only tags need to show. **The plugin itself must stay `enabled: true`** — see known issue below | [quartz.config.yaml](quartz.config.yaml), [quartz/styles/base.scss](quartz/styles/base.scss) |
| Footer | `@quartz-community/footer` disabled entirely — it only ever rendered a hardcoded "Created with Quartz vX.X.X © year" line (the `links` option was already empty, and that text isn't configurable) | [quartz.config.yaml](quartz.config.yaml) |

## Color palette

Defined in [quartz.config.yaml](quartz.config.yaml) under `theme.colors`. Each color swaps role between light/dark mode rather than having separate light/dark values — the palette is the same four colors, roles rotate.

| Color | Role |
|---|---|
| `#EB5F2D` (orange) | `tertiary` — hover/selection accent (text-selection background, hover states). Also used at low opacity as `highlight`. |
| `#4C9E5E` (green) | `secondary` — link and interactive-accent color (links, checkboxes, active states, blockquote/callout left-border). Same value in both light and dark mode. |
| `#2B2621` (dark warm brown/black) | `darkgray`/`dark` in light mode — body text color. Becomes the `light` background color in dark mode. |
| `#C8C8D2` (cool light gray) | `gray` in light mode — muted/secondary text (e.g. struck-through checkboxes, subtle borders). Becomes `darkgray`/`dark` (body text) in dark mode. |

`#2B2621` and `#C8C8D2` are the light/dark inverse pair: text color in one mode is the background in the other, and vice versa.

## Known issues (not caused by us, discovered while editing layout)

- `byPageType.<type>.exclude` in `quartz.config.yaml` only matches a plugin by its *exact* `source` string. For local/`github:`/git-url plugins the loader shortens this to a bare name, but for plain npm-scoped sources like `@quartz-community/reader-mode` it does not — so `exclude: [reader-mode]` silently never matches and never excludes anything. This is why `folder`/`tag` still show the reader-mode toggle today despite that line existing. If it should actually be hidden there, the `exclude` entry needs to be the full string `"@quartz-community/reader-mode"` (confirmed working for `table-of-contents` above).
- **`@quartz-community/note-properties` must stay `enabled: true`, even though it looks like a purely visual "Properties" panel.** Setting it to `enabled: false` was tried while removing the properties box and it silently broke `explicit-publish` for the entire site — every one of the 568 content files got filtered out (down from the normal 93 published) and folder/tag pages came back 404. Root cause not fully traced (likely note-properties does some frontmatter normalization at `order: 5` that `explicit-publish` or another later-order plugin depends on to see the `publish: true` field), but re-enabling it immediately restored the normal publish count. If the properties panel ever needs to go away again, strip it with CSS (see "Properties box" above) — do not disable the plugin.

## Open ideas (not yet implemented)

- Further tightening of overall page/grid width if the right-column whitespace is still too generous after the sidebar-width change.
- Reader-mode toggle currently still shows on folder/tag pages (see known issue above) — decide if that's actually wanted before "fixing" it.

## How to use this doc

When making further visual changes, check this table first so changes stay consistent with prior decisions instead of re-litigating them. Update the table when a new decision is made.
