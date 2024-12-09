import React, { createContext, useContext, useState } from 'react';

// Create the Context
const AppContext = createContext();

// Create the Provider Component
export const AppProvider = ({ children }) => {
  const [selectedBauteil, setSelectedBauteil] = useState(null)
  

  return (
    <AppContext.Provider value={{ selectedBauteil, setSelectedBauteil }}>
      {children}
    </AppContext.Provider>
  );
};

// Create a Custom Hook to Use the Context
export const useAppContext = () => {
  return useContext(AppContext);
};
