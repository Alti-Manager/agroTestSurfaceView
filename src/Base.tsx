import { Alert, Box, Grid } from "@mui/material";
import moment from "moment";
import React, { ReactElement, useEffect, useState } from "react";
import {
  T_geoJSON,
  T_machinery,
  T_work,
  authUser,
  getMachineryPath,
  getMachinerys,
  getWorks,
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
  const [localWorks, setLocalWorks] = useState<T_work[]>();
  const [form, setForm] = useState({
    machineryId: "",
    start: moment("2024-07-29").startOf("day"),
    end: moment("2024-07-29").endOf("day"),
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

  const getWorksLocal = (polylines: T_mapData["polylines"]) => {
    //get works for this machinary
    getWorks(
      {
        deviceId: machinaries.filter(
          (machinary) => machinary._id === form.machineryId
        )[0].deviceId,
        start: form.start,
        end: form.end,
      },
      (data) => {
        // set works
        setLocalWorks(data.works);

        let worksPolygons = data.works?.map((work) => {
          let polygon = work.coordinates.map((path) => {
            return path.map((position, index) => {
              let toReturn: T_geoJSON = [position[0], position[1]];
              if (index === 0) {
                toReturn = [
                  position[0],
                  position[1],
                  position[2],
                  position[3],
                  work._id,
                ];
              }

              return toReturn;
            });
          });
          return polygon;
        });

        let markers: T_mapData["markers"][] = data.points?.map((point) => {
          return point;
        });

        // add extra Polylines
        let extraPoly: T_mapData["polylines"] = data.segments
          ? data.segments
          : [];

        setMapData({
          markers,
          polylines: [...polylines, ...extraPoly],
          polygons: worksPolygons,
        });
      }
    );
  };

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

            // get works now
            getWorksLocal(polylines);
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

  const handleClick = (
    type: "marker" | "polyline" | "polygon",
    target: string
  ) => {
    switch (type) {
      case "polygon":
        const selectedWork = localWorks.filter(
          (local) => local._id === target
        )[0];
        alert(` Interval ${selectedWork.start} - ${selectedWork.end} 
          suprafata: ${selectedWork.workingArea.toFixed(
            2
          )} ha, consum: ${selectedWork.totalConsumption.toFixed(2)} l`);
        break;

      default:
        break;
    }
  };

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
            handleClick={handleClick}
            data={{
              markers: mapData?.markers,
              polygons: mapData?.polygons,
              polylines: mapData?.polylines,
            }}
            key={"mainMapComp"}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
