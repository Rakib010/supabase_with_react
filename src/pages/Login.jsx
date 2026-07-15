import { Link } from 'react-router-dom'

export default function Login() {
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-icon">📚</div>
        <h1>Login</h1>
        <p className="login-subtitle">Coming soon — Supabase auth will be added later.</p>

        <Link to="/" className="btn btn-primary btn-full">
          Back to Home
        </Link>

        <p className="login-hint">
          No account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
