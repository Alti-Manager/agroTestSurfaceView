// /

import axios, { Axios, AxiosError } from "axios";
import moment, { Moment } from "moment";

export interface T_userCredentials {
  username: string;
  password: string;
}

export interface T_machinery {
  _id?: string;
  name?: string;
  chassiSN: string;
  producer: string;
  model: string;
  year?: string;
  machineryType:
    | "tractor"
    | "combine"
    | "sprayer"
    | "auto"
    | "frontLoader"
    | "backhoe"
    | "cornCastrator"
    | "mower";
  serviceInterval: number;
  details?: string;
  deviceId: string;
  farmId: string;
  tehnicalDetails?: string;
  plateNo?: string;
  lastRevision?: Date;
  lastPositionData?: T_Position;
}

export interface T_Position {
  deviceid: string;
  time: string;
  latitude: string;
  longitude: string;
  altitude?: string;
  speed?: string;
  direction?: string;
  fuelrate?: string;
  enginespeed?: string;
}

export type T_geoJSON = [number, number, string?, number?, string?];
export interface T_work {
  _id?: string;
  start: Date;
  end: Date;
  coordinates: T_geoJSON[][];
  machinaryId?: string;
  totalConsumption?: number;
  totalTime?: number;
  workingArea?: number;
  workingWidth?: number;
}

export interface T_surface {
  _id?: string;
  name: string;
  coordinates: T_geoJSON[][];
  cmt?: string;
  desc?: string;
  src?: string;
  start: Date;
  end?: Date;
  sourceSurface?: string;
  sourceType: "import" | "modified" | "manual";
  farmId: string;
}

export type T_tourn = {
  firstSegment: T_geoJSON[];
  lastSegment: T_geoJSON[];
};

export interface T_Path {
  path: T_geoJSON[];
  distance: number;
  consumption: number;
  timeGap: number;
  stationaryTime: number;
  works?: T_work[];
  tourns?: T_tourn[];
  segments?: number[][][][];
}

// login at open
export const authUser = (
  userCredentials: T_userCredentials,
  cb: (done: boolean) => void
) => {
  axios({
    method: "get",
    params: userCredentials,
    url: `${process.env.server}/api2/auth/login`,
  })
    .then((response) => {
      const token = response.data.token;

      // save token to cookies
      localStorage.setItem("token", token);

      cb(true);
    })
    .catch((e) => {
      cb(false);
      console.error(JSON.stringify(e, null, 1));
    });
};

export const getMachinerys = async (
  farmId: string,
  cb: (machineryes: T_machinery[]) => void
) => {
  const token = localStorage.getItem("token"); // Preia tokenul utilizatorului

  axios({
    method: "get",
    params: { farmId },
    url: `${process.env.server}/api2/machinery/getmachinerys`,
    headers: {
      Authorization: `JWT ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      cb(response.data ? response.data : []);
    })
    .catch(async (e) => {
      console.error(await e, " >>>> on getMachinerys fn ");
      cb([]);
    });
};

export const getSurfaces = async (
  farmId: string
): Promise<T_surface[] | null> => {
  const token = localStorage.getItem("token"); // Preia tokenul utilizatorului
  return axios({
    method: "get",
    url: `${process.env.server}/api2/surfaces/getSurfaces`,
    params: { farmId },
    headers: {
      Authorization: `JWT ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.status === 200) {
        return response.data;
      } else {
        return null;
      }
    })
    .catch((e: AxiosError): void => {
      console.error(e, " >>>> on getWorks");

      return null;
    });
};

export const getWorks = (
  data: {
    deviceId: string;
    start: Moment;
    end: Moment;
  },
  cb: (
    data: {
      works: T_work[];
      points: T_geoJSON[];
      segments: T_geoJSON[][];
    } | null
  ) => void
) => {
  const token = localStorage.getItem("token"); // Preia tokenul utilizatorului

  axios({
    method: "get",
    url: `${process.env.server}/api2/machinery/devCalculateWorks`,
    params: {
      deviceId: data.deviceId,
      start: data.start.toISOString(),
      end: data.end.toISOString(),
    },
    headers: {
      Authorization: `JWT ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.status === 200) {
        cb(response.data);
      } else {
        cb(null);
      }
    })
    .catch((e: AxiosError) => {
      console.error(e.response, " >>>> on getWorks");

      cb(null);
    });
};

export const getMachineryPath = (
  data: {
    deviceId: string;
    start: Moment;
    end: Moment;
  },
  cb: (positions: T_Path | null, error?: string | null) => void
) => {
  const token = localStorage.getItem("token"); // Preia tokenul utilizatorului

  axios({
    method: "get",
    url: `${process.env.server}/api2/machinery/path`,
    params: {
      deviceId: data.deviceId,
      start: data.start.toISOString(),
      end: data.end.toISOString(),
    },
    headers: {
      Authorization: `JWT ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.status === 200) {
        cb(response.data, null);
      } else {
        cb(null, "Răspuns greșit");
      }
    })
    .catch((e: AxiosError): void => {
      console.error(JSON.stringify(e, null, 2), " >>>> on getPath");
      cb(null, "Răspuns greșit");
    });
};

// generate random color
export const randomColor = (color = "any") => {
  let r, g, b;

  switch (color.toLowerCase()) {
    case "red":
      // Red is high, green and blue are low
      r = Math.floor(Math.random() * 56) + 200;
      g = Math.floor(Math.random() * 50);
      b = Math.floor(Math.random() * 50);
      break;
    case "yellow":
      // Red and green are high, blue is low
      r = Math.floor(Math.random() * 56) + 200;
      g = Math.floor(Math.random() * 56) + 200;
      b = Math.floor(Math.random() * 50);
      break;
    case "green":
      // Green is high, red and blue are low
      r = Math.floor(Math.random() * 50);
      g = Math.floor(Math.random() * 56) + 200;
      b = Math.floor(Math.random() * 50);
      break;
    case "blue":
      // Blue is high, red and green are low
      r = Math.floor(Math.random() * 50);
      g = Math.floor(Math.random() * 50);
      b = Math.floor(Math.random() * 56) + 200;
      break;
    case "any":
    default:
      // Generate random RGB for any color
      r = Math.floor(Math.random() * 256);
      g = Math.floor(Math.random() * 256);
      b = Math.floor(Math.random() * 256);
      break;
  }

  return `rgb(${r}, ${g}, ${b})`;
};
