import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../firebase'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { db } from '../firebase'
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u || null)
      if (!u) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      try {
        const ref = doc(db, 'admins', u.uid)
        const snap = await getDoc(ref)

        if (!snap.exists()) {
          // Ensure an admin doc with email exists when admin is created
          await setDoc(ref, {
            email: u.email || '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }, { merge: true })
          setIsAdmin(true)
        } else {
          // Backfill email if missing
          const d = snap.data() || {}
          if (!d.email && u.email) {
            await updateDoc(ref, { email: u.email, updatedAt: serverTimestamp() })
          }
          setIsAdmin(true)
        }
      } catch {
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    })
    return () => unsub()
  }, [])

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password)

  const logout = async () => {
    try {
      await signOut(auth)
      toast.success('You have been logged out successfully.', {
        position: "top-right",
        autoClose: 5000,
        style: {
          backgroundColor: '#16a34a',
          color: '#fff',
          fontWeight: 'bold',
          borderRadius: '8px',
          padding: '16px',
        }
      })
      navigate('/login', { state: { loggedOut: true } })
    } catch (err) {
      console.error('Logout failed', err)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
