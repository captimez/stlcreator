import React from "react";
import MainView from "./view/views/mainView";
import { AppProvider } from '@toolpad/core/AppProvider';
import { AppProvider as CustomProvider } from "./model/store";
import { Button, Typography, Container } from "@mui/material";
import DashboardLayoutBranding from "./view/components/layout/DashboardLayout";

const App = () => {
  return (
    <AppProvider>
        <CustomProvider>
            <DashboardLayoutBranding></DashboardLayoutBranding>
        </CustomProvider>
    </AppProvider>
  );
};

export default App;
