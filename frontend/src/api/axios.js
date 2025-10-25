import axios from 'axios'
// import { auth } from '../firebase'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 15000
})

// Attach Firebase ID token if available
// instance.interceptors.request.use(async (config) => {
//   const user = auth.currentUser
//   if (user) {
//     const token = await user.getIdToken()
//     config.headers.Authorization = `Bearer ${token}`
//   }
//   return config
// })

instance.interceptors.response.use(
  (resp) => resp,
  (error) => {
    // Centralized error logging
    // console.error('API error:', error?.response || error?.message)
    return Promise.reject(error)
  }
)

export default instance
