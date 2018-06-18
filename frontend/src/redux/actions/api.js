import axios from "axios";
import safe from "safe-regex";
import { types, API_URL } from "../../utils/constants";
import setErrorWithTimeout from "./error";
import { validLogin, refreshSession, logoutUser } from "./authentication";

// Setup basic api configuration
export const api = axios.create({
  baseURL: API_URL,
  timeout: 5000
});

function isNotEmptyOrWhitespace(string) {
  return /\S/.test(string);
}

function buildRequestConfig(page, filter, sort, view, username) {
  const token = view === "my" ? localStorage.getItem("access_token") : "1.1.1";
  const url = view === "all" ? "api/all" : `api/all/${username}`;
  const config = {
    url,
    method: "get",
    params: {
      page,
      sort
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

/* eslint no-underscore-dangle: ["error", { "allow": ["_id", "_items", "_meta"] }] */
export function getShortcuts(page = 1) {
  return (dispatch, getState) => {
    const { shortcuts, gui, authentication } = getState();
    const { filter, sort, loading } = shortcuts;
    const { view } = gui;
    const { username, authenticated } = authentication;

    // Do not fetch new shortcuts if loading in progress or unathorized area.
    if (loading === true || (authenticated === false && view === "my")) {
      return Promise.resolve();
    }
    // Start shortcuts request
    dispatch({ type: types.SHORTCUTS_REQUEST });
    return api
      .request(buildRequestConfig(page, filter, sort, view, username))
      .then(
        response => {
          const perPage = parseInt(response.data._meta.max_results, 10);
          const total = parseInt(response.data._meta.total, 10);
          const pages = Math.ceil(total / perPage);
          const currentPage = parseInt(response.data._meta.page, 10);
          dispatch({
            type: types.SHORTCUTS_SUCCESS,
            items: response.data._items,
            pages,
            page: currentPage
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

    const { shortcuts, authentication } = getState();
    const { loading } = shortcuts;
    const { username, authenticated } = authentication;

    // Do not add shortcut if loading in progress or unathorized
    if (authenticated === false || loading === true) {
      return Promise.resolve();
    }

    const config = {
      url: "api",
      method: "post",
      data: shortcut,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`
      }
    };

    return api.request(config).then(
      response => {
        const responseShortcut = {
          _id: response.data._id,
          pattern: shortcut.pattern,
          target: shortcut.target,
          ldapuser: username
        };
        dispatch({ type: types.ADD_SHORTCUT_TOGGLE });
        return dispatch({
          type: types.ADD_SHORTCUT,
          shortcut: responseShortcut
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

    const { shortcuts, authentication } = getState();
    const { loading, items } = shortcuts;
    const { authenticated } = authentication;
    // Do not patch shortcut if loading in progress or unathorized
    if (loading === true || authenticated === false) {
      return Promise.resolve();
    }

    const { pattern, target } = shortcut;
    const index = items.findIndex(item => item._id === shortcut._id);
    const oldPattern = items[index].pattern;

    const config = {
      url: `/api/${shortcut._id}`,
      method: "patch",
      data: oldPattern === pattern ? { target } : { pattern, target },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`
      }
    };

    return api.request(config).then(
      () =>
        dispatch({
          type: types.UPDATE_SHORTCUT,
          shortcut
        }),
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

    const { shortcuts, authentication } = getState();
    const { loading } = shortcuts;
    const { authenticated } = authentication;
    // Do not delete shortcut if loading in progress or unathorized
    if (loading === true || authenticated === false) {
      return Promise.resolve(); // not authenticated or loading in progress
    }

    const config = {
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

export function sortResult(sort = "pattern") {
  return (dispatch, getState) => {
    if (sort === getState().shortcuts.sort) {
      return Promise.resolve(); // No change of sort
    }
    dispatch({
      type: types.SET_SORT,
      sort
    });
    return dispatch(getShortcuts());
  };
}

export function filterResult(filter = "") {
  return (dispatch, getState) => {
    if (filter === getState().shortcuts.filter) {
      return Promise.resolve(); // No change of filter
    } else if (safe(filter)) {
      dispatch({
        type: types.SET_FILTER,
        filter
      });
      return dispatch(getShortcuts());
    }
    // Unsafe filter, no error message since it was annoying
    return Promise.resolve();
  };
}
