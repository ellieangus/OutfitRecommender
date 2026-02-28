import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Plus, LayoutGrid, Heart, Search, UserCircle, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const NAV = [
  { icon: UserCircle, path: '/profile', label: 'Profile' },
  { icon: Home,       path: '/',        label: 'Home'    },
  { icon: Plus,       path: '/add',     label: 'Add'     },
  { icon: LayoutGrid, path: '/gallery', label: 'Gallery' },
  { icon: Heart,      path: '/favorites', label: 'Favorites' },
  { icon: Search,     path: '/explore', label: 'Explore' },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  return (
    <nav className="w-16 bg-sidebar flex flex-col items-center py-5 gap-1.5 shrink-0 z-10">
      {/* Logo mark */}
      <div className="text-xl mb-4 select-none" title="Outfit AI">✨</div>

      {NAV.map(({ icon: Icon, path, label }) => {
        const active = location.pathname === path
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            title={label}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150
              ${active
                ? 'bg-rose-400 text-white shadow-lg shadow-rose-900/40'
                : 'text-rose-100/40 hover:text-rose-100/80 hover:bg-white/8'
              }`}
          >
            <Icon size={19} strokeWidth={active ? 2.2 : 1.8} />
          </button>
        )
      })}

      <div className="flex-1" />

      <button
        onClick={logout}
        title="Log out"
        className="w-10 h-10 rounded-xl flex items-center justify-center text-rose-100/25 hover:text-rose-100/60 hover:bg-white/8 transition-all"
      >
        <LogOut size={17} />
      </button>
    </nav>
  )
}
