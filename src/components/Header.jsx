import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabase'

export default function Header() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <header className="app-header">
      <Link to="/" className="header-brand">
        <span className="header-icon">📚</span>
        <h1>Book Library</h1>
      </Link>

      <nav className="header-nav">
        {user ? (
          <>
            <span className="user-email">
              {user.user_metadata?.name || user.email}
            </span>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="nav-link">
              Login
            </NavLink>
            <NavLink to="/signup" className="btn btn-primary btn-sm">
              Sign Up
            </NavLink>
          </>
        )}
      </nav>
    </header>
  )
}
