import { storage } from './config'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

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
    const storageRef = ref(storage, path)
    const uploadPromise = uploadBytes(storageRef, file).then(() => getDownloadURL(storageRef))

    const timer = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Storage timeout')), 3000)
    )

    return await Promise.race([uploadPromise, timer])
  } catch {
    // Fallback to data URL when storage is offline/mock
    return await fileToDataUrl(file)
  }
}

export const deleteFile = async (url: string): Promise<void> => {
  try {
    const fileRef = ref(storage, url)
    await deleteObject(fileRef)
  } catch {
    // ignore
  }
}
