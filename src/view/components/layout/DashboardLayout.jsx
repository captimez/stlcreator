import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createTheme, styled } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BuildIcon from '@mui/icons-material/Build';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';
import StlView from '../../views/StlView';
import TrainView from '../../views/TrainView'
import logo from '../../../res/logo.png';
import './main.css'
import { Padding } from '@mui/icons-material';

const NAVIGATION = [
  {
    kind: 'header',
    title: 'Programms',
  },
  {
    segment: 'dashboard',
    title: 'STL Creator',
    icon: <DashboardIcon />,
  },
  {
    segment: 'training',
    title: 'Training Tool',
    icon: <BuildIcon />,
  },
];

const demoTheme = createTheme({
    palette: {
        primary: {
          main: "#ffffff",
        },
        secondary: {
          main: "#1943ED",
        },
        third: {
            main: "#C7CDE8",
        },
      },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});


function PageContent({ pathname }) {
  // Normalize pathname for Electron environment
  const normalizedPathname = pathname.replace('/C:', '');

  console.log(normalizedPathname);


  if(normalizedPathname === "/dashboard"){
    return (
      <StlView></StlView>
    );
  }else if(normalizedPathname === "/training"){
    return(
      <TrainView></TrainView>
    );
  }
  return null; // Add a default return to avoid undefined return
}


export default function DashboardLayoutBasic(props) {
  const { window } = props;

  const router = useDemoRouter('/dashboard');

  return (
    <AppProvider
      branding={{
        logo: <img src={logo} alt="MUI logo" style={{ height: "100"}} />,
        title: ''
      }}
      navigation={NAVIGATION}
      router={router}
      theme={demoTheme}
    >
    <DashboardLayout
      sx={{
        // Anpassung der Drawer-Farbe
        '& .MuiDrawer-paper': {
          backgroundColor: '#66666', // Farbe für den Drawer
        },
        // Anpassung der Paper-Komponente (falls andere Paper-Komponenten betroffen sind)
        '& .MuiPaper-root': {
          backgroundColor: '#66666', // Farbe für alle anderen Paper-Komponenten
        },
        // Optional: Anpassung des Inhaltsbereichs
        '& .DashboardLayout-content': {
          backgroundColor: '#f0f0f0', // Hintergrundfarbe für den Inhalt
        },
        // Optional: Anpassung der AppBar, falls vorhanden
        '& .MuiAppBar-root': {
          backgroundColor: '#3f51b5', // Header-Farbe
        },
      }}
    >
          <PageContent pathname={router.pathname} />
      </DashboardLayout>
    </AppProvider>

  );
}
