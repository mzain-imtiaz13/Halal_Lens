import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'
import logo from '../assets/Halal_lens_logo.png'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../firebase'
import { toast } from 'react-toastify'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [resetEmail, setResetEmail] = useState('')

  useEffect(() => {
    if (user) navigate('/', { replace: true })
    if (location.state?.loggedOut) setInfo('You have been logged out.')
  }, [user])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      const to = location.state?.from?.pathname || '/'
      navigate(to, { replace: true })
    } catch (err) {
      setError(err?.message || 'Login failed')
    }
  }

  const handlePasswordReset = async () => {
    setError('')
    try {
      await sendPasswordResetEmail(auth, resetEmail)
      setInfo('Password reset email sent successfully!')
    } catch (err) {
      setError(err?.message || 'Failed to send password reset email')
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card login-card--split">
        <div className="login-hero">
          <div className="hero-accent-1" />
          <div className="hero-accent-2" />
          <div className="hero-logo-wrap">
            <img src={logo} alt="Halal Lens" className="hero-logo" />
          </div>
          <div className="hero-caption">Halal Lens Admin</div>
        </div>

        <div className="login-form">
          <h3 style={{margin:0}}>Welcome back</h3>
          <div className="helper">Use your admin email and password to continue.</div>

          {info && <div className="pill" style={{marginTop:12, background:'#ecfdf3', borderColor:'#bbf7d0', color:'#166534'}}>{info}</div>}
          {error && <div className="pill" style={{marginTop:12, background:'#fef2f2', borderColor:'#fecaca', color:'#7f1d1d'}}>{error}</div>}

          <form onSubmit={onSubmit} style={{marginTop:16}}>
            <label className="helper">Email</label>
            <input
              className="input"
              placeholder="admin@halal.app"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <div className="space" />
            <label className="helper">Password</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <div className="space" />
            <button className="btn primary" type="submit" style={{width:'100%'}}>Sign In</button>

            <div className="row" style={{justifyContent:'space-between', marginTop:8}}>
              <button type="button" className="btn link" onClick={() => setResetEmail(email)}>Forgot password?</button>
              <button
                type="button"
                className="btn ghost"
                onClick={()=>{setEmail('admin@halal.app'); setPassword('admin123')}}
              >
                Use sample
              </button>
            </div>
          </form>

          {/* Password Reset Section */}
          {resetEmail && (
            <div style={{ marginTop: 20 }}>
              <h4>Enter your email to reset password</h4>
              <input
                type="email"
                className="input"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
              <button className="btn primary" onClick={handlePasswordReset}>Send Reset Email</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
