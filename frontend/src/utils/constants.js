let api_location;
if (process.env.NODE_ENV === "production") {
  // Production environment
  api_location = "https://go.company.com/";
} else {
  // Development environment
  api_location = "http://localhost:5000/";
}

export const API_URL = api_location;

export const types = {
  LOGIN_REQUEST: "LOGIN_REQUEST",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGOUT: "LOGOUT",
  SHORTCUTS_RESET: "SHORTCUTS_RESET",
  SHORTCUTS_REQUEST: "SHORTCUTS_REQUEST",
  SHORTCUTS_SUCCESS: "SHORTCUTS_SUCCESS",
  SHORTCUTS_FAILURE: "SHORTCUTS_FAILURE",
  ADD_SHORTCUT: "ADD_SHORTCUT",
  UPDATE_SHORTCUT: "UPDATE_SHORTCUT",
  DELETE_SHORTCUT: "DELETE_SHORTCUT",
  SET_FILTER: "SET_FILTER",
  RESET_FILTER: "RESET_FILTER",
  SET_SORT: "SET_SORT",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  CHANGE_VIEW: "CHANGE_VIEW",
  ADD_SHORTCUT_TOGGLE: "ADD_SHORTCUT_TOGGLE",
  RESET_GUI: "RESET_GUI"
};

export const url_reg = new RegExp(
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=\\]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi
  // /.+\.\w\w.*/
);
