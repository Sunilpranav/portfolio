import { db } from './config'
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  setDoc,
  query,
  orderBy,
  serverTimestamp,
  type QueryConstraint,
} from 'firebase/firestore'

// One-time cleanup of old browser-only data saved by earlier versions.
try {
  if (localStorage.getItem('portfolio_cache_v') !== '2') {
    Object.keys(localStorage)
      .filter(k => k.startsWith('portfolio_col_') || k.startsWith('portfolio_doc_'))
      .forEach(k => localStorage.removeItem(k))
    localStorage.setItem('portfolio_cache_v', '2')
  }
} catch {
  // ignore
}

// Timeout so the app never hangs forever
const withTimeout = <T>(promise: Promise<T>, ms = 15000): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Firebase operation timed out')), ms)
    promise
      .then(res => {
        clearTimeout(timer)
        resolve(res)
      })
      .catch(err => {
        clearTimeout(timer)
        reject(err)
      })
  })
}

// Read-only offline cache (never used for writes)
const getLocalCollection = (name: string) => {
  try {
    const data = localStorage.getItem(`portfolio_col_${name}`)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

const saveLocalCollection = (name: string, items: unknown[]) => {
  try {
    localStorage.setItem(`portfolio_col_${name}`, JSON.stringify(items))
  } catch {
    // ignore
  }
}

// Generic get collection
export const getCollection = async (collectionName: string, ...constraints: QueryConstraint[]) => {
  try {
    const ref = collection(db, collectionName)
    const q = constraints.length > 0 ? query(ref, ...constraints) : ref
    const snap = await withTimeout(getDocs(q), 15000)
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    saveLocalCollection(collectionName, docs)
    return docs
  } catch (err) {
    console.error(`Firestore read failed for "${collectionName}":`, err)
    return getLocalCollection(collectionName)
  }
}

// Read the last-known copy of a document synchronously (instant, no network)
export const getCachedDocument = (collectionName: string, docId: string): any | null => {
  try {
    const cached = localStorage.getItem(`portfolio_doc_${collectionName}_${docId}`)
    return cached ? JSON.parse(cached) : null
  } catch {
    return null
  }
}

const fetchDocument = async (collectionName: string, docId: string) => {
  const cacheKey = `portfolio_doc_${collectionName}_${docId}`
  try {
    const ref = doc(db, collectionName, docId)
    const snap = await withTimeout(getDoc(ref), 15000)
    if (snap.exists()) {
      const data = { id: snap.id, ...snap.data() }
      try { localStorage.setItem(cacheKey, JSON.stringify(data)) } catch { /* ignore */ }
      return data
    }
    try { localStorage.removeItem(cacheKey) } catch { /* ignore */ }
    return null
  } catch (err) {
    console.error(`Firestore read failed for "${collectionName}/${docId}":`, err)
    try {
      const cached = localStorage.getItem(cacheKey)
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  }
}


// Firestore rejects `undefined` values, so strip them out (plain objects/arrays only)
const clean = (v: any): any => {
  if (Array.isArray(v)) return v.filter(x => x !== undefined).map(clean)
  if (v && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype) {
    return Object.fromEntries(
      Object.entries(v)
        .filter(([, val]) => val !== undefined)
        .map(([k, val]) => [k, clean(val)])
    )
  }
  return v
}

// Firestore documents are limited to 1 MiB
const assertSize = (data: unknown, label: string) => {
  const size = new Blob([JSON.stringify(data)]).size
  if (size > 1000000) {
    throw new Error(
      `${label} is too large (${Math.round(size / 1024)} KB, limit is about 1000 KB). ` +
      `Large images/PDFs must be uploaded through Cloudinary or Firebase Storage instead of being stored in the database.`
    )
  }
}

// Generic get single doc. Several sections ask for the same document at the
// same time (Hero, Contact, Footer...), so share one network request between them.
const inFlight: Record<string, Promise<any>> = {}
export const getDocument = (collectionName: string, docId: string): Promise<any> => {
  const key = `${collectionName}/${docId}`
  if (!inFlight[key]) {
    inFlight[key] = fetchDocument(collectionName, docId).finally(() => {
      delete inFlight[key]
    })
  }
  return inFlight[key]
}

// ---- WRITES: these THROW on failure so the admin sees the error ----

export const addDocument = async (collectionName: string, data: Record<string, unknown>) => {
  const ref = collection(db, collectionName)
  const payload = clean(data)
  assertSize(payload, `Document in "${collectionName}"`)
  const res = await withTimeout(
    addDoc(ref, { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }),
    15000
  )
  return { id: res.id }
}

export const updateDocument = async (collectionName: string, docId: string, data: Record<string, unknown>) => {
  const ref = doc(db, collectionName, docId)
  const payload = clean(data)
  assertSize(payload, `Document "${collectionName}/${docId}"`)
  await withTimeout(updateDoc(ref, { ...payload, updatedAt: serverTimestamp() }), 15000)
}

export const deleteDocument = async (collectionName: string, docId: string) => {
  const ref = doc(db, collectionName, docId)
  await withTimeout(deleteDoc(ref), 15000)
}

// For singleton docs like "about", "settings"
export const setDocument = async (collectionName: string, docId: string, data: Record<string, unknown>) => {
  const ref = doc(db, collectionName, docId)
  const payload = clean(data)
  assertSize(payload, `Document "${collectionName}/${docId}"`)
  await withTimeout(setDoc(ref, { ...payload, updatedAt: serverTimestamp() }, { merge: true }), 15000)
}

export { orderBy }