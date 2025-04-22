import React, { createContext, useContext, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [selectedBauteil, setSelectedBauteil] = useState(null);

  // 🔔 Snackbar-Zustand
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info'); // "success", "error", "warning", "info"

  // 🔧 Funktion zum Anzeigen der Snackbar
  const showSnackbar = (message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  return (
    <AppContext.Provider value={{
      selectedBauteil,
      setSelectedBauteil,
      showSnackbar, // <- jetzt global verfügbar!
    }}>
      {children}

      {/* Snackbar wird global gerendert */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={10000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
