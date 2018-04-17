import { types, API_URL } from "../../utils/constants";
import { setErrorWithTimeout } from "./error";
import { validLogin, refreshSession, logoutUser } from "./authentication";
import axios from "axios";
import safe from "safe-regex";

// Setup basic api configuration
export const api = axios.create({
  baseURL: API_URL,
  timeout: 5000
});

function isNotEmptyOrWhitespace(string) {
  return /\S/.test(string);
}

function buildRequestConfig(page, filter, view, username) {
  let token = view === "my" ? localStorage.getItem("access_token") : "1.1.1";
  let url = view === "all" ? "api/all" : `api/all/${username}`;
  let config = {
    url,
    method: "get",
    params: {
      page,
      sort: "pattern",
    },
    headers: { Authorization: `Bearer ${token}` }
  };
  if (isNotEmptyOrWhitespace(filter)) {
    config.params.where = {
      $or: [{ pattern: { $regex: filter } }, { target: { $regex: filter } }]
    };
  }
  return config;
}

export function getShortcuts(page = 1) {
  return (dispatch, getState) => {
    let { shortcuts, gui, authentication } = getState();
    let { filter, loading } = shortcuts;
    let { view } = gui;
    let { username, authenticated } = authentication;

    // Do not fetch new shortcuts if loading in progress or unathorized area.
    if (loading === true || (authenticated === false && view === "my")) {
      return Promise.resolve();
    }
    // Start shortcuts request
    dispatch({ type: types.SHORTCUTS_REQUEST });
    return api.request(buildRequestConfig(page, filter, view, username)).then(
      response => {
        let per_page = parseInt(response.data._meta.max_results, 10);
        let total = parseInt(response.data._meta.total, 10);
        let pages = Math.ceil(total / per_page);
        let page = parseInt(response.data._meta.page, 10);
        dispatch({
          type: types.SHORTCUTS_SUCCESS,
          items: response.data._items,
          pages,
          page
        });
      },
      error => {
        dispatch({ type: types.SHORTCUTS_FAILURE });
        dispatch(setErrorWithTimeout(error));
      }
    );
  };
}

export function addShortcut(shortcut) {
  return (dispatch, getState) => {
    if (!validLogin()) {
      return dispatch(logoutUser());
    }
    dispatch(refreshSession());

    let { shortcuts, authentication } = getState();
    let { loading } = shortcuts;
    let { username, authenticated } = authentication;

    // Do not add shortcut if loading in progress or unathorized
    if (authenticated === false || loading === true) {
      return Promise.resolve();
    }

    let config = {
      url: "api",
      method: "post",
      data: shortcut,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`
      }
    };

    return api.request(config).then(
      response => {
        let response_shortcut = {
          _id: response.data._id,
          pattern: shortcut.pattern,
          target: shortcut.target,
          ldapuser: username
        };
        dispatch({ type: types.ADD_SHORTCUT_TOGGLE });
        return dispatch({
          type: types.ADD_SHORTCUT,
          shortcut: response_shortcut
        });
      },
      error => dispatch(setErrorWithTimeout(error))
    );
  };
}

export function updateShortcut(shortcut) {
  return (dispatch, getState) => {
    if (!validLogin()) {
      return dispatch(logoutUser());
    }
    dispatch(refreshSession());

    let { shortcuts, authentication } = getState();
    let { loading, items } = shortcuts;
    let { authenticated } = authentication;
    // Do not patch shortcut if loading in progress or unathorized
    if (loading === true || authenticated === false) {
      return Promise.resolve();
    }

    let { pattern, target } = shortcut;
    let index = items.findIndex(item => item._id === shortcut._id);
    let old_pattern = items[index].pattern;

    let config = {
      url: `/api/${shortcut._id}`,
      method: "patch",
      data: old_pattern === pattern ? { target } : { pattern, target },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`
      }
    };

    return api.request(config).then(
      response => {
        return dispatch({
          type: types.UPDATE_SHORTCUT,
          shortcut
        });
      },
      error => dispatch(setErrorWithTimeout(error))
    );
  };
}

export function deleteShortcut(id) {
  return (dispatch, getState) => {
    if (!validLogin()) {
      return dispatch(logoutUser());
    }
    dispatch(refreshSession());

    let { shortcuts, authentication } = getState();
    let { loading } = shortcuts;
    let { authenticated } = authentication;
    // Do not delete shortcut if loading in progress or unathorized
    if (loading === true || authenticated === false) {
      return Promise.resolve(); // not authenticated or loading in progress
    }

    let config = {
      url: `/api/${id}`,
      method: "delete",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`
      }
    };

    return api
      .request(config)
      .then(
        () => dispatch({ type: types.DELETE_SHORTCUT, id }),
        error => dispatch(setErrorWithTimeout(error))
      );
  };
}

export function filter_result(filter = "") {
  return (dispatch, getState) => {
    if (filter === getState().shortcuts.filter) {
      return Promise.resolve(); // No change of filter
    } else if (safe(filter)) {
      dispatch({
        type: types.SET_FILTER,
        filter
      });
      return dispatch(getShortcuts());
    } else {
      let error = { message: "Entered filter is not considered safe." };
      return dispatch(setErrorWithTimeout(error));
    }
  };
}
