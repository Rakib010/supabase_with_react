import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../utils/supabase'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Name, email and password are required.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name: name.trim(),
        },
        // Email confirm click করলে login page-এ যাবে
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })

    setLoading(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    if (data?.user) {
      setRegisteredEmail(email.trim())
      setEmailSent(true)
    }
  }

  if (emailSent) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-icon">✉️</div>
          <h1>Check your email</h1>
          <p className="login-subtitle">
            We sent a confirmation link to{' '}
            <strong>{registeredEmail}</strong>. Confirm your email, then you
            can log in.
          </p>

          <p className="form-success">
            Confirmation email sent via SMTP. Open the link in your inbox.
          </p>

          <Link to="/login" className="btn btn-primary btn-full">
            Go to Login (after confirm)
          </Link>

          <p className="login-hint">
            Didn&apos;t get the email? Check spam, or{' '}
            <button
              type="button"
              className="link-button"
              onClick={() => {
                setEmailSent(false)
                setPassword('')
                setConfirmPassword('')
              }}
            >
              try again
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-icon">📚</div>
        <h1>Sign Up</h1>
        <p className="login-subtitle">Create an account to get started</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              disabled={loading}
            />
          </label>

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
              autoComplete="new-password"
              disabled={loading}
            />
          </label>

          <label>
            Confirm Password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={loading}
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="login-hint">
          Already have an account? <Link to="/login">Login</Link>
        </p>
        <p className="login-hint">
          <Link to="/">← Back to Home</Link>
        </p>
      </div>
    </div>
  )
}
