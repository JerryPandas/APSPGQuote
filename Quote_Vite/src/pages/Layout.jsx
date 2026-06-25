import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import MenuIcon from '@mui/icons-material/Menu'
import SearchIcon from '@mui/icons-material/Search'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DashboardIcon from '@mui/icons-material/Dashboard'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import LogoutIcon from '@mui/icons-material/Logout'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import { logout } from '../store'
import { exportApi } from '../api/axios'

const drawerWidth = 240

export default function Layout() {
  const theme = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const handleExport = async () => {
    try {
      const res = await exportApi.csv()
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `quotes_export_${user?.UserName || 'data'}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error('Export failed', err)
    }
  }

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap>APSPG Quote</Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton selected={location.pathname === '/'}
            onClick={() => { navigate('/'); setMobileOpen(false) }}>
            <ListItemIcon><AddCircleOutlineIcon /></ListItemIcon>
            <ListItemText primary="Create Quote" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton selected={location.pathname === '/search'}
            onClick={() => { navigate('/search'); setMobileOpen(false) }}>
            <ListItemIcon><SearchIcon /></ListItemIcon>
            <ListItemText primary="Quote Search" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton selected={location.pathname === '/dashboard'}
            onClick={() => { navigate('/dashboard'); setMobileOpen(false) }}>
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        {user?.Role === 'Admin' && (
          <ListItem disablePadding>
            <ListItemButton selected={location.pathname === '/admin'}
              onClick={() => { navigate('/admin'); setMobileOpen(false) }}>
              <ListItemIcon><AdminPanelSettingsIcon /></ListItemIcon>
              <ListItemText primary="Admin" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleExport}>
            <ListItemIcon><FileDownloadIcon /></ListItemIcon>
            <ListItemText primary="Export CSV" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" sx={{ mr: 2, display: { sm: 'none' } }}
            onClick={() => setMobileOpen(!mobileOpen)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            APSPG Quote System
          </Typography>
          <Button color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'secondary.main' }}>
              {user?.UserName?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            {user?.UserName}
          </Button>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>{user?.Role}</MenuItem>
            <Divider />
            <MenuItem onClick={() => { setAnchorEl(null); handleLogout() }}>
              <LogoutIcon sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}>
          {drawer}
        </Drawer>
        <Drawer variant="permanent" open
          sx={{
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            display: { xs: 'none', sm: 'block' }
          }}>
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  )
}
