import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Sidebar from './components/Sidebar'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import AddPage from './pages/AddPage'
import GalleryPage from './pages/GalleryPage'
import FavoritesPage from './pages/FavoritesPage'
import ExplorePage from './pages/ExplorePage'
import ProfilePage from './pages/ProfilePage'

function AppRoutes() {
  const { token, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-rose-50">
        <span className="text-6xl animate-bounce">✨</span>
      </div>
    )
  }

  if (!token) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/add" element={<AddPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
