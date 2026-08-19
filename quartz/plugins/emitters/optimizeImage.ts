import { createHash } from "crypto"
import path from "path"
import fs from "fs"
import sharp from "sharp"
import { FilePath } from "../../util/path"

// Obsidian attachments land in the content submodule at their original
// camera/screenshot resolution and with no compression pass — some of the
// source PNGs are 10-16MB. We can't touch the submodule (it's the user's
// separate Obsidian vault repo), so this runs only on the copy written into
// `public/`: cap the longest edge and re-encode through sharp's mozjpeg
// (jpeg) / imagequant (png) / native (webp) encoders. Extension and output
// path are left untouched so existing <img src> references keep working.
const MAX_DIMENSION = 1600
const JPEG_QUALITY = 80
const WEBP_QUALITY = 80
const PNG_QUALITY = 80

const OPTIMIZABLE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"])

// Full production builds wipe `public/` first (see build.ts), so a
// dest-based cache never survives across builds. Keep processed bytes
// content-addressed under .quartz-cache instead, so an unchanged source
// image is never re-run through sharp twice.
const CACHE_DIR = path.join(process.cwd(), ".quartz-cache", "optimized-images")

export function isOptimizableImage(fp: string): boolean {
  return OPTIMIZABLE_EXTENSIONS.has(path.extname(fp).toLowerCase())
}

async function encode(ext: string, image: sharp.Sharp): Promise<Buffer> {
  const resized = image.resize({
    width: MAX_DIMENSION,
    height: MAX_DIMENSION,
    fit: "inside",
    withoutEnlargement: true,
  })

  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return resized.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer()
    case ".webp":
      return resized.webp({ quality: WEBP_QUALITY }).toBuffer()
    case ".png":
      return resized.png({ quality: PNG_QUALITY, effort: 8 }).toBuffer()
    default:
      throw new Error(`Unsupported image extension for optimization: ${ext}`)
  }
}

export async function optimizeImageToFile(src: FilePath, dest: FilePath): Promise<void> {
  const ext = path.extname(src).toLowerCase()
  const stat = await fs.promises.stat(src)
  const cacheKey = createHash("sha256")
    .update(`${src}:${stat.mtimeMs}:${stat.size}:${MAX_DIMENSION}:${JPEG_QUALITY}`)
    .digest("hex")
  const cachePath = path.join(CACHE_DIR, `${cacheKey}${ext}`)

  await fs.promises.mkdir(path.dirname(dest), { recursive: true })

  if (fs.existsSync(cachePath)) {
    await fs.promises.copyFile(cachePath, dest)
    return
  }

  try {
    const optimized = await encode(ext, sharp(src))
    await fs.promises.mkdir(CACHE_DIR, { recursive: true })
    await fs.promises.writeFile(cachePath, optimized)
    await fs.promises.copyFile(cachePath, dest)
  } catch {
    // Corrupt/unsupported input etc. — fall back to a plain copy rather
    // than failing the whole build over one bad image.
    await fs.promises.copyFile(src, dest)
  }
}
