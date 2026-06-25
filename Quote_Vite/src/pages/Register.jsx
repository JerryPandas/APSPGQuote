import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert, CircularProgress,
} from '@mui/material'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { authApi } from '../api/axios'
import { setCredentials } from '../store'

export default function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await authApi.register(username, password)
      dispatch(setCredentials({
        user: res.data,
        access_token: '',
        refresh_token: '',
      }))
      const loginRes = await authApi.login(username, password)
      dispatch(setCredentials({
        access_token: loginRes.data.access_token,
        refresh_token: loginRes.data.refresh_token,
      }))
      const meRes = await authApi.me()
      dispatch(setCredentials({
        user: meRes.data,
        access_token: loginRes.data.access_token,
        refresh_token: loginRes.data.refresh_token,
      }))
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
      <Card sx={{ maxWidth: 400, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <PersonAddIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h5">APSPG Quote</Typography>
            <Typography variant="body2" color="text.secondary">Create an account</Typography>
          </Box>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Username" value={username}
              onChange={(e) => setUsername(e.target.value)} required
              sx={{ mb: 2 }} autoFocus
            />
            <TextField
              fullWidth label="Password" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth label="Confirm Password" type="password" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} required
              sx={{ mb: 3 }}
            />
            <Button
              type="submit" fullWidth variant="contained" size="large"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Account'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
