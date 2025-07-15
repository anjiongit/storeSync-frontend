import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Stack, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from '../../api/axios';

interface Item {
  _id: string;
  name: string;
  sku: string;
  quantity: number;
  location?: string;
  category?: string;
  supplier?: any;
  lowStockThreshold?: number;
}

const Items: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    sku: '',
    quantity: '',
    location: '',
    category: '',
    lowStockThreshold: '',
  });
  const [addError, setAddError] = useState('');
  // Edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    _id: '',
    name: '',
    sku: '',
    quantity: '',
    location: '',
    category: '',
    lowStockThreshold: '',
  });
  const [editError, setEditError] = useState('');
  // Delete state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.name = search;
      if (sku) params.sku = sku;
      if (category) params.category = category;
      const res = await axios.get('/items', { params });
      setItems(res.data);
    } catch (err) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line
  }, [search, sku, category]);

  // Add
  const handleAddOpen = () => {
    setAddForm({ name: '', sku: '', quantity: '', location: '', category: '', lowStockThreshold: '' });
    setAddError('');
    setAddOpen(true);
  };
  const handleAddClose = () => setAddOpen(false);
  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  };
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    try {
      await axios.post('/items', {
        name: addForm.name,
        sku: addForm.sku,
        quantity: Number(addForm.quantity),
        location: addForm.location,
        category: addForm.category,
        lowStockThreshold: Number(addForm.lowStockThreshold),
      });
      handleAddClose();
      fetchItems();
    } catch (err: any) {
      setAddError(err.response?.data?.message || 'Failed to add item');
    }
  };

  // Edit
  const handleEditOpen = (item: Item) => {
    setEditForm({
      _id: item._id,
      name: item.name,
      sku: item.sku,
      quantity: String(item.quantity),
      location: item.location || '',
      category: item.category || '',
      lowStockThreshold: String(item.lowStockThreshold ?? ''),
    });
    setEditError('');
    setEditOpen(true);
  };
  const handleEditClose = () => setEditOpen(false);
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    try {
      await axios.put(`/items/${editForm._id}`, {
        name: editForm.name,
        sku: editForm.sku,
        quantity: Number(editForm.quantity),
        location: editForm.location,
        category: editForm.category,
        lowStockThreshold: Number(editForm.lowStockThreshold),
      });
      handleEditClose();
      fetchItems();
    } catch (err: any) {
      setEditError(err.response?.data?.message || 'Failed to update item');
    }
  };

  // Delete
  const handleDeleteOpen = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };
  const handleDeleteClose = () => setDeleteOpen(false);
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`/items/${deleteId}`);
      setDeleteOpen(false);
      setDeleteId(null);
      fetchItems();
    } catch (err) {
      // handle error
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'sku', headerName: 'SKU', flex: 1 },
    { field: 'quantity', headerName: 'Quantity', flex: 1 },
    { field: 'location', headerName: 'Location', flex: 1 },
    { field: 'category', headerName: 'Category', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <>
          <IconButton color="primary" onClick={() => handleEditOpen(params.row)} size="small">
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDeleteOpen(params.row._id)} size="small">
            <DeleteIcon />
          </IconButton>
        </>
      ),
      flex: 1,
      minWidth: 120,
    },
  ];

  return (
    <Box>
      <Typography variant="h5" mb={2}>Items Management</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
          <TextField
            label="Search Name"
            placeholder="Type item name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            size="small"
          />
          <TextField
            label="SKU"
            placeholder="Type SKU number..."
            value={sku}
            onChange={e => setSku(e.target.value)}
            size="small"
          />
          <TextField
            label="Category"
            placeholder="Type category..."
            value={category}
            onChange={e => setCategory(e.target.value)}
            size="small"
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddOpen}>Add Item</Button>
          <Button variant="outlined" onClick={() => { setSearch(''); setSku(''); setCategory(''); }}>Clear Filters</Button>
        </Stack>
        <div style={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={items.map(item => ({ ...item, id: item._id }))}
            columns={columns}
            pagination
            pageSizeOptions={[10, 20, 50]}
            paginationModel={{ pageSize: 10, page: 0 }}
            loading={loading}
            disableRowSelectionOnClick
          />
        </div>
      </Paper>
      {/* Add Item Dialog */}
      <Dialog open={addOpen} onClose={handleAddClose} maxWidth="xs" fullWidth>
        <DialogTitle>Add New Item</DialogTitle>
        <form onSubmit={handleAddSubmit}>
          <DialogContent>
            <Stack spacing={2}>
              <TextField label="Name" name="name" value={addForm.name} onChange={handleAddChange} required fullWidth />
              <TextField label="SKU" name="sku" value={addForm.sku} onChange={handleAddChange} required fullWidth />
              <TextField label="Quantity" name="quantity" value={addForm.quantity} onChange={handleAddChange} required type="number" fullWidth />
              <TextField label="Location" name="location" value={addForm.location} onChange={handleAddChange} fullWidth />
              <TextField label="Category" name="category" value={addForm.category} onChange={handleAddChange} fullWidth />
              <TextField label="Low Stock Threshold" name="lowStockThreshold" value={addForm.lowStockThreshold} onChange={handleAddChange} type="number" fullWidth />
              {addError && <Typography color="error">{addError}</Typography>}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAddClose}>Cancel</Button>
            <Button type="submit" variant="contained">Add</Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* Edit Item Dialog */}
      <Dialog open={editOpen} onClose={handleEditClose} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Item</DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent>
            <Stack spacing={2}>
              <TextField label="Name" name="name" value={editForm.name} onChange={handleEditChange} required fullWidth />
              <TextField label="SKU" name="sku" value={editForm.sku} onChange={handleEditChange} required fullWidth />
              <TextField label="Quantity" name="quantity" value={editForm.quantity} onChange={handleEditChange} required type="number" fullWidth />
              <TextField label="Location" name="location" value={editForm.location} onChange={handleEditChange} fullWidth />
              <TextField label="Category" name="category" value={editForm.category} onChange={handleEditChange} fullWidth />
              <TextField label="Low Stock Threshold" name="lowStockThreshold" value={editForm.lowStockThreshold} onChange={handleEditChange} type="number" fullWidth />
              {editError && <Typography color="error">{editError}</Typography>}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onClose={handleDeleteClose} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Item</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this item?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Items; 