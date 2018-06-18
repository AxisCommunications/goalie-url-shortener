import { types } from "../../utils/constants";
import { api, getShortcuts } from "./api";
import setErrorWithTimeout from "./error";

function timestamp() {
  localStorage.setItem("timestamp", new Date());
}

function setLogin(accessToken, refreshToken, rights, username) {
  timestamp();
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
  localStorage.setItem("rights", rights);
  localStorage.setItem("username", username);
}

function minutesPassed() {
  const now = new Date();
  const login = new Date(localStorage.timestamp);
  return Math.floor((now.getTime() - login.getTime()) / (1000 * 60));
}

export function validLogin() {
  const requiredKeys = ["timestamp", "access_token", "refresh_token"];
  const containsAll = requiredKeys.every(x => x in localStorage);
  const validToken = minutesPassed() < 10;
  return containsAll && validToken;
}

export function loginUser(credentials) {
  return dispatch => {
    timestamp();
    dispatch({ type: types.LOGIN_REQUEST, credentials });
    return api.post("/api/login", credentials).then(
      response => {
        setLogin(
          response.data.access_token,
          response.data.refresh_token,
          response.data.rights,
          credentials.username
        );
        return dispatch({
          type: types.LOGIN_SUCCESS,
          username: credentials.username,
          rights: response.data.rights
        });
      },
      error => {
        dispatch({ type: types.LOGOUT });
        return dispatch(setErrorWithTimeout(error));
      }
    );
  };
}

export function logoutUser() {
  return dispatch => {
    localStorage.clear();
    return Promise.all([
      dispatch({ type: types.SHORTCUTS_RESET }),
      dispatch({ type: types.RESET_GUI }),
      dispatch({ type: types.LOGOUT })
    ]).then(() => dispatch(getShortcuts()));
  };
}

export function refreshSession() {
  return dispatch => {
    // Do not refresh if more than 3 minutes left
    if (minutesPassed() < 7) {
      return Promise.resolve();
    }

    const config = {
      url: "/api/refresh",
      method: "post",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("refresh_token")}`
      }
    };
    return api.request(config).then(
      response => {
        timestamp();
        localStorage.setItem("access_token", response.data.access_token);
        return Promise.resolve();
      },
      error => {
        dispatch({ type: types.SET_ERROR, error });
        return dispatch({ type: types.LOGOUT });
      }
    );
  };
}

export function activeSessionCheck() {
  return dispatch => {
    if (!validLogin()) {
      return dispatch(logoutUser());
    }
    return Promise.resolve();
  };
}
