/**
 * Helper utility to view and download resumes reliably across all browsers.
 * Handles HTTP URLs, Cloudinary URLs, and base64 data URLs (which Chromium blocks in top-level navigation).
 */

export const dataUrlToBlob = (dataUrl: string): Blob => {
  const parts = dataUrl.split(',')
  const mimeMatch = parts[0].match(/:(.*?);/)
  const mime = mimeMatch ? mimeMatch[1] : 'application/pdf'
  const byteString = atob(parts[1])
  const arrayBuffer = new ArrayBuffer(byteString.length)
  const uint8Array = new Uint8Array(arrayBuffer)

  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i)
  }

  return new Blob([uint8Array], { type: mime })
}

export const viewResume = (url: string): void => {
  if (!url) {
    alert('No resume is currently available.')
    return
  }

  try {
    if (url.startsWith('data:')) {
      const blob = dataUrlToBlob(url)
      const blobUrl = URL.createObjectURL(blob)
      const tab = window.open(blobUrl, '_blank')
      if (!tab) {
        // Pop-up blocker fallback: trigger invisible anchor
        const a = document.createElement('a')
        a.href = blobUrl
        a.target = '_blank'
        a.rel = 'noopener noreferrer'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000)
    } else {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  } catch (err) {
    console.error('Failed to open resume:', err)
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

export const downloadResume = (url: string, fileName = 'resume.pdf'): void => {
  if (!url) {
    alert('No resume is currently available to download.')
    return
  }

  try {
    if (url.startsWith('data:')) {
      const blob = dataUrlToBlob(url)
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000)
    } else {
      // For external URLs, attempt blob download to enforce correct filename if CORS permits,
      // otherwise fallback to direct anchor click
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error('Network error')
          return res.blob()
        })
        .then((blob) => {
          const blobUrl = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = blobUrl
          a.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          setTimeout(() => URL.revokeObjectURL(blobUrl), 60000)
        })
        .catch(() => {
          const a = document.createElement('a')
          a.href = url
          a.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`
          a.target = '_blank'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        })
    }
  } catch (err) {
    console.error('Failed to download resume:', err)
  }
}

export const formatFileSize = (bytes?: number): string => {
  if (!bytes || isNaN(bytes)) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
