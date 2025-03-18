import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createTheme, styled } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BuildIcon from '@mui/icons-material/Build';
import SettingsIcon from '@mui/icons-material/Settings';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';
import StlView from '../../views/StlView';
import TrainView from '../../views/TrainView'
import SettingsView from '../../views/SettingsView';
import logo from '../../../res/logo.png';
import './main.css'
import { Padding } from '@mui/icons-material';
import { Button, Hidden } from '@mui/material';

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
          main: "#3f51b5",
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

function handleSettingsClick(router) {
  router.navigate('/settings');
}

function SidebarFooter({ router, mini }) {
  console.log(mini)
  return (
    <Box>
      <Box sx={{ textAlign: 'center' }}>
        <Button
          variant="text"
          startIcon={<SettingsIcon />}
          onClick={() => handleSettingsClick(router)}
          width = "100%" 
          sx={{
            color: 'textSecondary',
            backgroundColor: 'white',
            borderRadius: 2,
            ml: 1,
            mr: 1,
            p: 1,
            '&:hover': {
              backgroundColor: '#f0f0f0', // Change background color on hover
              color: 'primary.main', // Change text color on hover
            },
          }}
        >
          {mini ? "" : "Settings"}
        </Button>
      </Box>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          {mini ? "© rbc" : "©" + new Date().getFullYear() + " rbc Robotics"}
        </Typography>
      </Box>
    </Box>
  );
}

SidebarFooter.propTypes = {
  mini: PropTypes.bool.isRequired,
};

function PageContent({ pathname }) {
  // Normalize pathname for Electron environment
  const normalizedPathname = pathname.replace('/C:', '');

  console.log(normalizedPathname);

  if (normalizedPathname === "/dashboard") {
    return <StlView />;
  } else if (normalizedPathname === "/training") {
    return <TrainView />;
  } else if (normalizedPathname === "/settings") {
    return <SettingsView />;
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
      slots={{
        sidebarFooter: (layoutProps) => <SidebarFooter router={router} mini={layoutProps.mini} />,
      }}
      sx={{
        // Anpassung der Drawer-Farbe
        '& .MuiDrawer-paper': {
          backgroundColor: '#66666', // Farbe für den Drawer
          overflow: 'hidden', // Verhindert Scrollbar im Drawer
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
          color: '#ffffff', // Textfarbe im Header
          '& .MuiSvgIcon-root': {
            color: '#ffffff', // Icon-Farbe
          },
        },
        'nav.MuiBox-root.css-4qjrhm':{
          overflow: 'hidden',
        }
      }}
    >
          <PageContent pathname={router.pathname} />
      </DashboardLayout>
    </AppProvider>

  );
}
