// /

import axios from "axios";

export interface T_userCredentials {
  username: string;
  password: string;
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
