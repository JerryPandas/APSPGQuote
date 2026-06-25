import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { authApi } from './api/axios'
import { setCredentials, logout } from './store'
import Layout from './pages/Layout'
import Login from './pages/Login'
import Search from './pages/Search'
import CreateQuote from './pages/CreateQuote'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const dispatch = useDispatch()
  const { accessToken } = useSelector((state) => state.auth)

  useEffect(() => {
    if (accessToken) {
      authApi.me()
        .then((res) => {
          dispatch(setCredentials({ user: res.data }))
        })
        .catch(() => {
          dispatch(logout())
        })
    }
  }, [])

  return (
    <Routes>
      <Route path="/login" element={accessToken ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<CreateQuote />} />
        <Route path="search" element={<Search />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="admin" element={<Admin />} />
      </Route>
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
