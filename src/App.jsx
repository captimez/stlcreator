import React from "react";
import MainView from "./view/views/mainView";
import { AppProvider } from '@toolpad/core/AppProvider';
import { Button, Typography, Container } from "@mui/material";
import DashboardLayoutBranding from "./view/components/layout/DashboardLayout";
import { AppProvider as CustomProvider } from "./model/store";

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
