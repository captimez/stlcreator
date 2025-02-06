import React, { createContext, useContext, useState } from 'react';

// Erstelle den AppContext
const AppContext = createContext();

/**
 * AppProvider - Kontext-Provider für globale Zustandsverwaltung
 *
 * Diese Komponente stellt den AppContext bereit und verwaltet den Zustand
 * des aktuell ausgewählten Bauteils.
 * 
 * @param {Object} props - Enthält die Kinderkomponenten, die den Kontext nutzen.
 */
export const AppProvider = ({ children }) => {
  // Zustand für das aktuell ausgewählte Bauteil
  const [selectedBauteil, setSelectedBauteil] = useState(null);
  
  return (
    <AppContext.Provider value={{ selectedBauteil, setSelectedBauteil }}>
      {children} {/* Stellt den Kontext für untergeordnete Komponenten bereit */}
    </AppContext.Provider>
  );
};

/**
 * Custom Hook zum Zugriff auf den AppContext
 * 
 * @returns {Object} Enthält `selectedBauteil` und `setSelectedBauteil`
 */
export const useAppContext = () => {
  return useContext(AppContext);
};
