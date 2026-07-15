import { Link, NavLink } from 'react-router-dom'

export default function Header() {
  return (
    <header className="app-header">
      <Link to="/" className="header-brand">
        <span className="header-icon">📚</span>
        <h1>Book Library</h1>
      </Link>

      <nav className="header-nav">
        <NavLink to="/login" className="nav-link">
          Login
        </NavLink>
        <NavLink to="/signup" className="btn btn-primary btn-sm">
          Sign Up
        </NavLink>
      </nav>
    </header>
  )
}
