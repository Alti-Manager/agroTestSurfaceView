import { Button, Grid, SxProps } from "@mui/material";
import React, { ReactElement } from "react";

export interface T_button {
  value: string;
  label: string;
  variant: "contained" | "outlined" | "text";
  action: () => void;
}

export const Buttons = (props: {
  sx?: SxProps;
  buttons: T_button[];
}): ReactElement | null => {
  return (
    <Grid container justifyContent={"center"} sx={props.sx}>
      {props.buttons.map((button) => {
        return (
          <Grid
            item
            key={button.value}
            style={{
              padding: 2,
            }}
          >
            <Button variant={button.variant} onClick={() => button.action()}>
              {button.label}
            </Button>
          </Grid>
        );
      })}
    </Grid>
  );
};
