// frontend/src/theme.js
import { createTheme } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

// Créez notre thème personnalisé
const theme = createTheme({
  palette: {
    // Mode "light" (par défaut)
    background: {
      default: grey[100], // Le fond principal de la page sera gris clair
      paper: '#ffffff',     // Le fond des composants (Paper, Drawer, AppBar) sera blanc
    },
  },
  components: {
    // Style pour la barre de titre
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff', // Fond blanc
          color: grey[800],         // Texte foncé
          elevation: 0,               // Pas d'ombre
          borderBottom: `1px solid ${grey[300]}`, // Une bordure subtile
        },
      },
    },
    // Style pour la Sidebar
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${grey[300]}`, // Bordure subtile
        },
      },
    },
  },
});

export default theme;