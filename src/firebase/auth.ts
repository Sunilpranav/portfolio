import { auth } from './config'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'

// Remove any leftover "demo login" session from older versions of this app.
try {
  localStorage.removeItem('portfolio_demo_user')
} catch {
  // ignore
}

// Real Firebase Authentication only.
// Create your admin user in Firebase Console -> Authentication -> Users.
export const loginWithEmail = async (email: string, password: string) => {
  if (!auth) throw new Error('Firebase Auth not available')
  const res = await signInWithEmailAndPassword(auth, email.trim(), password)
  return res.user
}

export const logout = async () => {
  if (auth) await signOut(auth)
}

export const onAuthChange = (callback: (user: any) => void) => {
  if (!auth) {
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(auth, u => callback(u))
}
// import { auth } from './config'
// import {
//   signInWithEmailAndPassword,
//   signOut,
//   onAuthStateChanged,
// } from 'firebase/auth'

// // ✅ Change your admin credentials in the .env file:
// // VITE_ADMIN_EMAIL=your-email@gmail.com
// // VITE_ADMIN_PASSWORD=yourpassword
// const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@example.com'
// const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'

// export const DEMO_USER = {
//   uid: 'demo-admin-id',
//   email: ADMIN_EMAIL,
//   displayName: 'Admin User',
// }

// export const loginWithEmail = async (email: string, password: string) => {
//   // Demo login credentials for local testing
//   if (email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
//     localStorage.setItem('portfolio_demo_user', JSON.stringify(DEMO_USER))
//     window.dispatchEvent(new Event('auth_state_change'))
//     return DEMO_USER
//   }

//   try {
//     if (!auth) throw new Error('Firebase Auth not available')
//     const res = await signInWithEmailAndPassword(auth, email, password)
//     localStorage.removeItem('portfolio_demo_user')
//     return res.user
//   } catch (err) {
//     if (email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && password.length >= 6) {
//       localStorage.setItem('portfolio_demo_user', JSON.stringify(DEMO_USER))
//       window.dispatchEvent(new Event('auth_state_change'))
//       return DEMO_USER
//     }
//     throw err
//   }
// }

// export const logout = async () => {
//   localStorage.removeItem('portfolio_demo_user')
//   window.dispatchEvent(new Event('auth_state_change'))
//   try {
//     if (auth) await signOut(auth)
//   } catch {
//     // ignore
//   }
// }

// export const onAuthChange = (callback: (user: any) => void) => {
//   const checkState = () => {
//     const demo = localStorage.getItem('portfolio_demo_user')
//     if (demo) {
//       try {
//         callback(JSON.parse(demo))
//         return
//       } catch {
//         // ignore
//       }
//     }
//   }

//   let unsub = () => {}
//   try {
//     if (auth) {
//       unsub = onAuthStateChanged(auth, u => {
//         const demo = localStorage.getItem('portfolio_demo_user')
//         if (demo) {
//           try {
//             callback(JSON.parse(demo))
//           } catch {
//             callback(u)
//           }
//         } else {
//           callback(u)
//         }
//       })
//     }
//   } catch (err) {
//     console.warn('onAuthStateChanged fallback mode:', err)
//   }

//   window.addEventListener('auth_state_change', checkState)
//   checkState()

//   return () => {
//     unsub()
//     window.removeEventListener('auth_state_change', checkState)
//   }
// }
