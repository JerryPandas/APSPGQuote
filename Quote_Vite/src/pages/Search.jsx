import { useState, useEffect, useCallback } from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import TableSortLabel from '@mui/material/TableSortLabel'
import Collapse from '@mui/material/Collapse'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import { quoteApi } from '../api/axios'

const defaultColumns = [
  { id: 'Category', label: 'Category', source: 'record' },
  { id: 'ProductType', label: 'Product Type', source: 'product' },
  { id: 'TypeDesign', label: 'Type Design', source: 'product' },
  { id: 'Rating', label: 'Rating', source: 'product' },
  { id: 'RaisteamDesignCode', label: 'Raisteam Design', source: 'product' },
  { id: 'EndConnection', label: 'End Connection', source: 'product' },
  { id: 'Size', label: 'Size', source: 'product' },
  { id: 'BodyMaterial', label: 'Body Material', source: 'product' },
  { id: 'EngineeringID', label: 'Engineering ID', source: 'product' },
  { id: 'FSNumber', label: 'FS Number', source: 'product' },
  { id: 'QuoteReference', label: 'Quote Ref', source: 'product' },
  { id: 'TotalPriceNetUnit', label: 'Total Price', source: 'product', align: 'right' },
  { id: 'OptionNetPriceExtraPerUnit', label: 'Option Extra', source: 'product', align: 'right' },
  { id: 'QuoteTransferPerUnit', label: 'Transfer', source: 'product', align: 'right' },
  { id: 'TransferPriceExtra', label: 'Transfer Extra', source: 'product', align: 'right' },
  { id: 'QuotePriceListPerUnit', label: 'List Price', source: 'product', align: 'right' },
  { id: 'ListPriceExtra', label: 'List Extra', source: 'product', align: 'right' },
  { id: 'BuyerCustomer', label: 'Buyer/Customer', source: 'record' },
  { id: 'EndUser', label: 'End User', source: 'record' },
  { id: 'LBPName', label: 'LBP Name', source: 'record' },
  { id: 'EngineeringCharges', label: 'Eng Charges', source: 'product', align: 'right' },
  { id: 'SourcingLocation', label: 'Sourcing Loc', source: 'record' },
  { id: 'ReplyDate', label: 'Reply Date', source: 'product' },
  { id: 'HandleById', label: 'Handle By', source: 'record' },
  { id: 'user_name', label: 'User Name', source: 'custom' },
  { id: 'sales_name', label: 'Sales Name', source: 'custom' },
  { id: 'PatternCharges', label: 'Pattern Charges', source: 'product', align: 'right' },
]

const childColumns = [
  { id: 'FSNumber', label: 'FS Number' },
  { id: 'TotalPriceNetUnit', label: 'Total Price', align: 'right' },
  { id: 'OptionNetPriceExtraPerUnit', label: 'Option Extra', align: 'right' },
  { id: 'QuoteTransferPerUnit', label: 'Transfer', align: 'right' },
  { id: 'TransferPriceExtra', label: 'Transfer Extra', align: 'right' },
  { id: 'QuotePriceListPerUnit', label: 'List Price', align: 'right' },
  { id: 'ListPriceExtra', label: 'List Extra', align: 'right' },
  { id: 'EngineeringHours', label: 'Eng Hours', align: 'right' },
  { id: 'EngineeringCharges', label: 'Eng Charges', align: 'right' },
]

function getValue(row, col) {
  if (col.source === 'record') return row.record?.[col.id]
  if (col.source === 'product') return row.product?.[col.id]
  if (col.source === 'custom') return row[col.id]
  return ''
}

function formatVal(val) {
  if (val === null || val === undefined) return '-'
  if (typeof val === 'number') return val.toLocaleString()
  if (typeof val === 'string' && val.includes('T')) {
    const d = new Date(val)
    return isNaN(d.getTime()) ? val : d.toLocaleDateString()
  }
  return String(val)
}

