import { Alert, Box, Grid } from "@mui/material";
import moment from "moment";
import React, { ReactElement, useEffect, useState } from "react";
import {
  T_geoJSON,
  T_machinery,
  T_surface,
  T_work,
  authUser,
  getMachineryPath,
  getMachinerys,
  getSurfaces,
  getWorks,
} from "./Utilsj";
import { Inputs, T_input } from "./Components/Inputs";
import { BaseMap } from "./Components/Map";
import { Buttons, T_button } from "./Components/Buttons";

export interface T_mapData {
  markers: any[];
  polylines: T_geoJSON[][];
  polygons: any[];
  surfaces?: T_surface[];
}

export const Base = (): ReactElement | null => {
  const [machinaries, setMachineries] = useState<T_machinery[]>();
  const [alertText, setAlertText] = useState<string>();
  const [surfaces, setSurfaces] = useState<T_surface[]>();
  const [mapData, setMapData] = useState<T_mapData>();
  const [localWorks, setLocalWorks] = useState<T_work[]>();
  const [form, setForm] = useState({
    machineryId: "",
    start: moment("2024-08-14").startOf("day"),
    end: moment("2024-08-14").endOf("day"),
  });

  useEffect(() => {
    /// login user
    authUser(
      {
        password: `${process.env.password}`,
        username: `${process.env.username}`,
      },
      async (done) => {
        getMachinerys(null, (machinaries) => {
          setMachineries(machinaries);
        });

        /// get all surfaces
        const localSurfaces = await getSurfaces("6555f42e32ff84892674a092");
        if (localSurfaces) {
          setSurfaces(localSurfaces);
        }
      }
    );
  }, []);

  const inputs: T_input[] = [
    {
      type: "select",
      value: "machineryId",
      label: "Dispozitiv",
      sx: { padding: "1px" },
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
      sx: { padding: "1px" },
    },
    {
      type: "dateTime",
      sx: { padding: "1px" },
      value: "end",
      label: "End",
    },
  ];

  const getWorksLocal = (polylines: T_mapData["polylines"]) => {
    setAlertText(
      `Aducem muncile din intervalul ${form.start.format(
        "DD-MM HH:mm"
      )} - ${form.end.format("DD-MM HH:mm")}`
    );
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
        setAlertText(null);
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
          polygons: false ? [] : worksPolygons,
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
            setAlertText("Nu avem date");
            setTimeout(() => {
              setAlertText(null);
            }, 2000);
          }
        }
      );
    } else {
      setAlertText("Selectează un device");
      setTimeout(() => {
        setAlertText(null);
      }, 2000);
    }
  };

  const otherDay = (target: "+1" | "-1") => {
    // change one day and
    let localForm = { ...form };
    switch (target) {
      case "-1":
        localForm.start = localForm.start.clone().subtract(1, "days");
        localForm.end = localForm.end.clone().subtract(1, "days");
        break;
      case "+1":
        localForm.start = localForm.start.clone().add(1, "days");
        localForm.end = localForm.end.clone().add(1, "days");
        break;
      default:
        break;
    }

    setForm(localForm);
  };

  const buttons: T_button[] = [
    {
      action: () => otherDay("-1"),
      label: "-1",
      value: "-1",
      variant: "outlined",
    },
    {
      action: () => otherDay("+1"),
      label: "+1",
      value: "+1",
      variant: "outlined",
    },
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
        try {
          alert(
            ` Interval ${moment(selectedWork.start)
              .local()
              .format("DD-MM-YYYY HH:mm")} - ${moment(selectedWork.end)
              .local()
              .format(
                "DD-MM-YYYY HH:mm"
              )}\nsup: ${selectedWork.workingArea.toFixed(
              2
            )} ha, cons: ${selectedWork.totalConsumption.toFixed(
              2
            )} l, width: ${selectedWork.workingWidth.toFixed(2)} m`
          );
        } catch (error) {
          console.error(error);
        }

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
      {Boolean(alertText) ? (
        <Box
          sx={{
            position: "fixed", // Position the box relative to the viewport
            top: "20px", // Adjust the top position as needed
            left: "20px", // Center the box horizontally
            zIndex: 1300, // Set a high z-index to ensure it appears above other elements
            width: "fit-content", // Adjust the width to fit the content
          }}
        >
          <Alert severity="info">{alertText}</Alert>
        </Box>
      ) : null}
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
              surfaces,
            }}
            key={"mainMapComp"}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
