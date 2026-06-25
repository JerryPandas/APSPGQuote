import { configureStore, createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: localStorage.getItem('access_token') || null,
    refreshToken: localStorage.getItem('refresh_token') || null,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, access_token, refresh_token } = action.payload
      if (user !== undefined) state.user = user
      if (access_token !== undefined) {
        state.accessToken = access_token
        localStorage.setItem('access_token', access_token)
      }
      if (refresh_token !== undefined) {
        state.refreshToken = refresh_token
        localStorage.setItem('refresh_token', refresh_token)
      }
    },
    setUser: (state, action) => {
      state.user = action.payload
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    },
  },
})

export const { setCredentials, setUser, logout } = authSlice.actions

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
})
