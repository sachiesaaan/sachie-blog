import { h } from "preact"
import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"

// note-properties (see quartz.config.yaml) renders the tags row on article
// pages; this component sits next to it in beforeBody and is laid out onto
// the same visual row via CSS (see quartz/styles/base.scss).

function formatDate(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, { year: "numeric", month: "short", day: "2-digit" })
}

// Lucide icons (ISC license), matching the outline/stroke style already used
// by the search and dark-mode toggle icons in the toolbar.
const HourglassIcon = h(
  "svg",
  { viewBox: "0 0 24 24" },
  h("path", { d: "M5 22h14" }),
  h("path", { d: "M5 2h14" }),
  h("path", {
    d: "M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22",
  }),
  h("path", {
    d: "M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2",
  }),
)

const PencilIcon = h(
  "svg",
  { viewBox: "0 0 24 24" },
  h("path", {
    d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
  }),
  h("path", { d: "m15 5 4 4" }),
)

export const PageDates: QuartzComponentConstructor = () => {
  const Component: QuartzComponent = (props?: QuartzComponentProps) => {
    const dates = props?.fileData?.dates
    if (!dates?.created && !dates?.modified) return null

    const locale = props?.cfg?.locale ?? "en-US"

    return h("p", { class: "page-dates" }, [
      dates.modified &&
        h("span", { class: "page-date", "aria-label": "更新日", title: "更新日" }, [
          HourglassIcon,
          h(
            "time",
            { dateTime: dates.modified.toISOString() },
            formatDate(dates.modified, locale),
          ),
        ]),
      dates.created &&
        h("span", { class: "page-date", "aria-label": "作成日", title: "作成日" }, [
          PencilIcon,
          h("time", { dateTime: dates.created.toISOString() }, formatDate(dates.created, locale)),
        ]),
    ])
  }

  Component.displayName = "PageDates"
  return Component
}
