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

// Helper for timeout so app never hangs on mock / offline credentials
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

// LocalStorage fallback helpers
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
  } catch {
    return getLocalCollection(collectionName)
  }
}

// Generic get single doc
export const getDocument = async (collectionName: string, docId: string) => {
  try {
    const ref = doc(db, collectionName, docId)
    const snap = await withTimeout(getDoc(ref), 15000)
    if (snap.exists()) {
      const data = { id: snap.id, ...snap.data() }
      localStorage.setItem(`portfolio_doc_${collectionName}_${docId}`, JSON.stringify(data))
      return data
    }
  } catch {
    // Fallback
  }
  const cached = localStorage.getItem(`portfolio_doc_${collectionName}_${docId}`)
  return cached ? JSON.parse(cached) : null
}

// Generic add doc
export const addDocument = async (collectionName: string, data: Record<string, unknown>) => {
  const newId = 'local-' + Date.now()
  const payload = { ...data, id: newId, createdAt: { seconds: Math.floor(Date.now() / 1000) } }

  try {
    const ref = collection(db, collectionName)
    const res = await withTimeout(addDoc(ref, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }), 15000)
    payload.id = res.id
  } catch {
    // Fallback
  }

  const items = getLocalCollection(collectionName)
  items.unshift(payload)
  saveLocalCollection(collectionName, items)
  return { id: payload.id }
}

// Generic update doc
export const updateDocument = async (collectionName: string, docId: string, data: Record<string, unknown>) => {
  try {
    const ref = doc(db, collectionName, docId)
    await withTimeout(updateDoc(ref, { ...data, updatedAt: serverTimestamp() }), 15000)
  } catch {
    // Fallback
  }

  const items = getLocalCollection(collectionName)
  const idx = items.findIndex((i: { id?: string }) => i.id === docId)
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...data }
    saveLocalCollection(collectionName, items)
  }
}

// Generic delete doc
export const deleteDocument = async (collectionName: string, docId: string) => {
  try {
    const ref = doc(db, collectionName, docId)
    await withTimeout(deleteDoc(ref), 15000)
  } catch {
    // Fallback
  }

  const items = getLocalCollection(collectionName)
  const filtered = items.filter((i: { id?: string }) => i.id !== docId)
  saveLocalCollection(collectionName, filtered)
}

// Generic set single doc (for singleton docs like "about", "settings")
export const setDocument = async (collectionName: string, docId: string, data: Record<string, unknown>) => {
  const payload = { ...data }
  localStorage.setItem(`portfolio_doc_${collectionName}_${docId}`, JSON.stringify(payload))

  try {
    const ref = doc(db, collectionName, docId)
    await withTimeout(setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true }), 15000)
  } catch {
    // Fallback
  }
}

export { orderBy }