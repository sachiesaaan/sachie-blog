import type { QuartzTransformerPlugin } from "@quartz-community/types"

// publish: true が付いたノートには自動で "blog" タグを追加する。
// これにより /tags/blog が「公開ノートの全件一覧」ページとして機能し、
// publish と一覧掲載を別々にタグ付けする二重管理を避けられる。
export const AutoPublishTag: QuartzTransformerPlugin = () => {
  return {
    name: "AutoPublishTag",
    markdownPlugins() {
      return [
        () => (_tree: unknown, file: any) => {
          const fm = file.data?.frontmatter
          if (!fm || fm.publish !== true) return

          const tags: string[] = Array.isArray(fm.tags) ? fm.tags : []
          if (!tags.includes("blog")) {
            fm.tags = [...tags, "blog"]
          }
        },
      ]
    },
  }
}
