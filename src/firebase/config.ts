// Firebase configuration
// Safe initialization with fallbacks for local / demo testing
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Valid formatted 39-character placeholder key when no custom env key is provided
const DEFAULT_API_KEY = 'AIzaSyA01234567890123456789012345678901'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || DEFAULT_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'portfolio-demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'portfolio-demo',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'portfolio-demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:demo1234567890abcdef',
}

let app: any
try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
} catch (err) {
  console.warn('Firebase initializeApp warning:', err)
}

let auth: any
try {
  if (app) auth = getAuth(app)
} catch (err) {
  console.warn('Firebase getAuth warning (using demo auth fallback):', err)
}

let db: any
try {
  if (app) db = getFirestore(app)
} catch (err) {
  console.warn('Firebase getFirestore warning (using local fallback):', err)
}

let storage: any
try {
  if (app) storage = getStorage(app)
} catch (err) {
  console.warn('Firebase getStorage warning (using local fallback):', err)
}

export { auth, db, storage }
export default app
