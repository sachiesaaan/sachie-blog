import { h } from "preact"
import type {
  QuartzPageTypePlugin,
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { resolveRelative } from "@quartz-community/utils/path"

// publish: true のノートを、タグ等を介さず作成日順に一覧表示するだけのページ。
// content配列は既にexplicit-publishフィルタを通過済みなので、追加の絞り込みは不要。

function getCreatedDate(data: QuartzPluginData): Date | undefined {
  return data.dates?.created
}

function byCreatedDateDesc(f1: QuartzPluginData, f2: QuartzPluginData): number {
  const d1 = getCreatedDate(f1)
  const d2 = getCreatedDate(f2)
  if (d1 && d2) return d2.getTime() - d1.getTime()
  if (d1) return -1
  if (d2) return 1
  const t1 = (f1.frontmatter?.title ?? "").toString().toLowerCase()
  const t2 = (f2.frontmatter?.title ?? "").toString().toLowerCase()
  return t1.localeCompare(t2)
}

const AllNotesList: QuartzComponentConstructor = () => {
  const Component: QuartzComponent = (props?: QuartzComponentProps) => {
    // allFilesにはFolderPage/TagPage等が生成した仮想ページも混ざっているため、
    // frontmatterがある実ノートかつ publish: true のものだけに絞る
    const files = (props?.allFiles ?? [])
      .filter((f) => f.frontmatter?.publish === true)
      .sort(byCreatedDateDesc)
    const fileSlug = props?.fileData?.slug ?? ""
    const locale = props?.cfg?.locale ?? "en-US"

    return h("div", { class: "popover-hint" }, [
      h("article", { class: "popover-hint" }, [
        h("div", { class: "markdown-preview-view markdown-rendered" }),
      ]),
      h("div", { class: "page-listing" }, [
        h(
          "ul",
          { class: "section-ul" },
          files.map((page) => {
            const created = getCreatedDate(page)
            return h("li", { class: "section-li" }, [
              h("div", { class: "section" }, [
                h(
                  "p",
                  { class: "meta" },
                  created
                    ? h(
                        "time",
                        { dateTime: created.toISOString() },
                        created.toLocaleDateString(locale, {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                        }),
                      )
                    : null,
                ),
                h("div", { class: "desc" }, [
                  h("h3", null, [
                    h(
                      "a",
                      { href: resolveRelative(fileSlug, page.slug!), class: "internal" },
                      page.frontmatter?.title,
                    ),
                  ]),
                ]),
              ]),
            ])
          }),
        ),
      ]),
    ])
  }

  Component.css = `
ul.section-ul {
  list-style: none;
  margin-top: 2em;
  padding-left: 0;
}

li.section-li {
  margin-bottom: 1em;
}
li.section-li > .section {
  display: grid;
  grid-template-columns: fit-content(8em) 1fr;
}
li.section-li > .section > .desc > h3 > a {
  background-color: transparent;
}
li.section-li > .section .meta {
  margin: 0 1em 0 0;
  opacity: 0.6;
}
`

  return Component
}

export const AllNotesPage: QuartzPageTypePlugin = () => ({
  name: "AllNotesPage",
  match: ({ slug }) => slug === "notes",
  generate() {
    return [{ slug: "notes", title: "notes", data: {} }]
  },
  layout: "folder",
  body: AllNotesList,
})
