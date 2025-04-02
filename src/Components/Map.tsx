import { ReactElement, useEffect, useState } from "react";
import { T_mapData } from "../Base";
import {
  APIProvider,
  AdvancedMarker,
  Map,
  useMap,
} from "@vis.gl/react-google-maps";
import React from "react";
import { randomColor, T_geoJSON, T_surface, T_work } from "../Utilsj";
import { Grid } from "@mui/material";
import moment from "moment";

export const BaseMap = (props: {
  data: T_mapData;
  handleClick: (
    type: "marker" | "polyline" | "polygon",
    target: string
  ) => void;
}): ReactElement | null => {
  return (
    <APIProvider
      apiKey="AIzaSyCvvF3lmmyGlWP-W_nVABH17n7bBlFj4is"
      libraries={["core", "maps", "marker"]}
    >
      <BaseMapComp data={{ ...props.data }} handleClick={props.handleClick} />
    </APIProvider>
  );
};

export const BaseMapComp = (props: {
  data: T_mapData;
  handleClick: (
    type: "marker" | "polyline" | "polygon",
    target: string
  ) => void;
}): ReactElement | null => {
  const map = useMap();
  return (
    <Map
      mapId="mainMap"
      defaultCenter={{ lat: 47.492829, lng: 27.321712 }}
      defaultZoom={10}
      mapTypeId="hybrid"
    >
      <MapSurfaces surfaces={props.data.surfaces} key={"SurfacesComp"} />
      <MapPolylines
        polylines={props.data.polylines}
        handleClick={props.handleClick}
        key={"PolylinesComp"}
      />
      <MapPolygons
        polygons={props.data.polygons}
        worksInfo={props.data.worksInfo}
        handleClick={props.handleClick}
        key="PolygonsComp"
      />
      <MapMarkers
        markers={props.data.markers}
        handleClick={props.handleClick}
        key="MarkersCom"
      />
    </Map>
  );
};

export const MapMarkers = (props: {
  markers: T_mapData["markers"];
  handleClick: (
    type: "marker" | "polyline" | "polygon",
    target: string
  ) => void;
}): ReactElement | null => {
  const map = useMap();
  const [markers, setMarkers] = useState<google.maps.MarkerLibrary[]>();

  return (
    <>
      {props.markers?.map((marker) => {
        const timestamp = marker[2]; // Extract timestamp (epoch milliseconds)
        const formattedTime = new Date(timestamp).toLocaleTimeString(); // Format time (HH:MM:SS)

        return (
          <AdvancedMarker
            key={`${marker[0]}_${marker[1]}`}
            position={{
              lng: marker[0],
              lat: marker[1],
            }}
          >
            <Grid
              style={{
                backgroundColor: "white",
              }}
            >
              {formattedTime}
            </Grid>
          </AdvancedMarker>
        );
      })}
    </>
  );
};

interface CustomPolygon extends google.maps.Polygon {
  id?: string;
}

export const MapSurfaces = (props: {
  surfaces: T_surface[];
}): ReactElement | null => {
  const map = useMap();
  useEffect(() => {
    if (props.surfaces) {
      //
      props.surfaces.forEach((localSurface) => {
        let localPolygon = new google.maps.Polygon({
          paths: localSurface.coordinates.map((localCoordinates) => {
            return localCoordinates.map((point) => {
              return { lng: point[0], lat: point[1] };
            });
          }),
          map,
          fillColor: "white",
          strokeWeight: 0,
          zIndex: 2040,
          fillOpacity: 0.2,
        });
      });
    }
  }, [props.surfaces]);

  return null;
};

