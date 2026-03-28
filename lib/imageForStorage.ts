/**
 * Downscale and JPEG-compress a data URL so it fits Convex document limits (~1 MiB).
 */
export async function compressDataUrlForStorage(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const maxDim = 1400
      let w = img.naturalWidth
      let h = img.naturalHeight
      if (!w || !h) {
        reject(new Error('Invalid image dimensions'))
        return
      }
      if (w > maxDim || h > maxDim) {
        if (w >= h) {
          h = Math.round((h * maxDim) / w)
          w = maxDim
        } else {
          w = Math.round((w * maxDim) / h)
          h = maxDim
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not create canvas'))
        return
      }
      ctx.drawImage(img, 0, 0, w, h)
      let quality = 0.86
      let out = canvas.toDataURL('image/jpeg', quality)
      while (out.length > 950_000 && quality > 0.42) {
        quality -= 0.07
        out = canvas.toDataURL('image/jpeg', quality)
      }
      resolve(out)
    }
    img.onerror = () => reject(new Error('Could not load image'))
    img.src = dataUrl
  })
}
