import { ReactElement, useEffect, useState } from "react";
import { T_mapData } from "../Base";
import {
  APIProvider,
  AdvancedMarker,
  Map,
  useMap,
} from "@vis.gl/react-google-maps";
import React from "react";
import { randomColor, T_geoJSON } from "../Utilsj";

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
      <MapPolylines
        polylines={props.data.polylines}
        handleClick={props.handleClick}
        key={"PolylinesComp"}
      />
      <MapPolygons
        polygons={props.data.polygons}
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
        return (
          <AdvancedMarker
            key={`${marker[0]}_${marker[1]}`}
            position={{
              lng: marker[0],
              lat: marker[1],
            }}
          />
        );
      })}
    </>
  );
};

interface CustomPolygon extends google.maps.Polygon {
  id?: string;
}

export const MapPolygons = (props: {
  polygons: T_mapData["polygons"];
  handleClick: (
    type: "marker" | "polyline" | "polygon",
    target: string
  ) => void;
}): ReactElement | null => {
  const map = useMap();
  const [polygons, setPolygons] = useState<CustomPolygon[]>();
  const [selectedPolygonId, setSelectedPolygonId] = useState<string | null>(
    null
  );

  const selectPolygon = (id: string) => {
    props.handleClick("polygon", id);
    setSelectedPolygonId(id);
  };

  useEffect(() => {
    // monitor selected polygon change
    polygons?.forEach((localPolygon) => {
      if (localPolygon.id === selectedPolygonId) {
        localPolygon.setOptions({
          strokeWeight: 5,
        });
      } else {
        localPolygon.setOptions({
          strokeWeight: 0,
        });
      }
    });
  }, [selectedPolygonId]);

  useEffect(() => {
    var polygonsLocal: CustomPolygon[] = [];
    if (polygons && polygons.length) {
      polygons.forEach((polygon) => polygon.setMap(null));
      setPolygons(null);
    }
    if (props.polygons?.length) {
      props.polygons.forEach((polygonPath: T_geoJSON[][]) => {
        const polygonLocal: CustomPolygon = new google.maps.Polygon({
          paths: polygonPath.map((localPolygon) => {
            return localPolygon.map((position) => {
              return { lng: position[0], lat: position[1] };
            });
          }),
          map,
          fillColor: randomColor(),
          strokeWeight: 0,
          strokeColor: "white",
          fillOpacity: 0.7,
          zIndex: 2050,
        });

        polygonLocal.id = polygonPath[0][0][4];

        polygonLocal.addListener("click", () => {
          let polygonId = polygonPath[0][0][4];

          selectPolygon(polygonId);
        });

        polygonsLocal.push(polygonLocal);
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