export const MapPolygons = (props: {
  polygons: T_mapData["polygons"];
  worksInfo: T_work[];
  handleClick: (
    type: "marker" | "polyline" | "polygon",
    target: string
  ) => void;
}): ReactElement | null => {
  const map = useMap();
  const [polygons, setPolygons] = useState<CustomPolygon[]>([]);
  const [textMarkers, setTextMarkers] = useState<google.maps.Marker[]>([]);
  const [selectedPolygonId, setSelectedPolygonId] = useState<string | null>(
    null
  );

  const selectPolygon = (id: string) => {
    props.handleClick("polygon", id);
    setSelectedPolygonId(id);
  };

  // Actualizează stilul poligonului selectat
  useEffect(() => {
    polygons.forEach((polygon) => {
      polygon.setOptions({
        strokeWeight: polygon.id === selectedPolygonId ? 5 : 0,
      });
    });
  }, [selectedPolygonId]);

  // Creează poligoane + label text marker
  useEffect(() => {
    // Șterge poligoane vechi de pe hartă
    polygons.forEach((polygon) => polygon.setMap(null));
    setPolygons([]);

    // Șterge marker-ele vechi
    textMarkers.forEach((marker) => marker.setMap(null));
    setTextMarkers([]);

    const newPolygons: CustomPolygon[] = [];
    const newTextMarkers: google.maps.Marker[] = [];

    if (props.polygons?.length && map) {
      props.polygons.forEach((polygonPath: T_geoJSON[][]) => {
        const paths = polygonPath.map((ring) =>
          ring.map((pos) => ({ lng: pos[0], lat: pos[1] }))
        );

        const polygon: CustomPolygon = new google.maps.Polygon({
          paths,
          map,
          fillColor: randomColor(),
          fillOpacity: 0.5,
          strokeColor: "#ffffff",
          strokeWeight: 0,
          zIndex: 2050,
        });

        polygon.id = polygonPath[0][0][4]; // presupunem că ID-ul este în coordonata [4]

        polygon.addListener("click", () => selectPolygon(polygon.id));

        newPolygons.push(polygon);

        const targetWork = props.worksInfo?.find(
          (localWork) => localWork._id === polygon.id
        );

        const labelText = `${moment(targetWork?.start).format(
          "HH:mm"
        )} - ${moment(targetWork?.end).format("HH:mm")},
         ${targetWork.workingArea.toFixed(
           2
         )} ha, ${targetWork.workingWidth.toFixed(2)}m  `;

        // Calculează centrul (bounding box center)
        const bounds = new google.maps.LatLngBounds();
        paths[0].forEach((point) => bounds.extend(point));
        const center = bounds.getCenter();

        const label = new google.maps.Marker({
          position: center,
          map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 0, // ascunde simbolul
          },
          label: {
            text: labelText || "",
            color: "#fff",
            fontSize: "12px",
            fontWeight: "bold",
          },
          zIndex: 2051,
        });

        newTextMarkers.push(label);
      });
    }

    setPolygons(newPolygons);
    setTextMarkers(newTextMarkers);
  }, [props.polygons]);

  return null;
};

export const MapPolylines = (props: {
  polylines: T_mapData["polylines"];
  handleClick: (
    type: "marker" | "polyline" | "polygon",
    target: string
  ) => void;
}): ReactElement | null => {
  const map = useMap();
  const [polylines, setPolylines] = useState<google.maps.Polyline[]>();

  useEffect(() => {
    // show polylines

    if (polylines) {
      polylines.forEach((polyline) => polyline.setMap(null));
    }

    var polylinesLocal: google.maps.Polyline[] = [];

    // fit map to this path
    var bounds = new google.maps.LatLngBounds();

    props.polylines?.forEach((positions, index) => {
      let googlePolylines = new google.maps.Polyline({
        path: positions.map((position) => {
          return { lng: position[0], lat: position[1] };
        }),
        map,
        strokeColor: index === 0 ? "#FF0000" : randomColor(),
        strokeOpacity: 1,
        strokeWeight: index === 0 ? 0.7 : 1.7,
        zIndex: index === 0 ? 2030 : 2060,
      });

      polylinesLocal.push(googlePolylines);

      // extend bounds
      positions.forEach((position) =>
        bounds.extend({ lng: position[0], lat: position[1] })
      );
    });

    setPolylines(polylinesLocal);

    // fit map to this path
    props.polylines ? map.fitBounds(bounds) : null;
  }, [props.polylines]);

  return null;
};
