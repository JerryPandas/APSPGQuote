import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import {
  Box, Paper, Grid, TextField, Button, Typography, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Collapse, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, Tooltip, Card, CardContent, Divider,
  MenuItem, Snackbar, LinearProgress, Autocomplete,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import SaveIcon from '@mui/icons-material/Save'
import SearchIcon from '@mui/icons-material/Search'
import { createApi, lookupApi } from '../api/axios'

const emptyRecord = {
  QuoteReference: '', Category: '', BuyerCustomer: '', EndUser: '', LBPName: '',
  SourcingLocation: 'Nilai', DatedIn: '', DueDate: '',
  HandleById: 0, SalesName: 0, Remarks: '', SourcingRestriction: 'None',
  KOB: 1, IndustryCode: 1,
}

const emptyProduct = {
  ItemSerialNumber: null,
  ProductType: '', TypeDesign: '', Rating: '', RaisteamDesignCode: '',
  EndConnection: '', Size: '', BodyMaterial: '', EngineeringID: '',
  AssemblyOption: '', TrimType: '', FSNumber: '', PSC: '',
  TotalPriceNetUnit: 0, OptionNetPriceExtraPerUnit: 0,
  QuoteTransferPerUnit: 0, TransferPriceExtra: 0,
  QuotePriceListPerUnit: 0, ListPriceExtra: 0,
  EngineeringHours: null, EngineeringCharges: 0, PatternCharges: 0,
  SpecFinalizedDate: '', ReplyDate: '', OriginalDueDate: '',
  NoOfDateTakenFromDatedIn: 0, NoOfDateTakenFromSpecFinalizedDate: 0,
  OnTime: true, RightInFirstTime: null, RSDL: null, NextDayResponse: true,
}

const emptyChild = {
  ItemSerialNumber: null,
  ProductType: '', TypeDesign: '', Rating: '', RaisteamDesignCode: '',
  EndConnection: '', Size: '', BodyMaterial: '', EngineeringID: '',
  AssemblyOption: '', TrimType: '', FSNumber: '', PSC: '',
  TotalPriceNetUnit: 0, OptionNetPriceExtraPerUnit: 0,
  QuoteTransferPerUnit: 0, TransferPriceExtra: 0,
  QuotePriceListPerUnit: 0, ListPriceExtra: 0,
  EngineeringHours: null, EngineeringCharges: 0, PatternCharges: 0,
  SpecFinalizedDate: '', ReplyDate: '', OriginalDueDate: '',
  NoOfDateTakenFromDatedIn: 0, NoOfDateTakenFromSpecFinalizedDate: 0,
  OnTime: true, RightInFirstTime: null, RSDL: null, NextDayResponse: true,
}

export default function CreateQuote() {
  const { user } = useSelector((state) => state.auth)

  // Record state
  const [record, setRecord] = useState({ ...emptyRecord })
  const [savedRecord, setSavedRecord] = useState(null)
  const [savingRecord, setSavingRecord] = useState(false)
  const [recordError, setRecordError] = useState('')

  // Products state
  const [products, setProducts] = useState([])
  const [productDialog, setProductDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [productForm, setProductForm] = useState({ ...emptyProduct })
  const [savingProduct, setSavingProduct] = useState(false)

  // Children state
  const [expandedProduct, setExpandedProduct] = useState(null)
  const [childrenMap, setChildrenMap] = useState({})
  const [childDialog, setChildDialog] = useState(false)
  const [editingChild, setEditingChild] = useState(null)
  const [childForm, setChildForm] = useState({ ...emptyChild })
  const [childParentId, setChildParentId] = useState(null)
  const [savingChild, setSavingChild] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState(null)

  // Lookup data
  const [productTypes, setProductTypes] = useState([])
  const [typeDesigns, setTypeDesigns] = useState([])
  const [designCodes, setDesignCodes] = useState([])

  // Snackbar
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' })

  // Search dialog
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchRef, setSearchRef] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')

  useEffect(() => {
    lookupApi.productTypes().then((r) => setProductTypes(r.data)).catch(() => {})
    lookupApi.designCodes().then((r) => setDesignCodes(r.data)).catch(() => {})
  }, [])

  const loadProducts = useCallback(async (ref) => {
    if (!ref) return
    try {
      const res = await createApi.listProducts(ref)
      setProducts(res.data)
    } catch { setProducts([]) }
  }, [])

  const loadChildren = useCallback(async (productId) => {
    try {
      const res = await createApi.listChildren(productId)
      setChildrenMap((prev) => ({ ...prev, [productId]: res.data }))
    } catch {
      setChildrenMap((prev) => ({ ...prev, [productId]: [] }))
    }
  }, [])

  // ─── Record ────────────────────────────────────────

  const handleRecordChange = (field) => (e) => {
    const val = e.target.value
    setRecord((prev) => ({
      ...prev,
      [field]: (field === 'HandleById' || field === 'SalesName' || field === 'KOB' || field === 'IndustryCode')
        ? Number(val) : val,
    }))
  }

  const handleSaveRecord = async () => {
    if (!record.QuoteReference.trim()) {
      setRecordError('QuoteReference is required')
      return
    }
    setSavingRecord(true)
    setRecordError('')
    try {
      const payload = {
        ...record,
        HandleById: record.HandleById || user?.Id || 0,
        SalesName: record.SalesName || user?.Id || 0,
        DatedIn: new Date(record.DatedIn).toISOString(),
        DueDate: new Date(record.DueDate).toISOString(),
      }
      const res = await createApi.record(payload)
      setSavedRecord(res.data)
      setSnack({ open: true, msg: `Record created: ${res.data.QuoteReference}`, severity: 'success' })
    } catch (err) {
      setRecordError(err.response?.data?.detail || 'Failed to create record')
    } finally {
      setSavingRecord(false)
    }
  }

  // ─── Products ──────────────────────────────────────

  const openNewProduct = () => {
    setEditingProduct(null)
    setProductForm({ ...emptyProduct })
    setProductDialog(true)
  }

  const openEditProduct = (prod) => {
    setEditingProduct(prod)
    setProductForm({
      ...emptyProduct,
      ...Object.fromEntries(
        Object.keys(emptyProduct).map((k) => [k, prod[k] ?? emptyProduct[k]])
      ),
      SpecFinalizedDate: prod.SpecFinalizedDate ? prod.SpecFinalizedDate.slice(0, 16) : '',
      ReplyDate: prod.ReplyDate ? prod.ReplyDate.slice(0, 16) : '',
      OriginalDueDate: prod.OriginalDueDate ? prod.OriginalDueDate.slice(0, 16) : '',
    })
    setProductDialog(true)
  }

  const handleProductChange = (field) => (e) => {
    const val = e.target.value
    setProductForm((prev) => ({
      ...prev,
      [field]: ['OnTime', 'NextDayResponse', 'RSDL'].includes(field)
        ? val === '' ? null : val === 'true' || val === true
        : ['TotalPriceNetUnit', 'OptionNetPriceExtraPerUnit', 'QuoteTransferPerUnit',
          'TransferPriceExtra', 'QuotePriceListPerUnit', 'ListPriceExtra',
          'EngineeringCharges', 'PatternCharges', 'EngineeringHours',
          'NoOfDateTakenFromDatedIn', 'NoOfDateTakenFromSpecFinalizedDate',
        ].includes(field) ? Number(val) : val,
    }))
  }

  const handleProductTypeChange = async (e) => {
    const val = e.target.value
    setProductForm((prev) => ({ ...prev, ProductType: val, TypeDesign: '' }))
    if (val) {
      try {
        const found = productTypes.find((t) => t.name === val)
        if (found) {
          const res = await lookupApi.typeDesigns(found.id)
          setTypeDesigns(res.data)
        }
      } catch { setTypeDesigns([]) }
    } else {
      setTypeDesigns([])
    }
  }

  const handleSaveProduct = async () => {
    if (!savedRecord) return
    setSavingProduct(true)
    try {
      const payload = {
        ...productForm,
        ItemSerialNumber: productForm.ItemSerialNumber || null,
        SpecFinalizedDate: new Date(productForm.SpecFinalizedDate).toISOString(),
        ReplyDate: new Date(productForm.ReplyDate).toISOString(),
        OriginalDueDate: new Date(productForm.OriginalDueDate).toISOString(),
        OnTime: productForm.OnTime === null ? true : Boolean(productForm.OnTime),
        RSDL: productForm.RSDL === null ? null : Boolean(productForm.RSDL),
        NextDayResponse: productForm.NextDayResponse === null ? true : Boolean(productForm.NextDayResponse),
        RightInFirstTime: productForm.RightInFirstTime || null,
      }

      if (editingProduct) {
        await createApi.updateProduct(editingProduct.Id, payload)
        setSnack({ open: true, msg: 'Product updated', severity: 'success' })
      } else {
        await createApi.product(savedRecord.QuoteReference, payload)
        setSnack({ open: true, msg: 'Product added', severity: 'success' })
      }
      setProductDialog(false)
      await loadProducts(savedRecord.QuoteReference)
    } catch (err) {
      setSnack({ open: true, msg: err.response?.data?.detail || 'Failed', severity: 'error' })
    } finally {
      setSavingProduct(false)
    }
  }

  const handleDeleteProduct = async (id) => {
    try {
      await createApi.deleteProduct(id)
      setSnack({ open: true, msg: 'Product deleted', severity: 'success' })
      await loadProducts(savedRecord.QuoteReference)
    } catch (err) {
      setSnack({ open: true, msg: 'Delete failed', severity: 'error' })
    }
  }

  // ─── Children ──────────────────────────────────────

  const handleExpandProduct = (productId) => {
    if (expandedProduct === productId) {
      setExpandedProduct(null)
    } else {
      setExpandedProduct(productId)
      if (!childrenMap[productId]) loadChildren(productId)
    }
  }

  const sharedFields = [
    'ItemSerialNumber',
    'ProductType', 'TypeDesign', 'Rating', 'RaisteamDesignCode',
    'EndConnection', 'Size', 'BodyMaterial', 'EngineeringID',
    'AssemblyOption', 'TrimType', 'FSNumber', 'PSC',
    'TotalPriceNetUnit', 'OptionNetPriceExtraPerUnit',
    'QuoteTransferPerUnit', 'TransferPriceExtra',
    'QuotePriceListPerUnit', 'ListPriceExtra',
    'EngineeringHours', 'EngineeringCharges', 'PatternCharges',
    'SpecFinalizedDate', 'ReplyDate', 'OriginalDueDate',
    'NoOfDateTakenFromDatedIn', 'NoOfDateTakenFromSpecFinalizedDate',
    'OnTime', 'RightInFirstTime', 'RSDL', 'NextDayResponse',
  ]

  const openNewChild = (productId) => {
    setChildParentId(productId)
    setEditingChild(null)
    const parent = products.find((p) => p.Id === productId)
    const prefill = { ...emptyChild }
    if (parent) {
      sharedFields.forEach((field) => {
        if (parent[field] !== undefined && parent[field] !== null) {
          const val = parent[field]
          if (field.endsWith('Date') && typeof val === 'string') {
            prefill[field] = val.slice(0, 16)
          } else {
            prefill[field] = val
          }
        }
      })
    }
    setChildForm(prefill)
    setChildDialog(true)
  }

  const openEditChild = (child) => {
    setChildParentId(child.ChildItem || child.childItem || 0)
    setEditingChild(child)
    setChildForm({
      ...emptyChild,
      ...Object.fromEntries(
        Object.keys(emptyChild).map((k) => [k, child[k] ?? emptyChild[k]])
      ),
      SpecFinalizedDate: child.SpecFinalizedDate ? child.SpecFinalizedDate.slice(0, 16) : '',
      ReplyDate: child.ReplyDate ? child.ReplyDate.slice(0, 16) : '',
      OriginalDueDate: child.OriginalDueDate ? child.OriginalDueDate.slice(0, 16) : '',
    })
    setChildDialog(true)
  }

  const handleChildChange = (field) => (e) => {
    const val = e.target.value
    setChildForm((prev) => ({
      ...prev,
      [field]: ['OnTime', 'NextDayResponse', 'RSDL'].includes(field)
        ? val === '' ? null : val === 'true' || val === true
        : ['TotalPriceNetUnit', 'OptionNetPriceExtraPerUnit', 'QuoteTransferPerUnit',
          'TransferPriceExtra', 'QuotePriceListPerUnit', 'ListPriceExtra',
          'EngineeringCharges', 'PatternCharges', 'EngineeringHours',
          'NoOfDateTakenFromDatedIn', 'NoOfDateTakenFromSpecFinalizedDate',
        ].includes(field) ? Number(val) : val,
    }))
  }

  const handleSaveChild = async () => {
    if (!childParentId) return
    setSavingChild(true)
    try {
      const payload = {
        ...childForm,
        ItemSerialNumber: childForm.ItemSerialNumber || null,
        SpecFinalizedDate: new Date(childForm.SpecFinalizedDate).toISOString(),
        ReplyDate: new Date(childForm.ReplyDate).toISOString(),
        OriginalDueDate: new Date(childForm.OriginalDueDate).toISOString(),
        OnTime: childForm.OnTime === null ? true : Boolean(childForm.OnTime),
        RSDL: childForm.RSDL === null ? null : Boolean(childForm.RSDL),
        NextDayResponse: childForm.NextDayResponse === null ? true : Boolean(childForm.NextDayResponse),
        RightInFirstTime: childForm.RightInFirstTime || null,
      }
      if (editingChild) {
        await createApi.updateChild(editingChild.Id, payload)
        setSnack({ open: true, msg: 'Child updated', severity: 'success' })
      } else {
        await createApi.child(childParentId, payload)
        setSnack({ open: true, msg: 'Child added', severity: 'success' })
      }
      setChildDialog(false)
      await loadChildren(childParentId)
    } catch (err) {
      setSnack({ open: true, msg: err.response?.data?.detail || 'Failed', severity: 'error' })
    } finally {
      setSavingChild(false)
    }
  }

  const handleDeleteChild = async (id, productId) => {
    try {
      await createApi.deleteChild(id)
      setSnack({ open: true, msg: 'Child deleted', severity: 'success' })
      await loadChildren(productId)
    } catch {
      setSnack({ open: true, msg: 'Delete failed', severity: 'error' })
    }
  }

  // ─── Render ────────────────────────────────────────

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Create New Quote</Typography>
        <Button variant="outlined" startIcon={<SearchIcon />} onClick={() => setSearchOpen(true)}>
          Search Quote
        </Button>
      </Box>

      {/* ───── Record Section ───── */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          1. Quote Record Information
          {savedRecord && <Chip label={savedRecord.QuoteReference} color="primary" sx={{ ml: 2 }} />}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {recordError && <Alert severity="error" sx={{ mb: 2 }}>{recordError}</Alert>}

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="Quote Reference" size="small" required
              value={record.QuoteReference}
              onChange={handleRecordChange('QuoteReference')}
              placeholder="e.g. QT250001"
              disabled={!!savedRecord}
              helperText={savedRecord ? '已保存' : '手动输入'}/>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="Category" select value={record.Category}
              onChange={handleRecordChange('Category')} size="small" required>
              {['Fasani', 'Rotary', 'Sliding Stem'].map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="Buyer / Customer" size="small" required
              value={record.BuyerCustomer} onChange={handleRecordChange('BuyerCustomer')} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="End User" size="small" required
              value={record.EndUser} onChange={handleRecordChange('EndUser')} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="LBP Name" size="small" required
              value={record.LBPName} onChange={handleRecordChange('LBPName')} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="Sourcing Location" select value={record.SourcingLocation}
              onChange={handleRecordChange('SourcingLocation')} size="small">
              {['Nilai', 'WuQing', 'Sakura', 'EPMCL'].map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="Dated In" type="datetime-local" size="small" required
              value={record.DatedIn} onChange={handleRecordChange('DatedIn')}
              InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="Due Date" type="datetime-local" size="small" required
              value={record.DueDate} onChange={handleRecordChange('DueDate')}
              InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="KOB" type="number" size="small"
              value={record.KOB} onChange={handleRecordChange('KOB')} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="Industry Code" type="number" size="small"
              value={record.IndustryCode} onChange={handleRecordChange('IndustryCode')} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="Sourcing Restriction" size="small"
              value={record.SourcingRestriction} onChange={handleRecordChange('SourcingRestriction')} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="Handle By (User ID)" type="number" size="small"
              value={record.HandleById || user?.Id || ''}
              onChange={handleRecordChange('HandleById')} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="Sales Name (User ID)" type="number" size="small"
              value={record.SalesName || user?.Id || ''}
              onChange={handleRecordChange('SalesName')} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Remarks" multiline rows={2} size="small"
              value={record.Remarks} onChange={handleRecordChange('Remarks')} />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="contained" startIcon={<SaveIcon />}
                onClick={handleSaveRecord} disabled={savingRecord || savedRecord}>
                {savingRecord ? 'Saving...' : 'Save Record'}
              </Button>
              {savedRecord && (
                <Button variant="outlined" onClick={() => {
                  setSavedRecord(null)
                  setProducts([])
                  setChildrenMap({})
                  setRecord({ ...emptyRecord })
                }}>
                  Reset
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* ───── Products Section ───── */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">2. Product Quotes</Typography>
          <Button variant="contained" startIcon={<AddIcon />}
            onClick={openNewProduct} disabled={!savedRecord}>
            Add Product
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {!savedRecord ? (
          <Alert severity="info">Save a record first to add products.</Alert>
        ) : products.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2 }}>No products yet. Click "Add Product".</Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" />
                  <TableCell>Product Type</TableCell>
                  <TableCell>Type Design</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>FS Number</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Body Material</TableCell>
                  <TableCell>Total Price</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((prod) => (
                  <>
                    <TableRow key={prod.Id} hover
                      selected={selectedProductId === prod.Id}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedProductId(prod.Id)
                        if (!childrenMap[prod.Id]) loadChildren(prod.Id)
                      }}>
                      <TableCell padding="checkbox">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleExpandProduct(prod.Id) }}>
                          {expandedProduct === prod.Id ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>{prod.ProductType}</TableCell>
                      <TableCell>{prod.TypeDesign}</TableCell>
                      <TableCell>{prod.Rating}</TableCell>
                      <TableCell>{prod.FSNumber}</TableCell>
                      <TableCell>{prod.Size}</TableCell>
                      <TableCell>{prod.BodyMaterial}</TableCell>
                      <TableCell>{prod.TotalPriceNetUnit?.toLocaleString()}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit"><IconButton size="small" onClick={(e) => { e.stopPropagation(); openEditProduct(prod) }}><EditIcon /></IconButton></Tooltip>
                        <Tooltip title="Delete"><IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDeleteProduct(prod.Id) }}><DeleteIcon /></IconButton></Tooltip>
                        <Button size="small" startIcon={<AddIcon />} onClick={(e) => { e.stopPropagation(); openNewChild(prod.Id); setSelectedProductId(prod.Id) }}>
                          Child
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
                        <Collapse in={expandedProduct === prod.Id} timeout="auto" unmountOnExit>
                          <Box sx={{ m: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Child Items
                            </Typography>
                            {(childrenMap[prod.Id] || []).length === 0 ? (
                              <Typography variant="body2" color="text.secondary">No child items</Typography>
                            ) : (
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>FS Number</TableCell>
                                    <TableCell>Total Price</TableCell>
                                    <TableCell>Option Extra</TableCell>
                                    <TableCell>Transfer</TableCell>
                                    <TableCell>List Price</TableCell>
                                    <TableCell>Eng Hours</TableCell>
                                    <TableCell>Eng Charges</TableCell>
                                    <TableCell>Reply Date</TableCell>
                                    <TableCell>On Time</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {(childrenMap[prod.Id] || []).map((child) => (
                                    <TableRow key={child.Id}>
                                      <TableCell>{child.FSNumber}</TableCell>
                                      <TableCell>{child.TotalPriceNetUnit?.toLocaleString()}</TableCell>
                                      <TableCell>{child.OptionNetPriceExtraPerUnit?.toLocaleString()}</TableCell>
                                      <TableCell>{child.QuoteTransferPerUnit?.toLocaleString()}</TableCell>
                                      <TableCell>{child.QuotePriceListPerUnit?.toLocaleString()}</TableCell>
                                      <TableCell>{child.EngineeringHours}</TableCell>
                                      <TableCell>{child.EngineeringCharges?.toLocaleString()}</TableCell>
                                      <TableCell>{child.ReplyDate ? new Date(child.ReplyDate).toLocaleDateString() : '-'}</TableCell>
                                      <TableCell>{child.OnTime ? 'Yes' : 'No'}</TableCell>
                                      <TableCell align="right">
                                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEditChild(child)}><EditIcon /></IconButton></Tooltip>
                                        <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDeleteChild(child.Id, prod.Id)}><DeleteIcon /></IconButton></Tooltip>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* ───── Children Section ───── */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">3. Child Items</Typography>
          <Button variant="contained" startIcon={<AddIcon />}
            onClick={() => { if (selectedProductId) openNewChild(selectedProductId) }}
            disabled={!savedRecord || !selectedProductId}>
            Add Child
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {!savedRecord ? (
          <Alert severity="info">Save a record first to manage child items.</Alert>
        ) : products.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2 }}>Add a product first.</Typography>
        ) : (
          <>
            <TextField select fullWidth label="Select Parent Product" size="small"
              value={selectedProductId || ''}
              onChange={(e) => {
                const pid = Number(e.target.value)
                setSelectedProductId(pid)
                if (!childrenMap[pid]) loadChildren(pid)
              }}
              sx={{ mb: 2 }}>
              {products.map((p) => (
                <MenuItem key={p.Id} value={p.Id}>
                  [{p.FSNumber}] {p.ProductType} - {p.TypeDesign} ({p.Size})
                </MenuItem>
              ))}
            </TextField>

            {!selectedProductId ? (
              <Alert severity="info">Select a parent product above to manage its child items.</Alert>
            ) : (childrenMap[selectedProductId] || []).length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 2 }}>No child items for this product.</Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>FS Number</TableCell>
                      <TableCell>Product Type</TableCell>
                      <TableCell>Type Design</TableCell>
                      <TableCell>Rating</TableCell>
                      <TableCell>Size</TableCell>
                      <TableCell>Total Price</TableCell>
                      <TableCell>List Price</TableCell>
                      <TableCell>Reply Date</TableCell>
                      <TableCell>On Time</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(childrenMap[selectedProductId] || []).map((child) => (
                      <TableRow key={child.Id}>
                        <TableCell>{child.FSNumber}</TableCell>
                        <TableCell>{child.ProductType}</TableCell>
                        <TableCell>{child.TypeDesign}</TableCell>
                        <TableCell>{child.Rating}</TableCell>
                        <TableCell>{child.Size}</TableCell>
                        <TableCell>{child.TotalPriceNetUnit?.toLocaleString()}</TableCell>
                        <TableCell>{child.QuotePriceListPerUnit?.toLocaleString()}</TableCell>
                        <TableCell>{child.ReplyDate ? new Date(child.ReplyDate).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{child.OnTime ? 'Yes' : 'No'}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit"><IconButton size="small" onClick={() => openEditChild(child)}><EditIcon /></IconButton></Tooltip>
                          <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDeleteChild(child.Id, selectedProductId)}><DeleteIcon /></IconButton></Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </Paper>

      {/* ───── Product Dialog ───── */}
      <Dialog open={productDialog} onClose={() => setProductDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Product Type" select value={productForm.ProductType}
                onChange={handleProductTypeChange} size="small" required>
                {productTypes.map((t) => (
                  <MenuItem key={t.id} value={t.name}>{t.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Type Design" select value={productForm.TypeDesign}
                onChange={handleProductChange('TypeDesign')} size="small" required
                disabled={!productForm.ProductType}>
                {typeDesigns.map((t) => (
                  <MenuItem key={t.id} value={t.name}>{t.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={4}><TextField fullWidth label="Rating" size="small" required value={productForm.Rating} onChange={handleProductChange('Rating')} /></Grid>
            <Grid item xs={6} sm={4}>
              <Autocomplete freeSolo options={designCodes.map((d) => d.name)}
                value={productForm.RaisteamDesignCode}
                onInputChange={(e, val) => setProductForm((prev) => ({ ...prev, RaisteamDesignCode: val }))}
                renderInput={(params) => (
                  <TextField {...params} label="Raisteam Design Code" size="small" required />
                )}
              />
            </Grid>
            <Grid item xs={6} sm={4}><TextField fullWidth label="End Connection" size="small" required value={productForm.EndConnection} onChange={handleProductChange('EndConnection')} /></Grid>
            <Grid item xs={6} sm={4}><TextField fullWidth label="Size" size="small" required value={productForm.Size} onChange={handleProductChange('Size')} /></Grid>
            <Grid item xs={6} sm={4}><TextField fullWidth label="Body Material" size="small" required value={productForm.BodyMaterial} onChange={handleProductChange('BodyMaterial')} /></Grid>
            <Grid item xs={6} sm={4}><TextField fullWidth label="Engineering ID" size="small" required value={productForm.EngineeringID} onChange={handleProductChange('EngineeringID')} /></Grid>
            <Grid item xs={6} sm={4}><TextField fullWidth label="Assembly/Option" size="small" required value={productForm.AssemblyOption} onChange={handleProductChange('AssemblyOption')} /></Grid>
            <Grid item xs={6} sm={4}><TextField fullWidth label="Trim Type" size="small" value={productForm.TrimType || ''} onChange={handleProductChange('TrimType')} /></Grid>
            <Grid item xs={6} sm={4}><TextField fullWidth label="FS Number" size="small" required value={productForm.FSNumber} onChange={handleProductChange('FSNumber')} /></Grid>
            <Grid item xs={6} sm={4}><TextField fullWidth label="PSC" size="small" value={productForm.PSC || ''} onChange={handleProductChange('PSC')} /></Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth label="Total Price (Net)" type="number" size="small" value={productForm.TotalPriceNetUnit} onChange={handleProductChange('TotalPriceNetUnit')} /></Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth label="Option Extra" type="number" size="small" value={productForm.OptionNetPriceExtraPerUnit} onChange={handleProductChange('OptionNetPriceExtraPerUnit')} /></Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth label="Transfer" type="number" size="small" value={productForm.QuoteTransferPerUnit} onChange={handleProductChange('QuoteTransferPerUnit')} /></Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth label="Transfer Extra" type="number" size="small" value={productForm.TransferPriceExtra} onChange={handleProductChange('TransferPriceExtra')} /></Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth label="List Price" type="number" size="small" value={productForm.QuotePriceListPerUnit} onChange={handleProductChange('QuotePriceListPerUnit')} /></Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth label="List Extra" type="number" size="small" value={productForm.ListPriceExtra} onChange={handleProductChange('ListPriceExtra')} /></Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth label="Eng Hours" type="number" size="small" value={productForm.EngineeringHours ?? ''} onChange={handleProductChange('EngineeringHours')} /></Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth label="Eng Charges" type="number" size="small" value={productForm.EngineeringCharges} onChange={handleProductChange('EngineeringCharges')} /></Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth label="Pattern Charges" type="number" size="small" value={productForm.PatternCharges} onChange={handleProductChange('PatternCharges')} /></Grid>
            <Grid item xs={6} sm={4}><TextField fullWidth label="Spec Finalized Date" type="datetime-local" size="small" required value={productForm.SpecFinalizedDate} onChange={handleProductChange('SpecFinalizedDate')} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={6} sm={4}><TextField fullWidth label="Reply Date" type="datetime-local" size="small" required value={productForm.ReplyDate} onChange={handleProductChange('ReplyDate')} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={6} sm={4}><TextField fullWidth label="Original Due Date" type="datetime-local" size="small" required value={productForm.OriginalDueDate} onChange={handleProductChange('OriginalDueDate')} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth label="Item Serial Number" size="small" value={productForm.ItemSerialNumber || ''} onChange={handleProductChange('ItemSerialNumber')} /></Grid>
            <Grid item xs={6} sm={4}><TextField fullWidth label="NoOfDate Taken From DatedIn" type="number" size="small" value={productForm.NoOfDateTakenFromDatedIn} onChange={handleProductChange('NoOfDateTakenFromDatedIn')} /></Grid>
            <Grid item xs={6} sm={4}><TextField fullWidth label="NoOfDate Taken From SpecFinalized" type="number" size="small" value={productForm.NoOfDateTakenFromSpecFinalizedDate} onChange={handleProductChange('NoOfDateTakenFromSpecFinalizedDate')} /></Grid>
            <Grid item xs={6} sm={3}>
              <TextField select fullWidth label="On Time" size="small" value={productForm.OnTime} onChange={handleProductChange('OnTime')}>
                <MenuItem value={true}>Yes</MenuItem>
                <MenuItem value={false}>No</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth label="Right In First Time" size="small" value={productForm.RightInFirstTime ?? ''} onChange={handleProductChange('RightInFirstTime')} /></Grid>
            <Grid item xs={6} sm={3}>
              <TextField select fullWidth label="RSDL" size="small"
                value={productForm.RSDL === null ? '' : String(productForm.RSDL)}
                onChange={(e) => {
                  const v = e.target.value
                  setProductForm((prev) => ({ ...prev, RSDL: v === '' ? null : v === 'true' }))
                }}>
                <MenuItem value="">N/A</MenuItem>
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField select fullWidth label="Next Day Response" size="small" value={productForm.NextDayResponse} onChange={handleProductChange('NextDayResponse')}>
                <MenuItem value={true}>Yes</MenuItem>
                <MenuItem value={false}>No</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveProduct} disabled={savingProduct}>
            {savingProduct ? 'Saving...' : (editingProduct ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ───── Child Dialog ───── */}
      <Dialog open={childDialog} onClose={() => setChildDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingChild ? 'Edit Child Item' : 'Add Child Item'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={6} sm={4}><TextField fullWidth label="Product Type" size="small" value={childForm.ProductType} onChange={handleChildChange('ProductType')} /></Grid>
            <Grid item xs={6} sm={4}><TextField fullWidth label="Type Design" size="small" value={childForm.TypeDesign} onChange={handleChildChange('TypeDesign')} /></Grid>
            <Grid item xs={6} sm={4}><TextField fullWidth label="Rating" size="small" value={childForm.Rating} onChange={handleChildChange('Rating')} /></Grid>
            <Grid item xs={6} sm={4}>
              <Autocomplete freeSolo options={designCodes.map((d) => d.name)}
                value={childForm.RaisteamDesignCode}
                onInputChange={(e, val) => setChildForm((prev) => ({ ...prev, RaisteamDesignCode: val }))}
                renderInput={(params) => (
                  <TextField {...params} label="Raisteam Design Code" size="small" />
                )}
              />
            </Grid>
            <Grid item xs={6} sm={4}><TextField fullWidth label="End Connection" size="small" value={childForm.EndConnection} onChange={handleChildChange('EndConnection')} /></Grid>
            <Grid item xs={6} sm={4}><TextField fullWidth label="Size" size="small" value={childForm.Size} onChange={handleChildChange('Size')} /></Grid>
            <Grid item xs={6} sm={4}><TextField fullWidth label="Body Material" size="small" value={childForm.BodyMaterial} onChange={handleChildChange('BodyMaterial')} /></Grid>
            <Grid item xs={6} sm={4}><TextField fullWidth label="Engineering ID" size="small" value={childForm.EngineeringID} onChange={handleChildChange('EngineeringID')} /></Grid>
            <Grid item xs={6} sm={4}><TextField fullWidth label="Assembly/Option" size="small" value={childForm.AssemblyOption} onChange={handleChildChange('AssemblyOption')} /></Grid>
            <Grid item xs={6} sm={4}><TextField fullWidth label="Trim Type" size="small" value={childForm.TrimType || ''} onChange={handleChildChange('TrimType')} /></Grid>
            <Grid item xs={6} sm={4}><TextField fullWidth label="FS Number" size="small" value={childForm.FSNumber} onChange={handleChildChange('FSNumber')} /></Grid>
            <Grid item xs={6} sm={4}><TextField fullWidth label="PSC" size="small" value={childForm.PSC || ''} onChange={handleChildChange('PSC')} /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth label="Item Serial Number" size="small" value={childForm.ItemSerialNumber || ''} onChange={handleChildChange('ItemSerialNumber')} /></Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth label="Total Price" type="number" size="small" value={childForm.TotalPriceNetUnit} onChange={handleChildChange('TotalPriceNetUnit')} /></Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth label="Option Extra" type="number" size="small" value={childForm.OptionNetPriceExtraPerUnit} onChange={handleChildChange('OptionNetPriceExtraPerUnit')} /></Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth label="Transfer" type="number" size="small" value={childForm.QuoteTransferPerUnit} onChange={handleChildChange('QuoteTransferPerUnit')} /></Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth label="Transfer Extra" type="number" size="small" value={childForm.TransferPriceExtra} onChange={handleChildChange('TransferPriceExtra')} /></Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth label="List Price" type="number" size="small" value={childForm.QuotePriceListPerUnit} onChange={handleChildChange('QuotePriceListPerUnit')} /></Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth label="List Extra" type="number" size="small" value={childForm.ListPriceExtra} onChange={handleChildChange('ListPriceExtra')} /></Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth label="Eng Hours" type="number" size="small" value={childForm.EngineeringHours ?? ''} onChange={handleChildChange('EngineeringHours')} /></Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth label="Eng Charges" type="number" size="small" value={childForm.EngineeringCharges} onChange={handleChildChange('EngineeringCharges')} /></Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth label="Pattern Charges" type="number" size="small" value={childForm.PatternCharges} onChange={handleChildChange('PatternCharges')} /></Grid>
            <Grid item xs={6} sm={4}><TextField fullWidth label="Spec Finalized Date" type="datetime-local" size="small" value={childForm.SpecFinalizedDate} onChange={handleChildChange('SpecFinalizedDate')} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={6} sm={4}><TextField fullWidth label="Reply Date" type="datetime-local" size="small" value={childForm.ReplyDate} onChange={handleChildChange('ReplyDate')} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={6} sm={4}><TextField fullWidth label="Original Due Date" type="datetime-local" size="small" value={childForm.OriginalDueDate} onChange={handleChildChange('OriginalDueDate')} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth label="NoOfDateTaken From DatedIn" type="number" size="small" value={childForm.NoOfDateTakenFromDatedIn} onChange={handleChildChange('NoOfDateTakenFromDatedIn')} /></Grid>
            <Grid item xs={6} sm={4}><TextField fullWidth label="NoOfDateTaken From SpecFinalized" type="number" size="small" value={childForm.NoOfDateTakenFromSpecFinalizedDate} onChange={handleChildChange('NoOfDateTakenFromSpecFinalizedDate')} /></Grid>
            <Grid item xs={6} sm={2}>
              <TextField select fullWidth label="On Time" size="small" value={childForm.OnTime} onChange={handleChildChange('OnTime')}>
                <MenuItem value={true}>Yes</MenuItem>
                <MenuItem value={false}>No</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth label="Right In First Time" size="small" value={childForm.RightInFirstTime ?? ''} onChange={handleChildChange('RightInFirstTime')} /></Grid>
            <Grid item xs={6} sm={2}>
              <TextField select fullWidth label="RSDL" size="small"
                value={childForm.RSDL === null ? '' : String(childForm.RSDL)}
                onChange={(e) => {
                  const v = e.target.value
                  setChildForm((prev) => ({ ...prev, RSDL: v === '' ? null : v === 'true' }))
                }}>
                <MenuItem value="">N/A</MenuItem>
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6} sm={2}>
              <TextField select fullWidth label="Next Day Response" size="small" value={childForm.NextDayResponse} onChange={handleChildChange('NextDayResponse')}>
                <MenuItem value={true}>Yes</MenuItem>
                <MenuItem value={false}>No</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChildDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveChild} disabled={savingChild}>
            {savingChild ? 'Saving...' : (editingChild ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ───── Search Dialog ───── */}
      <Dialog open={searchOpen} onClose={() => { setSearchOpen(false); setSearchResult(null); setSearchError('') }}
        maxWidth="lg" fullWidth>
        <DialogTitle>Search Quote by QuoteReference</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, mt: 1 }}>
            <TextField fullWidth label="Quote Reference" size="small"
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value)}
              placeholder="e.g. QT250001"
              onKeyDown={(e) => { if (e.key === 'Enter') document.getElementById('search-btn').click() }} />
            <Button id="search-btn" variant="contained" startIcon={<SearchIcon />}
              disabled={searchLoading || !searchRef.trim()}
              onClick={async () => {
                setSearchLoading(true)
                setSearchError('')
                setSearchResult(null)
                try {
                  const res = await createApi.getRecord(searchRef.trim())
                  setSearchResult(res.data)
                } catch (err) {
                  setSearchError(err.response?.data?.detail || 'Quote not found')
                } finally {
                  setSearchLoading(false)
                }
              }}>
              Search
            </Button>
          </Box>

          {searchLoading && <LinearProgress sx={{ mb: 2 }} />}
          {searchError && <Alert severity="error" sx={{ mb: 2 }}>{searchError}</Alert>}

          {searchResult && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Record: {searchResult.record.QuoteReference}
                <Chip label={searchResult.record.Category} size="small" sx={{ ml: 1 }} />
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {searchResult.record.BuyerCustomer} → {searchResult.record.EndUser}
              </Typography>

              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Products ({searchResult.products.length})</Typography>
              {searchResult.products.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No products</Typography>
              ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>FS Number</TableCell>
                        <TableCell>Product Type</TableCell>
                        <TableCell>Type Design</TableCell>
                        <TableCell>Size</TableCell>
                        <TableCell>Rating</TableCell>
                        <TableCell>Total Price</TableCell>
                        <TableCell>ChildItem</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {searchResult.products.map((p) => (
                        <TableRow key={p.Id}>
                          <TableCell>{p.FSNumber}</TableCell>
                          <TableCell>{p.ProductType}</TableCell>
                          <TableCell>{p.TypeDesign}</TableCell>
                          <TableCell>{p.Size}</TableCell>
                          <TableCell>{p.Rating}</TableCell>
                          <TableCell>{p.TotalPriceNetUnit?.toLocaleString()}</TableCell>
                          <TableCell>{p.ChildItem}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              <Typography variant="subtitle2" sx={{ mb: 1 }}>Children ({searchResult.children.length})</Typography>
              {searchResult.children.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No children</Typography>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>FS Number</TableCell>
                        <TableCell>Product Type</TableCell>
                        <TableCell>Size</TableCell>
                        <TableCell>Total Price</TableCell>
                        <TableCell>List Price</TableCell>
                        <TableCell>On Time</TableCell>
                        <TableCell>ChildItem</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {searchResult.children.map((c) => (
                        <TableRow key={c.Id}>
                          <TableCell>{c.FSNumber}</TableCell>
                          <TableCell>{c.ProductType}</TableCell>
                          <TableCell>{c.Size}</TableCell>
                          <TableCell>{c.TotalPriceNetUnit?.toLocaleString()}</TableCell>
                          <TableCell>{c.QuotePriceListPerUnit?.toLocaleString()}</TableCell>
                          <TableCell>{c.OnTime ? 'Yes' : 'No'}</TableCell>
                          <TableCell>{c.ChildItem}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setSearchOpen(false); setSearchResult(null); setSearchError('') }}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}
        message={snack.msg} />
    </Box>
  )
}
