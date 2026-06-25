import { useState, useEffect } from 'react'
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, TextField, MenuItem, Alert,
  Tooltip, Snackbar,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import BlockIcon from '@mui/icons-material/Block'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import { adminApi } from '../api/axios'

const roleOptions = ['Admin', 'Manager', 'Member']

export default function Admin() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [editDialog, setEditDialog] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [editRole, setEditRole] = useState('Member')
  const [editEmail, setEditEmail] = useState('')
  const [editJob, setEditJob] = useState('')
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' })

  const loadUsers = async () => {
    try {
      const res = await adminApi.users()
      setUsers(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load users')
    }
  }

  useEffect(() => { loadUsers() }, [])

  const handleToggleStatus = async (user) => {
    try {
      await adminApi.toggleStatus(user.Id, !user.IsActive)
      setSnack({ open: true, msg: `User ${user.UserName} ${user.IsActive ? 'deactivated' : 'activated'}`, severity: 'success' })
      loadUsers()
    } catch (err) {
      setSnack({ open: true, msg: err.response?.data?.detail || 'Failed', severity: 'error' })
    }
  }

  const handleDelete = async (user) => {
    try {
      await adminApi.deleteUser(user.Id)
      setSnack({ open: true, msg: `User ${user.UserName} deleted`, severity: 'success' })
      loadUsers()
    } catch (err) {
      setSnack({ open: true, msg: err.response?.data?.detail || 'Failed', severity: 'error' })
    }
  }

  const openEdit = (user) => {
    setEditingUser(user)
    setEditRole(user.Role)
    setEditEmail(user.Email || '')
    setEditJob(user.Job || '')
    setEditDialog(true)
  }

  const handleSaveEdit = async () => {
    if (!editingUser) return
    try {
      if (editRole !== editingUser.Role) {
        await adminApi.updateRole(editingUser.Id, editRole)
      }
      await adminApi.updateUser(editingUser.Id, { email: editEmail, job: editJob })
      setSnack({ open: true, msg: 'User updated', severity: 'success' })
      setEditDialog(false)
      loadUsers()
    } catch (err) {
      setSnack({ open: true, msg: err.response?.data?.detail || 'Failed', severity: 'error' })
    }
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>User Management</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Job</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.Id} hover>
                  <TableCell>{u.Id}</TableCell>
                  <TableCell>{u.UserName}</TableCell>
                  <TableCell>{u.Email || '-'}</TableCell>
                  <TableCell>
                    <Chip label={u.Role} color={u.Role === 'Admin' ? 'error' : u.Role === 'Manager' ? 'warning' : 'default'} size="small" />
                  </TableCell>
                  <TableCell>{u.Job || '-'}</TableCell>
                  <TableCell>
                    <Chip label={u.IsActive ? 'Active' : 'Inactive'} color={u.IsActive ? 'success' : 'default'} size="small" />
                  </TableCell>
                  <TableCell>{u.CreatedAt ? new Date(u.CreatedAt).toLocaleDateString() : '-'}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(u)}><EditIcon /></IconButton></Tooltip>
                    <Tooltip title={u.IsActive ? 'Deactivate' : 'Activate'}>
                      <IconButton size="small" onClick={() => handleToggleStatus(u)}>
                        {u.IsActive ? <BlockIcon /> : <CheckCircleIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(u)}><DeleteIcon /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>No users found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User: {editingUser?.UserName}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField select label="Role" value={editRole} onChange={(e) => setEditRole(e.target.value)} fullWidth size="small">
              {roleOptions.map((r) => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </TextField>
            <TextField label="Email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} fullWidth size="small" />
            <TextField label="Job" value={editJob} onChange={(e) => setEditJob(e.target.value)} fullWidth size="small" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })} message={snack.msg} />
    </Box>
  )
}
