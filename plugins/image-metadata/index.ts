import type { QuartzTransformerPlugin } from "@quartz-community/types"
import type { PluggableList } from "unified"
import type { Root, Image } from "mdast"
import { visit } from "unist-util-visit"
import fs from "fs"
import path from "path"
import { imageSize } from "image-size"
import { slugifyFilePath } from "@quartz-community/utils"

const imageExts = new Set([".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp", ".avif", ".svg"])

// Wikilink image embeds (`![[photo.png]]`) reference files by bare filename,
// resolved Obsidian-style by searching the whole vault — not a path relative
// to the content root or the current note. Build a basename -> full path
// index once (lazily, cached per content root) to resolve those.
const basenameIndexCache = new Map<string, Map<string, string>>()

function buildBasenameIndex(contentDir: string): Map<string, string> {
  const index = new Map<string, string>()
  const walk = (dir: string) => {
    let entries: fs.Dirent[]
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full)
      } else if (entry.isFile()) {
        // key by the slugified basename, matching how obsidian-flavored-markdown
        // rewrites wikilink image targets (spaces -> dashes, lowercased, etc.)
        // before our transformer ever sees the mdast image node's url
        const key = path.basename(slugifyFilePath(entry.name)).toLowerCase()
        if (!index.has(key)) index.set(key, full)
      }
    }
  }
  walk(contentDir)
  return index
}

function getBasenameIndex(contentDir: string): Map<string, string> {
  let index = basenameIndexCache.get(contentDir)
  if (!index) {
    index = buildBasenameIndex(contentDir)
    basenameIndexCache.set(contentDir, index)
  }
  return index
}

function resolveImageSrc(rawUrl: string, contentDir: string, mdFilePath?: string): string | null {
  if (/^(?:[a-z]+:)?\/\//i.test(rawUrl) || rawUrl.startsWith("data:")) return null

  const [urlPart] = rawUrl.split(/[?#]/)
  const decoded = decodeURIComponent(urlPart)

  const candidates = [
    path.join(contentDir, decoded),
    mdFilePath ? path.resolve(path.dirname(mdFilePath), decoded) : undefined,
  ].filter((p): p is string => !!p)

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate
  }

  // Fall back to vault-wide basename lookup (Obsidian wikilink convention)
  const basename = path.basename(decoded).toLowerCase()
  const indexed = getBasenameIndex(contentDir).get(basename)
  return indexed ?? null
}

// Reads intrinsic image dimensions and marks images for lazy loading so the
// browser can reserve layout space (avoids CLS) and defer offscreen images.
export const ImageMetadata: QuartzTransformerPlugin = () => {
  return {
    name: "ImageMetadata",
    markdownPlugins(ctx) {
      const plugins: PluggableList = []
      plugins.push(() => {
        return (tree: Root, file: { data: { filePath?: string } }) => {
          visit(tree, "image", (node: Image) => {
            const ext = path.extname(node.url.split(/[?#]/)[0]).toLowerCase()
            if (!imageExts.has(ext)) return

            const hProperties = ((node.data ??= {}).hProperties ??= {}) as Record<string, unknown>

            const hasExplicitDims =
              hProperties.width !== undefined &&
              hProperties.width !== "auto" &&
              hProperties.height !== undefined &&
              hProperties.height !== "auto"

            if (!hasExplicitDims) {
              const srcPath = resolveImageSrc(node.url, ctx.argv.directory, file.data.filePath)
              if (srcPath) {
                try {
                  const { width, height } = imageSize(fs.readFileSync(srcPath))
                  if (width && height) {
                    hProperties.width = width
                    hProperties.height = height
                  }
                } catch {
                  // unreadable/unsupported image, skip dimension hinting
                }
              }
            }

            hProperties.loading ??= "lazy"
            hProperties.decoding ??= "async"
          })
        }
      })
      return plugins
    },
  }
}
