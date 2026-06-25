import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function ProtectedRoute({ children, requiredRole }) {
  const { accessToken, user } = useSelector((state) => state.auth)
  const location = useLocation()

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && user && user.Role !== 'Admin' && user.Role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return children
}
