import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Plus, LayoutGrid, Heart, Search, UserCircle, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/dear-wardrobe-logo.svg'

const NAV = [
  { icon: UserCircle, path: '/profile',   label: 'Profile'   },
  { icon: Home,       path: '/',          label: 'Home'      },
  { icon: Plus,       path: '/add',       label: 'Add'       },
  { icon: LayoutGrid, path: '/gallery',   label: 'Gallery'   },
  { icon: Heart,      path: '/favorites', label: 'Favorites' },
  { icon: Search,     path: '/explore',   label: 'Explore'   },
]

export default function Sidebar() {
  const location   = useLocation()
  const navigate   = useNavigate()
  const { logout } = useAuth()

  return (
    <nav
      className="w-24 flex flex-col items-center py-5 gap-0.5 shrink-0 z-10"
      style={{ background: 'linear-gradient(180deg, #5F0C2F 0%, #4a0924 100%)' }}
    >
      {/* Brand mark */}
      <div className="flex flex-col items-center mb-5 select-none">
        <img src={logo} alt="Dear Wardrobe logo" className="w-14 h-10 object-contain" />
        <span className="text-[10px] font-display tracking-[0.18em] mt-1.5"
          style={{ color: 'rgba(255,241,181,0.60)' }}>
          DEAR WARDROBE
        </span>
      </div>

      {/* Nav items */}
      {NAV.map(({ icon: Icon, path, label }) => {
        const active = location.pathname === path
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            title={label}
            className="w-[78px] flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all duration-200"
            style={active ? {
              background: '#FFF1B5',
              color: '#5F0C2F',
              boxShadow: '0 2px 12px rgba(95,12,47,0.35)',
            } : {
              color: 'rgba(255,241,181,0.70)',
            }}
            onMouseEnter={e => {
              if (!active) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.10)'
                e.currentTarget.style.color = '#FFF1B5'
              }
            }}
            onMouseLeave={e => {
              if (!active) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'rgba(255,241,181,0.70)'
              }
            }}
          >
            <Icon
              size={22}
              strokeWidth={active ? 2.3 : 1.7}
            />
            <span
              className="text-[10px] tracking-wide leading-none"
              style={{ fontWeight: active ? 700 : 500 }}
            >
              {label}
            </span>
          </button>
        )
      })}

      <div className="flex-1" />

      {/* Divider */}
      <div className="w-12 h-px mb-1" style={{ background: 'rgba(255,241,181,0.15)' }} />

      {/* Logout */}
      <button
        onClick={logout}
        title="Log out"
        className="w-[78px] flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all duration-200"
        style={{ color: 'rgba(255,241,181,0.45)' }}
        onMouseEnter={e => {
          e.currentTarget.style.color = 'rgba(255,241,181,0.80)'
          e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = 'rgba(255,241,181,0.45)'
          e.currentTarget.style.background = 'transparent'
        }}
      >
        <LogOut size={18} strokeWidth={1.7} />
        <span className="text-[10px] font-medium tracking-wide leading-none">Logout</span>
      </button>
    </nav>
  )
}
