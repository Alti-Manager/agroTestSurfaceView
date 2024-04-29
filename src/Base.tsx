import { Alert, Box, Grid } from "@mui/material";
import moment from "moment";
import React, { ReactElement, useEffect, useState } from "react";
import {
  T_geoJSON,
  T_machinery,
  authUser,
  getMachineryPath,
  getMachinerys,
} from "./Utilsj";
import { Inputs, T_input } from "./Components/Inputs";
import { BaseMap } from "./Components/Map";
import { Buttons, T_button } from "./Components/Buttons";

export interface T_mapData {
  markers: any[];
  polylines: T_geoJSON[][];
  polygons: any[];
}

export const Base = (): ReactElement | null => {
  const [machinaries, setMachineries] = useState<T_machinery[]>();
  const [mapData, setMapData] = useState<T_mapData>();
  const [form, setForm] = useState({
    machineryId: "",
    start: moment("2024-04-28").startOf("day"),
    end: moment("2024-04-28").endOf("day"),
  });

  useEffect(() => {
    /// login user
    authUser(
      {
        password: `${process.env.password}`,
        username: `${process.env.username}`,
      },
      (done) => {
        getMachinerys(null, (machinaries) => {
          setMachineries(machinaries);
        });
      }
    );
  }, []);

  const inputs: T_input[] = [
    {
      type: "select",
      value: "machineryId",
      label: "Dispozitiv",
      options: machinaries?.map((machinery: T_machinery) => {
        return {
          label: machinery.name
            ? machinery.name
            : `${machinery.producer} ${machinery.model}`,
          value: machinery._id,
        };
      }),
    },
    {
      type: "dateTime",
      value: "start",
      label: "Start",
    },
    {
      type: "dateTime",
      value: "end",
      label: "End",
    },
  ];

  const getPath = () => {
    if (form.machineryId) {
      setMapData(null);
      getMachineryPath(
        {
          deviceId: machinaries.filter(
            (machinary) => machinary._id === form.machineryId
          )[0].deviceId,
          start: form.start,
          end: form.end,
        },
        (path) => {
          // save this path

          if (path && path.path.length) {
            console.log(path.works);
            let worksPolygons = path.works?.map((work) => {
              let polygon = work.coordinates;
              return polygon;
            });

            var polylines = [path.path];

            // add polylines from tourns
            if (path.tourns?.length) {
              // we can have tourns to show
              path.tourns.forEach((tourn) => {
                polylines.push([...tourn.firstSegment, ...tourn.lastSegment]);
              });
            }

            // check if we have segments to show
            if (path.segments.length) {
              path.segments.forEach((segment) => {
                segment.forEach((seg) => {
                  polylines.push(
                    seg.map((point) => {
                      return [point[0], point[1]];
                    })
                  );
                });
              });
            }

            setMapData({
              markers: [],
              polygons: worksPolygons,
              polylines,
            });
          } else {
            window.alert("Nu avem date");
          }
        }
      );
    } else {
      window.alert("Selectează un device");
    }
  };

  const buttons: T_button[] = [
    {
      action: getPath,
      label: "Afișează date",
      value: "getPath",
      variant: "outlined",
    },
  ];

  const handleChange = (target: T_input, value: any) => {
    let f = { ...form };
    Object.assign(f, { [target.value]: value });
    setForm(f);
  };
  return (
    <Box>
      <Grid container>
        <Grid
          item
          xs={12}
          display={"inline-flex"}
          container
          alignItems={"center"}
          justifyContent={"center"}
          sx={{
            padding: 1.5,
          }}
        >
          <Grid item>
            <Inputs
              key="INPUT"
              inputs={inputs}
              onChange={handleChange}
              values={form}
            />
          </Grid>

          <Grid item>
            <Buttons
              sx={{
                marginLeft: 2,
              }}
              buttons={buttons}
            />
          </Grid>
        </Grid>
        <Grid
          item
          xs={12}
          sx={{
            height: window.innerHeight - 80,
          }}
        >
          <BaseMap
            markers={mapData?.markers}
            polygons={mapData?.polygons}
            polylines={mapData?.polylines}
            key={"mainMapComp"}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
