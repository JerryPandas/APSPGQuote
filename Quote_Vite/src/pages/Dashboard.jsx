import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
  Box, Paper, Grid, Typography, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Card, CardContent,
} from '@mui/material'
import {
  BarChart, LineChart, PieChart,
} from '@mui/x-charts'
import { dashboardApi } from '../api/axios'

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth)
  const [stats, setStats] = useState(null)
  const [productTypes, setProductTypes] = useState([])
  const [selectedType, setSelectedType] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchData = async (type) => {
    setLoading(true)
    try {
      const params = {}
      if (type) params.product_type = type
      if (user?.Role === 'Member') {
        // For member role, the backend automatically filters by current user
      }
      const [statsRes, typesRes] = await Promise.all([
        dashboardApi.stats(params),
        dashboardApi.productTypes(),
      ])
      setStats(statsRes.data)
      setProductTypes(typesRes.data)
    } catch (err) {
      console.error('Dashboard fetch error', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(selectedType)
  }, [selectedType])

  if (loading && !stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  const monthlyData = stats?.monthly_counts || []
  const yearlyData = stats?.yearly_counts || []
  const productBreakdown = stats?.product_type_breakdown || []
  const userStats = stats?.user_stats || []

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Dashboard</Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Total Quotes</Typography>
              <Typography variant="h4">{stats?.total_quotes || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Filter by Product Type</InputLabel>
            <Select value={selectedType} label="Filter by Product Type"
              onChange={(e) => setSelectedType(e.target.value)}>
              <MenuItem value="">All Types</MenuItem>
              {productTypes.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Monthly Quote Trend</Typography>
            <Box sx={{ height: 350 }}>
              {monthlyData.length > 0 ? (
                <BarChart
                  dataset={monthlyData.map((d) => ({
                    label: `${d.year}-${String(d.month).padStart(2, '0')}`,
                    count: d.count,
                  }))}
                  xAxis={[{ scaleType: 'band', dataKey: 'label' }]}
                  series={[{ dataKey: 'count', label: 'Quotes' }]}
                  height={320}
                />
              ) : (
                <Typography color="text.secondary" align="center" sx={{ pt: 8 }}>No data</Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Product Type Breakdown</Typography>
            <Box sx={{ height: 350 }}>
              {productBreakdown.length > 0 ? (
                <PieChart
                  series={[{
                    data: productBreakdown.map((d, i) => ({
                      id: i,
                      value: d.count,
                      label: d.product_type,
                    })),
                  }]}
                  height={320}
                />
              ) : (
                <Typography color="text.secondary" align="center" sx={{ pt: 8 }}>No data</Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Yearly Quote Trend</Typography>
            <Box sx={{ height: 300 }}>
              {yearlyData.length > 0 ? (
                <LineChart
                  dataset={yearlyData.map((d) => ({
                    year: String(d.year),
                    count: d.count,
                  }))}
                  xAxis={[{ scaleType: 'band', dataKey: 'year' }]}
                  series={[{ dataKey: 'count', label: 'Quotes', color: '#1976d2' }]}
                  height={270}
                />
              ) : (
                <Typography color="text.secondary" align="center" sx={{ pt: 6 }}>No data</Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {(user?.Role === 'Admin' || user?.Role === 'Manager') && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>User Performance</Typography>
              <Box sx={{ height: 300 }}>
                {userStats.length > 0 ? (
                  <BarChart
                    dataset={userStats.map((d) => ({
                      user: d.user_name,
                      count: d.count,
                    }))}
                    xAxis={[{ scaleType: 'band', dataKey: 'user' }]}
                    series={[{ dataKey: 'count', label: 'Quotes', color: '#dc004e' }]}
                    height={270}
                  />
                ) : (
                  <Typography color="text.secondary" align="center" sx={{ pt: 6 }}>No data</Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}
