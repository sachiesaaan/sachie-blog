import { h } from "preact"
import type { QuartzComponent, QuartzComponentConstructor } from "@quartz-community/types"

// The right sidebar (toolbar + toc) and the center column are independent
// flex/grid tracks, so there's no CSS-only way to line up the toc with the
// article's first line of body text — it shifts per page depending on how
// tall the title/tags/dates block above it renders. Measure both at runtime
// and push the toc down with an explicit margin-top.
const script = `
function quartzAlignToc() {
  if (window.innerWidth < 1200) return
  var toc = document.querySelector(".sidebar.right > .toc")
  var article = document.querySelector("article .markdown-preview-view")
  if (!toc || !article) return
  toc.style.marginTop = ""
  var firstLine = article.firstElementChild || article
  var targetTop = firstLine.getBoundingClientRect().top
  var tocTop = toc.getBoundingClientRect().top
  var diff = targetTop - tocTop
  toc.style.marginTop = diff > 0 ? diff + "px" : ""
}

document.addEventListener("nav", () => {
  quartzAlignToc()
  requestAnimationFrame(quartzAlignToc)
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(quartzAlignToc)
  }
  const onResize = () => quartzAlignToc()
  window.addEventListener("resize", onResize)
  window.addCleanup && window.addCleanup(() => window.removeEventListener("resize", onResize))
})
`

export const TocAlign: QuartzComponentConstructor = () => {
  const Component: QuartzComponent = () => h("span", { style: "display:none" })
  Component.displayName = "TocAlign"
  Component.afterDOMLoaded = script
  return Component
}
