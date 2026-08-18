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
| Site title | Renamed "sachie" → "sachie.blog"; restyled to plain body-text size (`1rem`, was `1.75rem`) in the orange accent color (`--tertiary`) instead of an oversized bold green heading. Underline removed — it reads as a nav label, not body hypertext, so it's exempted from `custom.scss`'s site-wide "links are always underlined" rule (an existing, pre-this-session rule kept deliberately for everything else — see its comment) | [quartz.config.yaml](quartz.config.yaml), [quartz/styles/base.scss](quartz/styles/base.scss), [quartz/styles/custom.scss](quartz/styles/custom.scss) |
| Header layout | Search / dark-mode toggle moved from the left sidebar (stacked under the title) to the top of the right sidebar, so they sit at the same height as the title on the opposite corner. `toolbar` group priority lowered so it renders above the table of contents on article pages. Group `gap` set to `0.4rem` — a small breathing gap between the toolbar icons | [quartz.config.yaml](quartz.config.yaml) |
| Folder/tag pages, right column | Table of contents explicitly excluded (via full plugin source name — `exclude` only matches on the exact string for `@quartz-community/*` packages, see note below) instead of blanking the whole right position, so the moved toolbar still shows there | [quartz.config.yaml](quartz.config.yaml) |
| Page header width | `.page-header` (title + tags) capped at the same `740px` as the article body and centered, so the title no longer overflows past the text column | [quartz/styles/base.scss](quartz/styles/base.scss) |
| Properties box | `note-properties`' boxed/collapsible "Properties" panel chrome (border, "Properties" summary label, table borders) stripped via CSS, leaving just the tag pills. `includedProperties` narrowed to `[tags]` only (dropped `description`, `aliases`) since only tags need to show. **The plugin itself must stay `enabled: true`** — see known issue below | [quartz.config.yaml](quartz.config.yaml), [quartz/styles/base.scss](quartz/styles/base.scss) |
| Footer | `@quartz-community/footer` disabled entirely — it only ever rendered a hardcoded "Created with Quartz vX.X.X © year" line (the `links` option was already empty, and that text isn't configurable) | [quartz.config.yaml](quartz.config.yaml) |
| Search toolbar button | Icon only — border/box chrome and the "Search" label stripped via CSS, since the button only opens the search modal and nothing is ever typed into the button itself | [quartz/styles/base.scss](quartz/styles/base.scss) |
| Reader mode | `@quartz-community/reader-mode` disabled entirely — not wanted, removed rather than hidden with CSS | [quartz.config.yaml](quartz.config.yaml) |
| Bottom `<hr>` | The `<hr />` between article content and the page footer removed from both `DefaultFrame` and `FullWidthFrame` | [quartz/components/frames/DefaultFrame.tsx](quartz/components/frames/DefaultFrame.tsx), [quartz/components/frames/FullWidthFrame.tsx](quartz/components/frames/FullWidthFrame.tsx) |
| `/tags`, `/notes`, folder listing pages | Body width matched to article width (`740px`) — these pages render their listing content in a sibling `.popover-hint` div rather than inside `<article>`, so the existing article width rule needed a second selector | [quartz/styles/base.scss](quartz/styles/base.scss) |
| `/notes` page | Redundant "notes" `<h1>` inside the page body removed (the real title already comes from the page header) | [plugins/all-notes-page/index.ts](plugins/all-notes-page/index.ts) |
| Article created/modified dates | Shown at the right end of the tags row (`Jan 01, 2025` format), laid out via flex alongside `note-properties`. Labels are icons, not text — hourglass (modified) / pencil (created), Lucide-style outline SVGs at 14px matching the toolbar icons' stroke style — with `aria-label`/`title` carrying the Japanese label for accessibility/tooltip since the text is gone | [plugins/page-dates](plugins/page-dates/index.ts), [quartz/styles/base.scss](quartz/styles/base.scss) |
| Search modal width | Preview/results pane capped at the article's `740px` width instead of the package's default `65%`/`90%` viewport-relative width | [quartz/styles/base.scss](quartz/styles/base.scss) |
| Table of contents position | Toc's top offset lines up with the first line of the article body (not the top of the sidebar). The center column and right sidebar are independent flex/grid tracks with no CSS-only way to line them up (the offset varies per page with title/tags/dates height), so a runtime script measures both and sets the toc's `margin-top` to match | [plugins/toc-align](plugins/toc-align/index.ts) |
| Article title top alignment | `.page-header`'s `margin-top` matches the sidebars' own top padding (`$topSpacing`) exactly, and the title `<h1>`'s generic `margin-top: 2.25rem` (from the shared heading typography rule) is zeroed out for `.article-title` specifically — so the title text's top lines up with `sachie.blog` and the search/dark-mode icons across the header, instead of sitting lower | [quartz/styles/base.scss](quartz/styles/base.scss) |
| Page title size/weight | Every page's title (`.article-title` — articles, tag/folder/notes listing pages — and the 404 page's `<h1>`, both places a page title is rendered) is sized/weighted like plain body text (`1rem`, `font-weight: 400`) instead of the bigger bold heading style. Scoped to just these two selectors, not the bare `h1` rule, so markdown content headings written inside a note's own body (`# Heading`) keep their normal heading size | [quartz/styles/base.scss](quartz/styles/base.scss) |
| In-body heading sizes | Markdown content headings (`h1`–`h3`; `h4`–`h6` were already at the `1rem` floor) scaled down: `h1` 1.75rem→1.5rem, `h2` 1.4rem→1.25rem, `h3` 1.12rem→1.1rem. The bonus size for a heading that's the first direct child of `<article>` (`.page article > h1`, previously `2rem`) was also brought down to match the new plain `h1` size (`1.5rem`) instead of staying a size ahead of it | [quartz/styles/base.scss](quartz/styles/base.scss) |
| Search preview pane parity | The search modal's hover/focus preview (`.preview-inner`) reuses a fetched page's raw markup outside of the normal `.page-header` context, so page-scoped fixes (properties box chrome, tags row date fix) needed a parallel `.preview-inner`-scoped selector. Tag-page previews specifically also need the per-entry tag pill list hidden, but there's no `data-slug` inside the preview to key off of — [plugins/search-preview-fixes](plugins/search-preview-fixes/index.ts) derives it from the focused `.result-card`'s `id` (the page slug) via a `MutationObserver`. See also the reusable rule captured in this session's memory | [quartz/styles/base.scss](quartz/styles/base.scss), [plugins/search-preview-fixes](plugins/search-preview-fixes/index.ts) |
| Link-hover popover parity | The inline link-hover popover (`.popover-inner`) also reuses a fetched page's raw `.popover-hint` markup outside of `.page-header`, same as the search preview — extended the same properties-box-chrome-stripping and tags/dates row-layout selectors to also match `.popover-inner`, so hovering a link shows the same styling as visiting the page | [quartz/styles/base.scss](quartz/styles/base.scss) |
| 404 page | Switched from the browser-default 404 look to match a normal article: title font-size/top-offset made to equal a real page's `.article-title` (`1.75rem`, top = `$topSpacing`). Needed a dedicated override because the 404 body's `<h1>` is a direct child of `<article>`, which otherwise gets the bigger in-body-heading rule (`.page article > h1 { font-size: 2rem }`) meant for markdown content headings, not page titles. Text width already matched (`.center > article` is already capped at `740px`) since the `minimal` frame has no sidebars to offset it | [quartz/styles/base.scss](quartz/styles/base.scss) |
| `/tags` index page | "Found N total tags." and each tag's "N items with this tag." / "Showing first N tags." lines all removed via CSS — just the `#tagname` headings and their listings remain. (An earlier iteration moved the count next to the heading as "#best (5)" instead of removing it, via a small local plugin, but that was dropped once the count itself turned out to be unwanted — CSS-only again, no plugin needed.) **Note:** the index page's actual `data-slug` is `"tags/index"`, not `"tags"` — caught while debugging why the first version of this rule did nothing | [quartz/styles/base.scss](quartz/styles/base.scss) |

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

