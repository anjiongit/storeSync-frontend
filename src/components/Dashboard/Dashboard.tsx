import React from 'react';
import { Box, Drawer, AppBar, Toolbar, List, ListItem, ListItemText, Typography, CssBaseline, useTheme, useMediaQuery, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import { Link as RouterLink, useNavigate, Outlet, Routes, Route } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Items from '../Items/Items';
import Suppliers from '../Suppliers/Suppliers';
import Stock from '../Stock/Stock';

const drawerWidth = 220;

const navItems = [
  { label: 'Items', path: '/dashboard/items' },
  { label: 'Suppliers', path: '/dashboard/suppliers' },
  { label: 'Stock', path: '/dashboard/stock' },
  { label: 'Alerts', path: '/dashboard/alerts' },
  { label: 'Analytics', path: '/dashboard/analytics' },
];

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            StockSync Dashboard
          </Typography>
          {user && (
            <>
              <IconButton color="inherit" onClick={handleMenu} size="large">
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                  <AccountCircleIcon />
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem disabled>
                  <Typography variant="subtitle1">{user.name}</Typography>
                </MenuItem>
                <MenuItem disabled>
                  <Typography variant="body2">Role: {user.role}</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {navItems.map((item) => (
              <ListItem key={item.label} component={RouterLink} to={item.path}>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          minHeight: '100vh',
          bgcolor: 'background.paper',
        }}
      >
        <Routes>
          <Route path="items" element={<Items />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="stock" element={<Stock />} />
          {/* Add more routes for alerts, analytics, etc. */}
          <Route index element={
            <>
              <Typography variant="h4" gutterBottom>
                Welcome to StockSync Dashboard
              </Typography>
              <Typography variant="body1" mt={2}>
                Select a section from the menu to get started.
              </Typography>
            </>
          } />
        </Routes>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Dashboard; 