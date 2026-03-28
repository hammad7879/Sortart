/** Load a remote image into a data URL so canvas pixel reads are not tainted. */
export async function remoteImageToDataUrl(url: string): Promise<string> {
  const res = await fetch(url, { mode: 'cors' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const blob = await res.blob()
  if (!blob.type.startsWith('image/')) {
    throw new Error('Not an image')
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const r = reader.result
      if (typeof r === 'string') resolve(r)
      else reject(new Error('Invalid read result'))
    }
    reader.onerror = () => reject(reader.error ?? new Error('Read failed'))
    reader.readAsDataURL(blob)
  })
}
