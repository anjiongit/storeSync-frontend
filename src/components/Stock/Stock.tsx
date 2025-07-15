import React, { useEffect, useState } from 'react';
import {
  Box, Button, TextField, Typography, Paper, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import axios from '../../api/axios';

interface StockMovement {
  _id: string;
  item: { _id: string; name: string; sku: string };
  type: 'inbound' | 'outbound';
  quantity: number;
  date: string;
  user?: { name: string };
  supplier?: { name: string };
  note?: string;
}

const columns: GridColDef[] = [
  {
    field: 'date',
    headerName: 'Date',
    flex: 1,
    valueGetter: (params: any) => {
      const date = params.row?.date;
      return date ? new Date(date).toLocaleString() : '';
    },
  },
  { field: 'type', headerName: 'Type', flex: 1 },
  {
    field: 'item',
    headerName: 'Item',
    flex: 1,
    valueGetter: (params: any) => params.row?.item?.name ?? 'N/A',
  },
  {
    field: 'sku',
    headerName: 'SKU',
    flex: 1,
    valueGetter: (params: any) => params.row?.item?.sku ?? 'N/A',
  },
  { field: 'quantity', headerName: 'Quantity', flex: 1 },
  {
    field: 'user',
    headerName: 'User',
    flex: 1,
    valueGetter: (params: any) => params.row?.user?.name ?? '',
  },
  {
    field: 'supplier',
    headerName: 'Supplier',
    flex: 1,
    valueGetter: (params: any) => params.row?.supplier?.name ?? '',
  },
  { field: 'note', headerName: 'Note', flex: 1 },
];

const Stock: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState('');
  const [type, setType] = useState('');
  const [user, setUser] = useState('');
  const [supplier, setSupplier] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [addType, setAddType] = useState<'inbound' | 'outbound'>('inbound');
  const [addForm, setAddForm] = useState({
    item: '',
    quantity: '',
    supplier: '',
    note: '',
  });
  const [addError, setAddError] = useState('');
  const [itemsList, setItemsList] = useState<any[]>([]);
  const [suppliersList, setSuppliersList] = useState<any[]>([]);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (item) params.item = item;
      if (type) params.type = type;
      if (user) params.user = user;
      if (supplier) params.supplier = supplier;

      const res = await axios.get('/stock', { params });
      setMovements(res.data);
    } catch (err) {
      console.error("Error fetching movements:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchItemsAndSuppliers = async () => {
    try {
      const [itemsRes, suppliersRes] = await Promise.all([
        axios.get('/items'),
        axios.get('/suppliers'),
      ]);
      setItemsList(itemsRes.data);
      setSuppliersList(suppliersRes.data);
    } catch (err) {
      console.error("Error fetching items/suppliers:", err);
    }
  };

  useEffect(() => {
    fetchMovements();
    // eslint-disable-next-line
  }, [item, type, user, supplier]);

  useEffect(() => {
    fetchItemsAndSuppliers();
  }, []);

  const handleAddOpen = (movementType: 'inbound' | 'outbound') => {
    setAddType(movementType);
    setAddForm({ item: '', quantity: '', supplier: '', note: '' });
    setAddError('');
    setAddOpen(true);
  };

  const handleAddClose = () => setAddOpen(false);

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    try {
      const payload: any = {
        item: addForm.item,
        quantity: Number(addForm.quantity),
        note: addForm.note,
      };
      if (addType === 'inbound') payload.supplier = addForm.supplier;
      await axios.post(`/stock/${addType}`, payload);
      handleAddClose();
      fetchMovements();
    } catch (err: any) {
      setAddError(err.response?.data?.message || 'Failed to record movement');
    }
  };

  return (
    <Box>
      <Typography variant="h5" mb={2}>Stock Movements</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
          <TextField label="Item Name" placeholder="Type item name..." value={item} onChange={e => setItem(e.target.value)} size="small" />
          <TextField label="Type" select value={type} onChange={e => setType(e.target.value)} size="small" sx={{ minWidth: 120 }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="inbound">Inbound</MenuItem>
            <MenuItem value="outbound">Outbound</MenuItem>
          </TextField>
          <TextField label="User" placeholder="Type user name..." value={user} onChange={e => setUser(e.target.value)} size="small" />
          <TextField label="Supplier" placeholder="Type supplier name..." value={supplier} onChange={e => setSupplier(e.target.value)} size="small" />
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleAddOpen('inbound')}>Record Inbound</Button>
          <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => handleAddOpen('outbound')}>Record Outbound</Button>
          <Button variant="outlined" onClick={() => { setItem(''); setType(''); setUser(''); setSupplier(''); }}>Clear Filters</Button>
        </Stack>
        <div style={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={Array.isArray(movements)
              ? movements
                  .filter(m => m && typeof m === 'object' && m._id && m.type && m.item && typeof m.item === 'object')
                  .map(m => ({
                    id: m._id,
                    date: m.date || '',
                    type: m.type || '',
                    item: m.item && typeof m.item === 'object' ? m.item : { name: 'N/A', sku: 'N/A' },
                    sku: m.item && typeof m.item === 'object' && m.item.sku ? m.item.sku : 'N/A',
                    quantity: typeof m.quantity === 'number' ? m.quantity : 0,
                    user: m.user && typeof m.user === 'object' ? m.user : { name: '' },
                    supplier: m.supplier && typeof m.supplier === 'object' ? m.supplier : { name: '' },
                    note: m.note || '',
                  }))
              : []}
            columns={columns}
            pagination
            pageSizeOptions={[10, 20, 50]}
            paginationModel={{ pageSize: 10, page: 0 }}
            loading={loading}
            disableRowSelectionOnClick
          />
        </div>
      </Paper>

      {/* Add Movement Dialog */}
      <Dialog open={addOpen} onClose={handleAddClose} maxWidth="xs" fullWidth>
        <DialogTitle>Record {addType === 'inbound' ? 'Inbound' : 'Outbound'} Movement</DialogTitle>
        <form onSubmit={handleAddSubmit}>
          <DialogContent>
            <Stack spacing={2}>
              <TextField
                label="Item"
                name="item"
                select
                value={addForm.item}
                onChange={handleAddChange}
                required
                fullWidth
              >
                {itemsList.map((item) => (
                  <MenuItem key={item._id} value={item._id}>{item.name} ({item.sku})</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Quantity"
                name="quantity"
                value={addForm.quantity}
                onChange={handleAddChange}
                required
                type="number"
                fullWidth
              />
              {addType === 'inbound' && (
                <TextField
                  label="Supplier"
                  name="supplier"
                  select
                  value={addForm.supplier}
                  onChange={handleAddChange}
                  fullWidth
                >
                  <MenuItem value="">None</MenuItem>
                  {suppliersList.map((s) => (
                    <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
                  ))}
                </TextField>
              )}
              <TextField
                label="Note"
                name="note"
                value={addForm.note}
                onChange={handleAddChange}
                fullWidth
              />
              {addError && <Typography color="error">{addError}</Typography>}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAddClose}>Cancel</Button>
            <Button type="submit" variant="contained">Record</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Stock;








