// src/axios/index.js (or wherever)
import axios from 'axios'
import { auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 15000,
})

// Helper: wait for Firebase user if needed
let authInitPromise = null

const getFirebaseToken = async () => {
  // If user already available, just use it
  if (auth.currentUser) {
    return await auth.currentUser.getIdToken()
  }

  // If we already started waiting, reuse the same promise
  if (!authInitPromise) {
    authInitPromise = new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe()
        authInitPromise = null
        if (user) {
          const token = await user.getIdToken()
          resolve(token)
        } else {
          resolve(null)
        }
      })
    })
  }

  return authInitPromise
}

// Attach Firebase ID token if available
instance.interceptors.request.use(
  async (config) => {
    try {
      const token = await getFirebaseToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (e) {
      // optional: log error
      // console.warn('Failed to get Firebase token', e)
    }
    return config
  },
  (error) => Promise.reject(error),
)

instance.interceptors.response.use(
  (resp) => resp,
  (error) => Promise.reject(error),
)

export default instance
