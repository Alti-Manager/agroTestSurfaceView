import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { roRO } from "@mui/material/locale";
import React, { ReactElement } from "react";
import { Base } from "./Base";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Base />,
  },
]);

export const App = (): ReactElement | null => {
  const theme = createTheme(
    {
      palette: {
        primary: {
          main: "#4CBC79",
          contrastText: "#fff",
        },
        secondary: {
          main: "#E1C220",
          contrastText: "#000",
        },
      },
    },
    roRO
  );

  return (
    <ThemeProvider theme={theme}>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};
