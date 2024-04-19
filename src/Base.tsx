import { Grid } from "@mui/material";
import React, { ReactElement, useEffect } from "react";
import { authUser } from "./Utilsj";

export const Base = (): ReactElement | null => {
  useEffect(() => {
    /// login user
    authUser(
      {
        password: `${process.env.password}`,
        username: `${process.env.username}`,
      },
      (done) => {}
    );
  });

  return <Grid>"Maxim"</Grid>;
};
