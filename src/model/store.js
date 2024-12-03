import React, { createContext, useContext, useState } from 'react';

// Create the Context
const AppContext = createContext();

// Create the Provider Component
export const AppProvider = ({ children }) => {
  const [state, setState] = useState({
    selectedBauteil: null,
  });

  const setSelectedBauteil = (bauteil) => {
    setState((prevState) => ({
        ...prevState,
        bauteil
    }))
  }

  return (
    <AppContext.Provider value={{ state, setSelectedBauteil }}>
      {children}
    </AppContext.Provider>
  );
};

// Create a Custom Hook to Use the Context
export const useAppContext = () => {
  return useContext(AppContext);
};
