import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabase'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.')
      return
    }

    setLoading(true)

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    setLoading(false)

    if (loginError) {
      setError(loginError.message)
      return
    }

    if (data?.session) {
      navigate('/')
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-icon">📚</div>
        <h1>Login</h1>
        <p className="login-subtitle">Sign in to manage your books</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={loading}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loading}
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="login-hint">
          No account? <Link to="/signup">Sign up</Link>
        </p>
        <p className="login-hint">
          <Link to="/">← Back to Home</Link>
        </p>
      </div>
    </div>
  )
}
