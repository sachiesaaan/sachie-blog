import { h } from "preact"
import type { QuartzComponent, QuartzComponentConstructor } from "@quartz-community/types"

// The search modal's hover/focus preview pane (`.preview-container`) reuses
// a fetched page's raw markup, so it shows the old, un-styled tag badge list
// that quartz/styles/base.scss otherwise hides on the real tag pages (see the
// `body[data-slug^="tags/"]` rule there). There's no `data-slug` to key off
// of inside the preview, so instead read the slug off whichever result card
// is currently focused (its `id` attribute is the page slug) and flag the
// preview with a class when that slug is a tag page.
const script = `
function quartzUpdateSearchPreviewTagFlag() {
  const container = document.querySelector(".preview-container")
  if (!container) return
  const active = document.querySelector(".result-card.focus")
  const slug = active ? active.id : ""
  const isTagPage = slug === "tags" || slug.indexOf("tags/") === 0
  container.classList.toggle("is-tag-page-preview", isTagPage)
}

document.addEventListener("nav", () => {
  const layout = document.querySelector(".search-layout")
  if (!layout) return
  const observer = new MutationObserver(quartzUpdateSearchPreviewTagFlag)
  observer.observe(layout, { childList: true, subtree: true })
  window.addCleanup && window.addCleanup(() => observer.disconnect())
})
`

export const SearchPreviewFixes: QuartzComponentConstructor = () => {
  const Component: QuartzComponent = () => h("span", { style: "display:none" })
  Component.displayName = "SearchPreviewFixes"
  Component.afterDOMLoaded = script
  return Component
}
