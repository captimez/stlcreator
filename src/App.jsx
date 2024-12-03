import React from "react";
import MainView from "./view/views/mainView";
import { AppProvider } from '@toolpad/core/AppProvider';
import { AppProvider as CustomProvider } from "./model/store";
import { Button, Typography, Container } from "@mui/material";

const App = () => {
  return (
    <AppProvider>
        <CustomProvider>
            <MainView></MainView>
        </CustomProvider>
    </AppProvider>
  );
};

export default App;
