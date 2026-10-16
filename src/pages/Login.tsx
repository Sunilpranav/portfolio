import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { loginWithEmail } from '../firebase/auth'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { FiMail, FiLock, FiLogIn, FiEye, FiEyeOff } from 'react-icons/fi'

interface LoginForm {
  email: string
  password: string
}

const Login: React.FC = () => {
  const { user, loading } = useAuth()
  const { toast } = useToast()
  const [showPwd, setShowPwd] = useState(false)
  const [loggingIn, setLoggingIn] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()

  if (loading) return null
  if (user) return <Navigate to="/admin" replace />

  const onSubmit = async (data: LoginForm) => {
    setLoggingIn(true)
    try {
      await loginWithEmail(data.email, data.password)
      toast('Welcome back!', 'success')
    } catch {
      toast('Invalid credentials. Please try again.', 'error')
    } finally {
      setLoggingIn(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(99,102,241,0.08)', filter: 'blur(80px)', top: '-100px', right: '-100px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(139,92,246,0.08)', filter: 'blur(80px)', bottom: '-100px', left: '-100px', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: 'var(--accent-gradient)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            color: '#fff',
            fontSize: '1.5rem',
            margin: '0 auto 1rem',
          }}>
            P
          </div>
          <h1 style={{ fontWeight: 800, fontSize: '1.75rem', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Admin Login
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Sign in to manage your portfolio
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="card glass-card" style={{ padding: '2rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '0.9rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  fontSize: '0.95rem',
                  pointerEvents: 'none',
                }}>
                  <FiMail />
                </span>
                <input
                  id="login-email"
                  type="email"
                  className="form-input"
                  placeholder="admin@example.com"
                  style={{ paddingLeft: '2.5rem' }}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                  })}
                />
              </div>
              {errors.email && <span className="error-text">{errors.email.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '0.9rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  fontSize: '0.95rem',
                  pointerEvents: 'none',
                }}>
                  <FiLock />
                </span>
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  style={{
                    position: 'absolute',
                    right: '0.9rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    fontSize: '0.95rem',
                  }}
                >
                  {showPwd ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password.message}</span>}
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', opacity: loggingIn ? 0.7 : 1 }}
              disabled={loggingIn}
            >
              <FiLogIn />
              {loggingIn ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <a href="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>← Back to portfolio</a>
        </p>
      </div>
    </div>
  )
}

export default Login