- `byPageType.<type>.exclude` in `quartz.config.yaml` only matches a plugin by its *exact* `source` string. For local/`github:`/git-url plugins the loader shortens this to a bare name, but for plain npm-scoped sources like `@quartz-community/table-of-contents` it does not — so a bare `exclude: [table-of-contents]` would silently never match. The `folder`/`tag` excludes use the full string `"@quartz-community/table-of-contents"` for this reason (confirmed working).
- **`@quartz-community/note-properties` must stay `enabled: true`, even though it looks like a purely visual "Properties" panel.** Setting it to `enabled: false` was tried while removing the properties box and it silently broke `explicit-publish` for the entire site — every one of the 568 content files got filtered out (down from the normal 93 published) and folder/tag pages came back 404. Root cause not fully traced (likely note-properties does some frontmatter normalization at `order: 5` that `explicit-publish` or another later-order plugin depends on to see the `publish: true` field), but re-enabling it immediately restored the normal publish count. If the properties panel ever needs to go away again, strip it with CSS (see "Properties box" above) — do not disable the plugin.

## Open ideas (not yet implemented)

- Further tightening of overall page/grid width if the right-column whitespace is still too generous after the sidebar-width change.

## How to use this doc

When making further visual changes, check this table first so changes stay consistent with prior decisions instead of re-litigating them. Update the table when a new decision is made.
