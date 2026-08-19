import { visit } from "unist-util-visit"
import { Element, Root as HtmlRoot } from "hast"
import { ProcessedContent } from "../plugins/vfile"
import { simplifySlug, stripSlashes, FullSlug } from "../util/path"

// crawl-links resolves wikilinks against every file on disk, not just the
// ones that survive the `publish` filter, so a link to an unpublished note
// still turns into a working-looking <a> that 404s once that note is
// filtered out of the emitted set. Filtering runs before this point, so
// `content`'s slugs (plus virtual pages like /tags and /notes, passed in via
// extraSlugs — see getVirtualPageSlugs) are exactly the set of pages that
// will actually exist — unwrap any internal link that doesn't point into it.
// Must run before PageTypeDispatcher, which renders AND writes every page in
// one pass — there's no later hook where mutating the tree would still
// affect the emitted HTML.
//
// Slugs are compared after normalizeSlug (simplifySlug + a trailing-slash
// trim) because a virtual page like the tags index is generated with slug
// "tags/index", but a link resolves to whichever form the author linked to
// (e.g. "tags") — same page, two spellings. simplifySlug alone isn't enough:
// it drops the "/index" suffix but leaves a trailing slash behind
// ("tags/index" -> "tags/", not "tags"), so it still wouldn't match.
function normalizeSlug(raw: string): string {
  const simplified = simplifySlug(raw as FullSlug)
  return simplified === "/" ? simplified : stripSlashes(simplified, false)
}

function unwrapUnpublishedLinks(tree: HtmlRoot, publishedSlugs: Set<string>) {
  visit(tree, "element", (node: Element, index, parent) => {
    if (parent === undefined || index === undefined) return
    if (node.tagName !== "a") return

    const classes = node.properties?.className
    const isInternal = Array.isArray(classes) && classes.includes("internal")
    const dataSlug = node.properties?.["data-slug"]
    if (!isInternal || typeof dataSlug !== "string") return

    if (!publishedSlugs.has(normalizeSlug(dataSlug))) {
      const replacement: Element = {
        type: "element",
        tagName: "span",
        properties: { className: ["unpublished-link"] },
        children: node.children,
      }
      parent.children[index] = replacement
    }
  })
}

export function pruneUnpublishedLinks(
  content: ProcessedContent[],
  extraSlugs: Iterable<string> = [],
) {
  const publishedSlugs = new Set<string>()
  for (const slug of extraSlugs) {
    publishedSlugs.add(normalizeSlug(slug))
  }
  for (const [, file] of content) {
    if (file.data.slug) publishedSlugs.add(normalizeSlug(file.data.slug))
  }

  for (const [tree] of content) {
    unwrapUnpublishedLinks(tree, publishedSlugs)
  }
}
