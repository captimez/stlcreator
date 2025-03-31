import React from "react";
import { AppProvider } from '@toolpad/core/AppProvider';
import { Button, Typography, Container } from "@mui/material";
import DashboardLayoutBranding from "./view/components/layout/DashboardLayout";
import { AppProvider as CustomProvider } from "./model/store";

const App = () => {
  React.useEffect(() => {
    document.title = "rbc - STL Creator";
  }, []);



  return (
    <AppProvider>
        <CustomProvider>
            <DashboardLayoutBranding></DashboardLayoutBranding>
        </CustomProvider>
    </AppProvider>
  );
};

export default App;
