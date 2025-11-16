// frontend/src/layout/Layout.js
import React from 'react';
import { Box, CssBaseline, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

// Icônes
import DashboardIcon from '@mui/icons-material/Dashboard';
import StorageIcon from '@mui/icons-material/Storage';
import BackupTableIcon from '@mui/icons-material/BackupTable';
import HistoryIcon from '@mui/icons-material/History';

const drawerWidth = 240;

const navItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Cibles SGBD', icon: <StorageIcon />, path: '/targets' },
  { text: 'Plans', icon: <BackupTableIcon />, path: '/plans' },
  { text: 'Journaux', icon: <HistoryIcon />, path: '/journals' },
];

export default function Layout({ children }) {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* 1. L'AppBar va maintenant utiliser notre thème (fond blanc, bordure) */}
      <AppBar
        position="fixed"
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
        // On n'a plus besoin de 'elevation' ou 'color' ici, le thème s'en charge
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Outil de Sauvegarde (M1 ENI)
          </Typography>
        </Toolbar>
      </AppBar>
      
      {/* 2. La Sidebar (navigation à gauche) */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar />
        <List>
          {navItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton component={RouterLink} to={item.path}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      
      {/* 3. La zone de contenu */}
      <Box
        component="main"
        // Le thème mettra automatiquement le fond 'grey[100]'
        sx={{ flexGrow: 1, p: 3 }}
      >
        <Toolbar /> {/* Espace pour passer sous l'AppBar */}
        
        {/* 'children' est notre DashboardPage */}
        {children} 
      </Box>
    </Box>
  );
}