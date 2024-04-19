import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SxProps,
  TextField,
} from "@mui/material";
import React, { ReactElement } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";

export interface T_input {
  type: "text" | "password" | "select" | "dateTime";
  value: string;
  label: string;
  options?: { value: string; label: string }[];
  sx?: SxProps;
}

export const Inputs = (props: {
  sx?: SxProps;
  inputs: T_input[];
  values: { [key: string]: any };
  onChange: (input: T_input, value: any) => void;
}): ReactElement | null => {
  return (
    <Grid
      container
      alignSelf={"center"}
      justifyContent={"center"}
      sx={props.sx}
    >
      {props.inputs.map((input) => {
        return (
          <Input
            value={props.values[input.value]}
            input={input}
            key={input.value}
            onChange={props.onChange}
          />
        );
      })}
    </Grid>
  );
};

export const Input = (props: {
  input: T_input;
  value: any;
  onChange: (input: T_input, value: any) => void;
}): ReactElement | null => {
  const input = props.input;
  switch (input.type) {
    case "text":
    case "password":
      return (
        <Grid item key={input.value} sx={input.sx}>
          <TextField
            label={input.label}
            type={input.type}
            value={props.value ? props.value : ""}
            onChange={(event) => {
              props.onChange(input, event.target.value);
            }}
          >
            {input.label}
          </TextField>
        </Grid>
      );

    case "select":
      return (
        <Grid item key={input.value} sx={input.sx}>
          <FormControl
            fullWidth
            style={{
              minWidth: 260,
            }}
          >
            <InputLabel id="deviceSelection">{"Device"}</InputLabel>
            <Select
              labelId="deviceSelection"
              id="deviceSelectionSelect"
              value={props.value ? props.value : ""}
              label="Dispozitiv"
              onChange={(event): void => {
                props.onChange(input, event.target.value);
              }}
            >
              {props.input.options?.map((option) => {
                return (
                  <MenuItem value={option.value} key={option.value}>
                    {option.label}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Grid>
      );

    case "dateTime":
      return (
        <Grid item key={input.value} sx={input.sx}>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DateTimePicker
              format="DD/MM/YYYY HH:mm"
              ampm={false}
              value={props.value ? props.value : null}
              label={props.input.label}
              onChange={(value): void => {
                props.onChange(input, value);
              }}
            />
          </LocalizationProvider>
        </Grid>
      );

    default:
      break;
  }
};
