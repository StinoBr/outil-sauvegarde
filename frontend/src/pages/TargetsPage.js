// frontend/src/pages/TargetsPage.js
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress
} from '@mui/material';

const API_URL = 'http://localhost:3001';

export default function TargetsPage() {
  // --- NOUVEAUX ÉTATS ---
  const [targets, setTargets] = useState([]); // Pour la liste
  const [loading, setLoading] = useState(true); // Pour le chargement de la liste

  // États pour notre formulaire
  const [formData, setFormData] = useState({
    nomConnexion: '', typeSgbd: 'PostgreSQL', adresseIp: '',
    port: '', nomBaseDeDonnees: '', nomUtilisateur: '', motDePasse: '',
  });
  
  // États pour la soumission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitMessage, setSubmitMessage] = useState('');

  // --- NOUVELLE FONCTION : Charger les cibles ---
  const fetchTargets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/sgbd-targets`);
      if (!response.ok) throw new Error('Erreur de chargement des cibles');
      const data = await response.json();
      setTargets(data);
    } catch (err) {
      setSubmitStatus('error'); // On réutilise l'alerte pour les erreurs de chargement
      setSubmitMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- NOUVEAU : 'useEffect' pour charger les données au montage ---
  useEffect(() => {
    fetchTargets();
  }, []); // [] = Se lance une seule fois au début

  // Gère la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage('');

    try {
      const response = await fetch(`${API_URL}/api/sgbd-targets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.statusMessage || 'Une erreur est survenue');

      setSubmitStatus('success');
      setSubmitMessage(`Cible "${result.nomConnexion}" créée avec succès !`);
      setFormData({ // Réinitialiser le formulaire
        nomConnexion: '', typeSgbd: 'PostgreSQL', adresseIp: '',
        port: '', nomBaseDeDonnees: '', nomUtilisateur: '', motDePasse: '',
      });
      
      // --- NOUVEAU : Rafraîchir la liste après succès ---
      fetchTargets(); 

    } catch (err) {
      setSubmitStatus('error');
      setSubmitMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... (handleChange reste le même)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Gérer les Cibles SGBD
      </Typography>

      {/* --- NOUVEAU BLOC : Affichage de la liste --- */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Cibles Enregistrées</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Adresse</TableCell>
                <TableCell>Base de données</TableCell>
                <TableCell>Utilisateur</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center"><CircularProgress size={24} /></TableCell>
                </TableRow>
              ) : targets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">Aucune cible enregistrée</TableCell>
                </TableRow>
              ) : (
                targets.map((target) => (
                  <TableRow hover key={target.id}>
                    <TableCell>{target.nomConnexion}</TableCell>
                    <TableCell>{target.typeSgbd}</TableCell>
                    <TableCell>{target.adresseIp}:{target.port}</TableCell>
                    <TableCell>{target.nomBaseDeDonnees}</TableCell>
                    <TableCell>{target.nomUtilisateur}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      {/* --- Fin du nouveau bloc --- */}


      {/* Formulaire d'ajout (le code précédent, inchangé) */}
      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>Ajouter une nouvelle cible</Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            {/* ... (tous les champs du formulaire) ... */}
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth id="nomConnexion" name="nomConnexion" label="Nom de la Connexion" value={formData.nomConnexion} onChange={handleChange} helperText="Ex: 'BDD Prod Postgres'" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="typeSgbd-label">Type de SGBD</InputLabel>
                <Select labelId="typeSgbd-label" id="typeSgbd" name="typeSgbd" value={formData.typeSgbd} label="Type de SGBD" onChange={handleChange}>
                  <MenuItem value="PostgreSQL">PostgreSQL</MenuItem>
                  <MenuItem value="MySQL">MySQL</MenuItem>
                  <MenuItem value="MongoDB" disabled>MongoDB (bientôt)</MenuItem>
                  <MenuItem value="SQLite" disabled>SQLite (bientôt)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField required fullWidth id="adresseIp" name="adresseIp" label="Adresse IP ou Hôte" value={formData.adresseIp} onChange={handleChange} helperText="Ex: 'localhost' ou '192.168.1.10'" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField required fullWidth id="port" name="port" label="Port" type="number" value={formData.port} onChange={handleChange} helperText="Ex: 5432" />
            </Grid>
            <Grid item xs={12}>
              <TextField required fullWidth id="nomBaseDeDonnees" name="nomBaseDeDonnees" label="Nom de la Base de Données" value={formData.nomBaseDeDonnees} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth id="nomUtilisateur" name="nomUtilisateur" label="Nom d'utilisateur" value={formData.nomUtilisateur} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth id="motDePasse" name="motDePasse" label="Mot de passe" type="password" value={formData.motDePasse} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ mt: 2 }}>
                {isSubmitting ? 'Ajout en cours...' : 'Ajouter la Cible'}
              </Button>
            </Grid>
            {submitStatus && (
              <Grid item xs={12}>
                <Alert severity={submitStatus}>
                  {submitMessage}
                </Alert>
              </Grid>
            )}
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}