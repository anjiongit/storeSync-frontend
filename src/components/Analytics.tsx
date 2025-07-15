import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Stack, Card, CardContent, CircularProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { BarChart, PieChart } from '@mui/x-charts';
import type { GridColDef } from '@mui/x-data-grid';
import type { BarChartProps, PieChartProps } from '@mui/x-charts';
import axios from '../api/axios';

const COLORS = ['#1976d2', '#388e3c', '#fbc02d', '#d32f2f', '#7b1fa2', '#0288d1', '#c2185b'];

interface ItemAnalytics {
  _id: string;
  name: string;
  sku: string;
  quantity: number;
  movements: number;
}
interface SupplierAnalytics {
  _id: string;
  name: string;
  reliability: number;
  totalSupplied: number;
}

const Analytics: React.FC = () => {
  const [totalStock, setTotalStock] = useState<number | null>(null);
  const [fastMoving, setFastMoving] = useState<ItemAnalytics[]>([]);
  const [slowMoving, setSlowMoving] = useState<ItemAnalytics[]>([]);
  const [reliableSuppliers, setReliableSuppliers] = useState<SupplierAnalytics[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const [totalRes, fastRes, slowRes, suppliersRes] = await Promise.all([
        axios.get('/analytics/total-stock'),
        axios.get('/analytics/fast-moving'),
        axios.get('/analytics/slow-moving'),
        axios.get('/analytics/reliable-suppliers'),
      ]);
      setTotalStock(totalRes.data?.totalStock ?? 0);
      setFastMoving(Array.isArray(fastRes.data) ? fastRes.data : []);
      setSlowMoving(Array.isArray(slowRes.data) ? slowRes.data : []);
      setReliableSuppliers(Array.isArray(suppliersRes.data) ? suppliersRes.data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const itemColumns: GridColDef[] = [
    { field: 'name', headerName: 'Item', flex: 1 },
    { field: 'sku', headerName: 'SKU', flex: 1 },
    { field: 'quantity', headerName: 'Quantity', flex: 1 },
    { field: 'movements', headerName: 'Movements', flex: 1 },
  ];

  const supplierColumns: GridColDef[] = [
    { field: 'name', headerName: 'Supplier', flex: 1 },
    { field: 'reliability', headerName: 'Reliability', flex: 1 },
    { field: 'totalSupplied', headerName: 'Total Supplied', flex: 1 },
  ];

  // Prepare chart data for MUI X Charts
  const fastBarChartProps: BarChartProps = {
    xAxis: [{ data: fastMoving.map(item => item.name), scaleType: 'band', label: 'Item' }],
    series: [{
      data: fastMoving.map(item => item.movements),
      label: 'Movements',
      color: '#1976d2',
    }],
    height: 250,
  };
  const slowBarChartProps: BarChartProps = {
    xAxis: [{ data: slowMoving.map(item => item.name), scaleType: 'band', label: 'Item' }],
    series: [{
      data: slowMoving.map(item => item.movements),
      label: 'Movements',
      color: '#d32f2f',
    }],
    height: 250,
  };
  const supplierPieChartProps: PieChartProps = {
    series: [{
      data: reliableSuppliers.map((s, i) => ({ id: s._id, value: s.reliability, label: s.name, color: COLORS[i % COLORS.length] })),
      innerRadius: 40,
      outerRadius: 80,
      paddingAngle: 2,
      cornerRadius: 4,
    }],
    height: 250,
  };

  return (
    <Box>
      <Typography variant="h5" mb={2}>Analytics</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        {loading ? (
          <Stack alignItems="center" justifyContent="center" sx={{ height: 300 }}>
            <CircularProgress />
          </Stack>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Typography variant="h6">Total Stock</Typography>
                <Typography variant="h4">{totalStock !== null ? totalStock : '-'}</Typography>
              </CardContent>
            </Card>
            <Typography variant="h6">Fast Moving Items</Typography>
            {fastMoving.length > 0 ? (
              <BarChart {...fastBarChartProps} />
            ) : (
              <Typography color="text.secondary">No fast moving items data.</Typography>
            )}
            <div style={{ height: 300, width: '100%' }}>
              <DataGrid
                rows={fastMoving.map((item) => ({ ...item, id: item._id }))}
                columns={itemColumns}
                initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                pageSizeOptions={[5, 10]}
                disableRowSelectionOnClick
              />
            </div>
            <Typography variant="h6">Slow Moving Items</Typography>
            {slowMoving.length > 0 ? (
              <BarChart {...slowBarChartProps} />
            ) : (
              <Typography color="text.secondary">No slow moving items data.</Typography>
            )}
            <div style={{ height: 300, width: '100%' }}>
              <DataGrid
                rows={slowMoving.map((item) => ({ ...item, id: item._id }))}
                columns={itemColumns}
                initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                pageSizeOptions={[5, 10]}
                disableRowSelectionOnClick
              />
            </div>
            <Typography variant="h6">Most Reliable Suppliers</Typography>
            {reliableSuppliers.length > 0 ? (
              <PieChart {...supplierPieChartProps} />
            ) : (
              <Typography color="text.secondary">No reliable suppliers data.</Typography>
            )}
            <div style={{ height: 300, width: '100%' }}>
              <DataGrid
                rows={reliableSuppliers.map((s) => ({ ...s, id: s._id }))}
                columns={supplierColumns}
                initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                pageSizeOptions={[5, 10]}
                disableRowSelectionOnClick
              />
            </div>
          </Stack>
        )}
      </Paper>
    </Box>
  );
};

export default Analytics; 