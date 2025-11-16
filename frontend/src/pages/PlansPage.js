// frontend/src/pages/PlansPage.js
import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel
} from '@mui/material';

const API_URL = 'http://localhost:3001';

// --- Formulaire 1 : Ajouter une Destination ---
function DestinationForm({ onDestinationAdded }) {
  const [nom, setNom] = useState('');
  const [path, setPath] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/destinations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomDestination: nom, cheminLocal: path }),
      });
      if (!response.ok) throw new Error('Échec de la création');
      setNom('');
      setPath('');
      onDestinationAdded(); // Rafraîchir la liste dans le composant parent
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Paper sx={{ p: 4, mb: 4 }}>
      <Typography variant="h6" gutterBottom>1. Ajouter une Destination de Stockage (Locale)</Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Nom de la Destination" value={nom} onChange={(e) => setNom(e.target.value)} required helperText="Ex: 'Serveur Backups Local'" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Chemin d'accès local" value={path} onChange={(e) => setPath(e.target.value)} required helperText="Ex: 'G:\MonProjet\backups' ou '/var/backups'" />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained">Ajouter Destination</Button>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}

// --- Formulaire 2 : Créer un Plan ---
function PlanForm({ targets, destinations }) {
  const [formData, setFormData] = useState({
    nomPlan: '',
    frequenceCron: '0 2 * * *', // 2h du matin par défaut
    typeSauvegarde: 'Complet',
    compressionActivee: true,
    sgbdCibleId: '',
    destinationId: '',
  });
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ sev: 'info', msg: 'Création...' });
    try {
      const response = await fetch(`${API_URL}/api/plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.statusMessage || 'Échec de la création');
      setStatus({ sev: 'success', msg: `Plan "${result.nomPlan}" créé !` });
      // TODO: Rafraîchir la liste des plans sur le Dashboard
    } catch (err) {
      setStatus({ sev: 'error', msg: err.message });
    }
  };

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h6" gutterBottom>2. Créer un Plan de Sauvegarde</Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Ligne 1: Cible et Destination */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel id="cible-label">Cible SGBD</InputLabel>
              <Select labelId="cible-label" name="sgbdCibleId" value={formData.sgbdCibleId} label="Cible SGBD" onChange={handleChange}>
                {targets.map(t => <MenuItem key={t.id} value={t.id}>{t.nomConnexion}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel id="dest-label">Destination</InputLabel>
              <Select labelId="dest-label" name="destinationId" value={formData.destinationId} label="Destination" onChange={handleChange}>
                {destinations.map(d => <MenuItem key={d.id} value={d.id}>{d.nomDestination}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          {/* Ligne 2: Nom et Fréquence */}
          <Grid item xs={12} sm={6}>
            <TextField fullWidth required label="Nom du Plan" name="nomPlan" value={formData.nomPlan} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth required label="Fréquence (Cron)" name="frequenceCron" value={formData.frequenceCron} onChange={handleChange} helperText="Ex: '0 2 * * *' (tous les jours à 2h)" />
          </Grid>

          {/* Ligne 3: Options */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="type-label">Type de Sauvegarde</InputLabel>
              <Select labelId="type-label" name="typeSauvegarde" value={formData.typeSauvegarde} label="Type de Sauvegarde" onChange={handleChange}>
                <MenuItem value="Complet">Complet</MenuItem>
                <MenuItem value="Incrémentiel" disabled>Incrémentiel (bientôt)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={<Switch name="compressionActivee" checked={formData.compressionActivee} onChange={handleChange} />}
              label="Activer la Compression"
            />
          </Grid>

          {/* Ligne 4: Soumission */}
          <Grid item xs={12}>
            <Button type="submit" variant="contained">Créer le Plan</Button>
            {status && <Alert severity={status.sev} sx={{ mt: 2 }}>{status.msg}</Alert>}
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}

// --- Composant principal de la page ---
export default function PlansPage() {
  const [targets, setTargets] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour charger TOUTES les données (Cibles ET Destinations)
  const loadData = async () => {
    try {
      const [targetsRes, destinationsRes] = await Promise.all([
        fetch(`${API_URL}/api/sgbd-targets`),
        fetch(`${API_URL}/api/destinations`),
      ]);
      if (!targetsRes.ok) throw new Error('Erreur chargement Cibles');
      if (!destinationsRes.ok) throw new Error('Erreur chargement Destinations');
      
      const targetsData = await targetsRes.json();
      const destinationsData = await destinationsRes.json();
      
      setTargets(targetsData);
      setDestinations(destinationsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage
  useEffect(() => {
    loadData();
  }, []);

  // Fonction passée au formulaire Destination pour rafraîchir
  const handleDestinationAdded = () => {
    loadData(); // Recharge Cibles et Destinations
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Gérer les Plans de Sauvegarde
      </Typography>
      
      {/* Formulaire 1 */}
      <DestinationForm onDestinationAdded={handleDestinationAdded} />
      
      {/* Formulaire 2 */}
      <PlanForm targets={targets} destinations={destinations} />
    </Box>
  );
}