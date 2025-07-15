import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Stack, CircularProgress, TextField, IconButton, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import CheckIcon from '@mui/icons-material/Check';
import axios from '../api/axios';

interface Alert {
  _id: string;
  date: string;
  item?: { name: string };
  message: string;
  status: string;
}

const columnsBase: GridColDef[] = [
  {
    field: 'date',
    headerName: 'Date',
    flex: 1,
    valueGetter: (params: { row: Alert }) => params.row?.date ? new Date(params.row.date).toLocaleString() : '',
  },
  {
    field: 'item',
    headerName: 'Item',
    flex: 1,
    valueGetter: (params: { row: Alert }) => params.row?.item?.name || 'N/A',
  },
  { field: 'message', headerName: 'Message', flex: 2 },
  { field: 'status', headerName: 'Status', flex: 1 },
];

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAlerts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/alerts');
      setAlerts(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    setActionLoading(id);
    try {
      await axios.patch(`/alerts/${id}/read`);
      fetchAlerts();
    } catch (err) {
      setError('Failed to mark alert as read');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter alerts by search
  const filteredAlerts = alerts.filter(alert => {
    const searchLower = search.toLowerCase();
    return (
      alert.message.toLowerCase().includes(searchLower) ||
      (alert.item?.name?.toLowerCase().includes(searchLower) ?? false) ||
      alert.status.toLowerCase().includes(searchLower)
    );
  });

  // Add actions column
  const columns: GridColDef[] = [
    ...columnsBase,
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) =>
        params.row.status !== 'read' ? (
          <Tooltip title="Mark as Read">
            <span>
              <IconButton
                color="primary"
                size="small"
                onClick={() => handleMarkAsRead(params.row._id)}
                disabled={actionLoading === params.row._id}
              >
                <CheckIcon />
              </IconButton>
            </span>
          </Tooltip>
        ) : null,
      minWidth: 120,
    },
  ];

  return (
    <Box>
      <Typography variant="h5" mb={2}>Alerts</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
          <TextField
            label="Search"
            placeholder="Search alerts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            size="small"
            fullWidth
          />
        </Stack>
        {loading ? (
          <Stack alignItems="center" justifyContent="center" sx={{ height: 300 }}>
            <CircularProgress />
          </Stack>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : filteredAlerts.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
            {alerts.length === 0
              ? 'No alerts to display.'
              : 'No alerts match your search.'}
          </Typography>
        ) : (
          <div style={{ height: 500, width: '100%' }}>
            <DataGrid
              rows={filteredAlerts.map(alert => ({ ...alert, id: alert._id }))}
              columns={columns}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              pageSizeOptions={[10, 20, 50]}
              disableRowSelectionOnClick
            />
          </div>
        )}
      </Paper>
    </Box>
  );
};

export default Alerts; 