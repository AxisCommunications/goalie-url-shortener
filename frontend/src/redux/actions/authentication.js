import jwtDecode from "jwt-decode";
import { types } from "../../utils/constants";
// eslint-disable-next-line import/no-cycle
import { api, getShortcuts } from "./api";
import setErrorWithTimeout from "./error";

export function validLogin() {
  const requiredKeys = ["token", "username", "admin", "exp"];
  const containsAll = requiredKeys.every(x => x in localStorage);
  const now = new Date();
  const expires = new Date(localStorage.getItem("exp"));

  return containsAll && expires > now;
}

export function loginUser(credentials) {
  return dispatch => {
    dispatch({ type: types.LOGIN_REQUEST, credentials });
    return api.post("/api/login", credentials).then(
      response => {
        const { token } = response.data;
        const { identity, admin, exp, iat } = jwtDecode(token);

        localStorage.setItem("token", token);
        localStorage.setItem("username", identity);
        localStorage.setItem("admin", admin);
        localStorage.setItem("exp", new Date(exp * 1000));
        localStorage.setItem("iat", new Date(iat * 1000));

        return dispatch({
          type: types.LOGIN_SUCCESS,
          username: identity,
          admin
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
    const expires = new Date(localStorage.getItem("exp"));
    const differenceInMs = expires - new Date();
    const differenceInMin = Math.round(differenceInMs / 60000);
    if (differenceInMin > 3) {
      return Promise.resolve();
    }

    return api
      .post("/api/refresh", { token: localStorage.getItem("token") })
      .then(
        response => {
          localStorage.setItem("token", response.data.token);
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
