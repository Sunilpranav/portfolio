const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const uploadFile = async (
  path: string,
  file: File
): Promise<string> => {
  try {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      throw new Error('Cloudinary env vars missing')
    }

    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)

    const folder = path.substring(0, path.lastIndexOf('/'))
    if (folder) formData.append('folder', folder)

    const uploadPromise = fetch(url, {
      method: 'POST',
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error?.message || 'Cloudinary upload failed')
      }
      const data = await res.json()
      return data.secure_url as string
    })

    const timer = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Storage timeout')), 15000)
    )

    return await Promise.race([uploadPromise, timer])
  } catch {
    return await fileToDataUrl(file)
  }
}

export const deleteFile = async (_url: string): Promise<void> => {
  console.warn('deleteFile: Cloudinary deletion not implemented (requires backend).')
}