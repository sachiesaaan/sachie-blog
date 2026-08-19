import { FilePath, joinSegments, slugifyFilePath } from "../../util/path"
import { QuartzEmitterPlugin, QuartzPageTypePluginInstance } from "../types"
import path from "path"
import fs from "fs"
import sharp from "sharp"
import { glob } from "../../util/glob"
import { Argv, BuildCtx } from "../../util/ctx"
import { QuartzConfig } from "../../cfg"

// Longest edge (px) images are downscaled to. 1600px covers the article's
// text column at 2x device pixel ratio with margin, since there's no
// lightbox/zoom to view photos at full resolution.
const MAX_IMAGE_DIMENSION = 1600
const resizableExts = new Set([".jpg", ".jpeg", ".png"])

async function emitOptimizedImage(src: FilePath, dest: FilePath, ext: string) {
  const pipeline = sharp(src).resize({
    width: MAX_IMAGE_DIMENSION,
    height: MAX_IMAGE_DIMENSION,
    fit: "inside",
    withoutEnlargement: true,
  })

  if (ext === ".png") {
    await pipeline.png({ compressionLevel: 9, quality: 80 }).toFile(dest)
  } else {
    await pipeline.jpeg({ quality: 80, mozjpeg: true }).toFile(dest)
  }
}

function getPageTypeExtensions(ctx: BuildCtx): Set<string> {
  const extensions = new Set<string>()
  const pageTypes = (ctx.cfg.plugins.pageTypes ?? []) as unknown as QuartzPageTypePluginInstance[]
  for (const pt of pageTypes) {
    if (pt.fileExtensions) {
      for (const ext of pt.fileExtensions) {
        extensions.add(ext)
      }
    }
  }
  return extensions
}

const filesToCopy = async (argv: Argv, cfg: QuartzConfig, excludeExtensions: Set<string>) => {
  const excludePatterns = ["**/*.md", ...cfg.configuration.ignorePatterns]
  for (const ext of excludeExtensions) {
    excludePatterns.push(`**/*${ext}`)
  }
  return await glob("**", argv.directory, excludePatterns)
}

const copyFile = async (argv: Argv, fp: FilePath) => {
  const src = joinSegments(argv.directory, fp) as FilePath

  const name = slugifyFilePath(fp)
  const dest = joinSegments(argv.output, name) as FilePath

  const dir = path.dirname(dest) as FilePath
  await fs.promises.mkdir(dir, { recursive: true })

  const ext = path.extname(fp).toLowerCase()
  if (resizableExts.has(ext)) {
    try {
      await emitOptimizedImage(src, dest, ext)
      return dest
    } catch {
      // fall back to a raw copy if sharp can't process this file (e.g. corrupt/odd encoding)
    }
  }

  await fs.promises.copyFile(src, dest)
  return dest
}

export const Assets: QuartzEmitterPlugin = () => {
  return {
    name: "Assets",
    async *emit(ctx) {
      const excludeExtensions = getPageTypeExtensions(ctx)
      const fps = await filesToCopy(ctx.argv, ctx.cfg, excludeExtensions)
      for (const fp of fps) {
        yield copyFile(ctx.argv, fp)
      }
    },
    async *partialEmit(ctx, _content, _resources, changeEvents) {
      const excludeExtensions = getPageTypeExtensions(ctx)
      for (const changeEvent of changeEvents) {
        const ext = path.extname(changeEvent.path)
        if (ext === ".md" || excludeExtensions.has(ext)) continue

        if (changeEvent.type === "add" || changeEvent.type === "change") {
          yield copyFile(ctx.argv, changeEvent.path)
        } else if (changeEvent.type === "delete") {
          const name = slugifyFilePath(changeEvent.path)
          const dest = joinSegments(ctx.argv.output, name) as FilePath
          await fs.promises.unlink(dest)
        }
      }
    },
  }
}
