import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Stack, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from '../../api/axios';

interface Supplier {
  _id: string;
  name: string;
  contactInfo: {
    email?: string;
    phone?: string;
    address?: string;
  };
  reliability?: number;
  performance?: number;
}

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'email', headerName: 'Email', flex: 1, valueGetter: (params: any) => params.row?.contactInfo?.email ?? '' },
  { field: 'phone', headerName: 'Phone', flex: 1, valueGetter: (params: any) => params.row?.contactInfo?.phone ?? '' },
  { field: 'reliability', headerName: 'Reliability', flex: 1 },
  { field: 'performance', headerName: 'Performance', flex: 1 },
  {
    field: 'actions',
    headerName: 'Actions',
    sortable: false,
    filterable: false,
    renderCell: (params: any) => (
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

// function handleEditOpen(supplier: Supplier) {}
// function handleDeleteOpen(id: string) {}

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  // Add state
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    reliability: '',
    performance: '',
  });
  const [addError, setAddError] = useState('');
  // Edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    _id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    reliability: '',
    performance: '',
  });
  const [editError, setEditError] = useState('');
  // Delete state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.name = search;
      if (email) params.email = email;
      if (phone) params.phone = phone;
      const res = await axios.get('/suppliers', { params });
      setSuppliers(res.data);
    } catch (err) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    // eslint-disable-next-line
  }, [search, email, phone]);

  // Add
  const handleAddOpen = () => {
    setAddForm({ name: '', email: '', phone: '', address: '', reliability: '', performance: '' });
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
      await axios.post('/suppliers', {
        name: addForm.name,
        contactInfo: {
          email: addForm.email,
          phone: addForm.phone,
          address: addForm.address,
        },
        reliability: Number(addForm.reliability),
        performance: Number(addForm.performance),
      });
      handleAddClose();
      fetchSuppliers();
    } catch (err: any) {
      setAddError(err.response?.data?.message || 'Failed to add supplier');
    }
  };

  // Edit
  const _handleEditOpen = (supplier: Supplier) => {
    setEditForm({
      _id: supplier._id,
      name: supplier.name,
      email: supplier.contactInfo?.email || '',
      phone: supplier.contactInfo?.phone || '',
      address: supplier.contactInfo?.address || '',
      reliability: String(supplier.reliability ?? ''),
      performance: String(supplier.performance ?? ''),
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
      await axios.put(`/suppliers/${editForm._id}`, {
        name: editForm.name,
        contactInfo: {
          email: editForm.email,
          phone: editForm.phone,
          address: editForm.address,
        },
        reliability: Number(editForm.reliability),
        performance: Number(editForm.performance),
      });
      handleEditClose();
      fetchSuppliers();
    } catch (err: any) {
      setEditError(err.response?.data?.message || 'Failed to update supplier');
    }
  };

  // Delete
  const _handleDeleteOpen = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };
  const handleDeleteClose = () => setDeleteOpen(false);
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`/suppliers/${deleteId}`);
      setDeleteOpen(false);
      setDeleteId(null);
      fetchSuppliers();
    } catch (err) {
      // handle error
    }
  };

  // Patch the columns to use the correct handlers
  columns[5].renderCell = (params: any) => (
    <>
      <IconButton color="primary" onClick={() => _handleEditOpen(params.row)} size="small">
        <EditIcon />
      </IconButton>
      <IconButton color="error" onClick={() => _handleDeleteOpen(params.row._id)} size="small">
        <DeleteIcon />
      </IconButton>
    </>
  );

  return (
    <Box>
      <Typography variant="h5" mb={2}>Suppliers Management</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
          <TextField label="Search Name" placeholder="Type supplier name..." value={search} onChange={e => setSearch(e.target.value)} size="small" />
          <TextField label="Email" placeholder="Type email..." value={email} onChange={e => setEmail(e.target.value)} size="small" />
          <TextField label="Phone" placeholder="Type phone..." value={phone} onChange={e => setPhone(e.target.value)} size="small" />
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddOpen}>Add Supplier</Button>
          <Button variant="outlined" onClick={() => { setSearch(''); setEmail(''); setPhone(''); }}>Clear Filters</Button>
        </Stack>
        <div style={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={suppliers.map(s => ({ ...s, id: s._id }))}
            columns={columns}
            pagination
            pageSizeOptions={[10, 20, 50]}
            paginationModel={{ pageSize: 10, page: 0 }}
            loading={loading}
            disableRowSelectionOnClick
          />
        </div>
      </Paper>
      {/* Add Supplier Dialog */}
      <Dialog open={addOpen} onClose={handleAddClose} maxWidth="xs" fullWidth>
        <DialogTitle>Add New Supplier</DialogTitle>
        <form onSubmit={handleAddSubmit}>
          <DialogContent>
            <Stack spacing={2}>
              <TextField label="Name" name="name" value={addForm.name} onChange={handleAddChange} required fullWidth />
              <TextField label="Email" name="email" value={addForm.email} onChange={handleAddChange} fullWidth />
              <TextField label="Phone" name="phone" value={addForm.phone} onChange={handleAddChange} fullWidth />
              <TextField label="Address" name="address" value={addForm.address} onChange={handleAddChange} fullWidth />
              <TextField label="Reliability" name="reliability" value={addForm.reliability} onChange={handleAddChange} type="number" fullWidth />
              <TextField label="Performance" name="performance" value={addForm.performance} onChange={handleAddChange} type="number" fullWidth />
              {addError && <Typography color="error">{addError}</Typography>}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAddClose}>Cancel</Button>
            <Button type="submit" variant="contained">Add</Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* Edit Supplier Dialog */}
      <Dialog open={editOpen} onClose={handleEditClose} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Supplier</DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent>
            <Stack spacing={2}>
              <TextField label="Name" name="name" value={editForm.name} onChange={handleEditChange} required fullWidth />
              <TextField label="Email" name="email" value={editForm.email} onChange={handleEditChange} fullWidth />
              <TextField label="Phone" name="phone" value={editForm.phone} onChange={handleEditChange} fullWidth />
              <TextField label="Address" name="address" value={editForm.address} onChange={handleEditChange} fullWidth />
              <TextField label="Reliability" name="reliability" value={editForm.reliability} onChange={handleEditChange} type="number" fullWidth />
              <TextField label="Performance" name="performance" value={editForm.performance} onChange={handleEditChange} type="number" fullWidth />
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
        <DialogTitle>Delete Supplier</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this supplier?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Suppliers; 
