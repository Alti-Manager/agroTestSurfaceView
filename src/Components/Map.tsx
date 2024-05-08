import { ReactElement, useEffect, useState } from "react";
import { T_mapData } from "../Base";
import {
  APIProvider,
  AdvancedMarker,
  Map,
  useMap,
} from "@vis.gl/react-google-maps";
import React from "react";
import { randomColor } from "../Utilsj";

export const BaseMap = (props: T_mapData): ReactElement | null => {
  return (
    <APIProvider
      apiKey="AIzaSyCbmoTCniO_4-qigA7MBbEYI2D2o1OG400"
      libraries={["core", "maps", "marker"]}
    >
      <BaseMapComp {...props} />
    </APIProvider>
  );
};

export const BaseMapComp = (props: T_mapData): ReactElement | null => {
  const map = useMap();
  return (
    <Map
      mapId="mainMap"
      defaultCenter={{ lat: 47.492829, lng: 27.321712 }}
      defaultZoom={10}
      mapTypeId="hybrid"
    >
      <MapPolylines polylines={props.polylines} key={"PolylinesComp"} />
      <MapPolygons polygons={props.polygons} key="PolygonsComp" />
    </Map>
  );
};

export const MapPolygons = (props: {
  polygons: T_mapData["polygons"];
}): ReactElement | null => {
  const map = useMap();
  const [polygons, setPolygons] = useState<google.maps.Polygon[]>();

  useEffect(() => {
    var polygonsLocal: google.maps.Polygon[] = [];
    if (polygons && polygons.length) {
      polygons.forEach((polygon) => polygon.setMap(null));
      setPolygons(null);
    }
    if (props.polygons?.length) {
      props.polygons.forEach((polygonPath) => {
        let pathsCollection: [number, number][] = [];

        if (polygonPath[0] && Array.isArray(polygonPath[0][0][0])) {
          // one more path level
          polygonPath.forEach((polygonPath2: any) => {
            polygonPath2.forEach((path: any) => {
              pathsCollection.push(path);
            });
          });
        } else {
          pathsCollection.push(polygonPath[0]);
        }

        pathsCollection.forEach((paths: any) => {
          let polygonLocal = new google.maps.Polygon({
            paths: [
              paths.map((position: [number, number]) => {
                return { lng: position[0], lat: position[1] };
              }),
            ],
            map,
            fillColor: randomColor(),
            strokeWeight: 0,
            strokeColor: "black",
            fillOpacity: 0.7,
            zIndex: 2050,
          });

          polygonsLocal.push(polygonLocal);
        });
      });
    }

    if (polygonsLocal.length) {
      setPolygons(polygonsLocal);
    }
  }, [props.polygons]);

  return null;
};

export const MapPolylines = (props: {
  polylines: T_mapData["polylines"];
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
        zIndex: index === 0 ? 2030 : 2040,
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
