// frontend/src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  CircularProgress, // L'import est ici
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Stack,
  Snackbar 
} from '@mui/material';

// Icônes
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

const API_URL = 'http://localhost:3001';

// ... (const StatusChip = ...)
const StatusChip = ({ status }) => {
  let color = 'default';
  if (status === 'Succes') color = 'success';
  if (status === 'Echec') color = 'error';
  if (status === 'EnCours') color = 'warning';
  
  return <Chip label={status} color={color} size="small" />;
};


export default function DashboardPage() {
  const [plans, setPlans] = useState([]);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // ... (const fetchData = ...)
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [plansResponse, journalsResponse] = await Promise.all([
        fetch(`${API_URL}/api/plans`),
        fetch(`${API_URL}/api/journals`)
      ]);

      if (!plansResponse.ok) throw new Error(`Erreur HTTP pour les plans: ${plansResponse.status}`);
      if (!journalsResponse.ok) throw new Error(`Erreur HTTP pour les journaux: ${journalsResponse.status}`);
      
      const plansData = await plansResponse.json();
      const journalsData = await journalsResponse.json();
      
      setPlans(plansData);
      setJournals(journalsData);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ... (const handleExecuteBackup = ...)
  const handleExecuteBackup = async (planId) => {
    setNotification({ open: true, message: `Lancement de la sauvegarde pour le plan ${planId}...`, severity: 'info' });
    
    try {
      const response = await fetch(`${API_URL}/api/plans/${planId}/execute`, {
        method: 'POST',
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.statusMessage || 'Échec du lancement');
      
      setNotification({ open: true, message: 'Sauvegarde lancée ! L\'historique va se mettre à jour.', severity: 'success' });
      
      setTimeout(fetchData, 1000); 

    } catch (err) {
      setNotification({ open: true, message: err.message, severity: 'error' });
    }
  };

  // ... (const handleCloseNotification = ...)
  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification(prev => ({ ...prev, open: false }));
  };

  // --- CORRECTION : Remise en place des blocs 'loading' et 'error' ---
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 5 }}>
        Erreur de connexion au backend : {error}.
        <br />
        <strong>Vérifiez que votre backend (`npm run dev`) est bien lancé sur le port 3001.</strong>
      </Alert>
    );
  }
  // --- Fin de la correction ---

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>

        {/* --- COLONNE PLANS DE SAUVEGARDE --- */}
        <Grid item xs={12} md={6}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Plans de Sauvegarde</Typography>
            <Button variant="contained" startIcon={<AddIcon />}>
              Nouveau Plan
            </Button>
          </Stack>
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nom du Plan</TableCell>
                    <TableCell>Cible</TableCell>
                    <TableCell>Fréquence</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {plans.length > 0 ? (
                    plans.map((plan) => (
                      <TableRow hover key={plan.id}>
                        <TableCell>{plan.nomPlan}</TableCell>
                        <TableCell>{plan.sgbdCible.nomConnexion}</TableCell>
                        <TableCell>{plan.frequenceCron}</TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            title="Lancer la sauvegarde"
                            onClick={() => handleExecuteBackup(plan.id)}
                          >
                            <PlayCircleOutlineIcon fontSize="inherit" />
                          </IconButton>
                          <IconButton size="small" title="Plus d'options">
                            <MoreVertIcon fontSize="inherit" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        Aucun plan configuré.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* --- COLONNE HISTORIQUE DES JOURNAUX --- */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" mb={2}>Historique des Journaux</Typography>
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Plan</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Début</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {journals.length > 0 ? (
                    journals.map((journal) => (
                      <TableRow hover key={journal.id}>
                        <TableCell>{journal.plan.nomPlan}</TableCell>
                        <TableCell>
                          <StatusChip status={journal.statut} />
                        </TableCell>
                        <TableCell>
                          {new Date(journal.heureDebut).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" title="Voir détails">
                            <MoreVertIcon fontSize="inherit" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        Aucun journal trouvé.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
      </Grid>

      {/* --- Snackbar pour les notifications --- */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}