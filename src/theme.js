import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: "#1943ED",
    },
    third: {
        main: "#C7CDE8",
    },
  },
  typography: {
    fontFamily: "Arial",
  },
});

export default theme;