function ChildRow({ children }) {
  return (
    <Box sx={{ m: 1 }}>
      <Typography variant="subtitle2" gutterBottom>Child Items</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            {childColumns.map((col) => (
              <TableCell key={col.id} align={col.align || 'left'}>{col.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {children.map((child, idx) => (
            <TableRow key={idx}>
              {childColumns.map((col) => (
                <TableCell key={col.id} align={col.align || 'left'}>
                  {formatVal(child[col.id])}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {children.length === 0 && (
            <TableRow>
              <TableCell colSpan={childColumns.length} align="center">No child items</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  )
}

function ExpandableRow({ row }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <TableRow hover>
        <TableCell padding="checkbox">
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        {defaultColumns.map((col) => (
          <TableCell key={col.id} align={col.align || 'left'}>
            {formatVal(getValue(row, col))}
          </TableCell>
        ))}
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={defaultColumns.length + 1}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <ChildRow children={row.children || []} />
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}

export default function Search() {
  const [filters, setFilters] = useState({
    fs_number: '', rating: '', size: '', body_material: '',
    end_connection: '', quote_reference: '',
  })
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [sortField, setSortField] = useState('Id')
  const [sortOrder, setSortOrder] = useState('asc')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = useCallback(async (p, ps, sf, so) => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page: p + 1,
        page_size: ps,
        sort_field: sf,
        sort_order: so,
      }
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params[k] = v
      })
      const res = await quoteApi.search(params)
      setData(res.data.items)
      setTotal(res.data.total)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchData(page, pageSize, sortField, sortOrder)
  }, [page, pageSize, sortField, sortOrder, fetchData])

  const handleSearch = () => {
    setPage(0)
    fetchData(0, pageSize, sortField, sortOrder)
  }

  const handleClear = () => {
    setFilters({
      fs_number: '', rating: '', size: '', body_material: '',
      end_connection: '', quote_reference: '',
    })
    setPage(0)
  }

  const handleSort = (column) => {
    const isAsc = sortField === column && sortOrder === 'asc'
    setSortOrder(isAsc ? 'desc' : 'asc')
    setSortField(column)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Search Filters</Typography>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <TextField fullWidth label="FS Number" size="small" placeholder="FS100* FS200*"
              value={filters.fs_number}
              onChange={(e) => setFilters({ ...filters, fs_number: e.target.value })}
              onKeyDown={handleKeyDown}
              helperText="Use * as separator for multi"
            />
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <TextField fullWidth label="Rating" size="small" value={filters.rating}
              onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
              onKeyDown={handleKeyDown}
            />
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <TextField fullWidth label="Size" size="small" value={filters.size}
              onChange={(e) => setFilters({ ...filters, size: e.target.value })}
              onKeyDown={handleKeyDown}
            />
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <TextField fullWidth label="Body Material" size="small" value={filters.body_material}
              onChange={(e) => setFilters({ ...filters, body_material: e.target.value })}
              onKeyDown={handleKeyDown}
            />
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <TextField fullWidth label="End Connection" size="small" value={filters.end_connection}
              onChange={(e) => setFilters({ ...filters, end_connection: e.target.value })}
              onKeyDown={handleKeyDown}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <TextField fullWidth label="Quote Reference" size="small" value={filters.quote_reference}
              onChange={(e) => setFilters({ ...filters, quote_reference: e.target.value })}
              onKeyDown={handleKeyDown}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="contained" startIcon={<SearchIcon />} onClick={handleSearch}>
                Search
              </Button>
              <Button variant="outlined" startIcon={<ClearIcon />} onClick={handleClear}>
                Clear
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper>
        <TableContainer>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" />
                {defaultColumns.map((col) => (
                  <TableCell key={col.id} align={col.align || 'left'}>
                    <TableSortLabel
                      active={sortField === col.id}
                      direction={sortField === col.id ? sortOrder : 'asc'}
                      onClick={() => handleSort(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={defaultColumns.length + 1} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={defaultColumns.length + 1} align="center" sx={{ py: 4 }}>
                    No results found
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, idx) => <ExpandableRow key={row.product?.Id || idx} row={row} />)
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div" count={total} page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(0) }}
          rowsPerPageOptions={[20, 50, 100, 200]}
        />
      </Paper>
    </Box>
  )
}
