import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './config'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
const FIREBASE_BUCKET = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const isRealConfig = (val?: string) => {
  if (!val) return false
  const lower = val.toLowerCase()
  return (
    !lower.includes('your_') &&
    !lower.includes('placeholder') &&
    !lower.includes('demo')
  )
}

export const uploadFile = async (
  path: string,
  file: File
): Promise<string> => {
  // 1. Try Firebase Storage if real bucket is configured
  if (isRealConfig(FIREBASE_BUCKET) && storage) {
    try {
      const fileRef = storageRef(storage, path)
      const uploadPromise = uploadBytes(fileRef, file).then(() => getDownloadURL(fileRef))
      const timer = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Firebase Storage timeout')), 6000)
      )
      const downloadUrl = await Promise.race([uploadPromise, timer])
      if (downloadUrl) return downloadUrl
    } catch (err) {
      console.warn('Firebase Storage upload failed, trying alternatives:', err)
    }
  }

  // 2. Try Cloudinary if real credentials configured
  if (isRealConfig(CLOUD_NAME) && isRealConfig(UPLOAD_PRESET)) {
    try {
      const isPdf = file.type === 'application/pdf' || path.endsWith('.pdf')
      const endpoint = isPdf ? 'raw' : 'auto'
      const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${endpoint}/upload`

      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', UPLOAD_PRESET as string)

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
        return (data.secure_url || data.url) as string
      })

      const timer = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Cloudinary timeout')), 8000)
      )

      const cloudUrl = await Promise.race([uploadPromise, timer])
      if (cloudUrl) return cloudUrl
    } catch (err) {
      console.warn('Cloudinary upload failed, falling back to data URL:', err)
    }
  }

  // 3. Fallback to base64 Data URL (instant local/demo mode)
  return await fileToDataUrl(file)
}

export const deleteFile = async (_url: string): Promise<void> => {
  // Safe no-op for client-side storage
}