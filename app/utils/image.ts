// Client-side image helpers for the admin upload flow. All of this runs in the browser
// (the admin section is ssr:false), so it can lean on File/Blob/Canvas freely.

// Longest edge we keep for uploads. Hero/gallery photos rarely need more than this, and
// downscaling first keeps Storage objects (and the public pages that load them) light.
const MAX_EDGE = 1600
const WEBP_QUALITY = 0.82

/** Strip a filename down to a Storage-safe stem ("Ada's Adobo.JPG" → "adas-adobo"). */
export function sanitizeFilename(name: string): string {
  const stem = name.replace(/\.[^.]+$/, '') // drop the extension
  return (
    stem
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'image'
  )
}

/**
 * Downscale + re-encode a large image to WebP so uploads stay small; returns the
 * processed blob plus the extension/content-type to store it under. Best-effort: if the
 * browser can't decode it (SVG, exotic format) or anything throws, the original file is
 * returned unchanged so the upload still succeeds.
 */
export async function processImage(
  file: File,
): Promise<{ blob: Blob; ext: string; contentType: string }> {
  const fallback = () => ({
    blob: file,
    ext: file.name.match(/\.([^.]+)$/)?.[1]?.toLowerCase() || 'bin',
    contentType: file.type || 'application/octet-stream',
  })

  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') return fallback()

  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
    // Already small enough and already a web-friendly type → don't re-encode needlessly.
    if (scale === 1 && (file.type === 'image/webp' || file.type === 'image/jpeg')) {
      bitmap.close()
      return fallback()
    }

    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      bitmap.close()
      return fallback()
    }
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY),
    )
    if (!blob) return fallback()
    return { blob, ext: 'webp', contentType: 'image/webp' }
  } catch {
    return fallback()
  }
}

/**
 * Recover the Storage object path from a public URL, so a deleted recipe can clean up its
 * images. Public URLs look like `…/storage/v1/object/public/recipe-images/<path>`; returns
 * the `<path>` part, or null if the URL isn't a recipe-images object.
 */
export function storagePathFromPublicUrl(url: string): string | null {
  const marker = '/recipe-images/'
  const at = url.indexOf(marker)
  if (at === -1) return null
  const path = url.slice(at + marker.length)
  return path ? decodeURIComponent(path) : null
}
