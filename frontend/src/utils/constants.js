let apiUrl;
if (process.env.NODE_ENV === "production") {
  // Production environment
  apiUrl = "https://go.company.com/";
} else {
  // Development environment
  apiUrl = "http://localhost:5000/";
}

export const API_URL = apiUrl;

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

// https://gist.github.com/dperini/729294 by user dperini on github
export const urlReg = new RegExp(
  "^" +
    // protocol identifier
    "(?:(?:https?|ftp)://)" +
    // user:pass authentication
    "(?:\\S+(?::\\S*)?@)?" +
    "(?:" +
    // IP address dotted notation octets
    // excludes loopback network 0.0.0.0
    // excludes reserved space >= 224.0.0.0
    // excludes network & broacast addresses
    // (first & last IP address of each class)
    "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
    "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
    "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
    "|" +
    // host name
    "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
    // domain name
    "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
    // TLD identifier
    "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
    // TLD may end with dot
    "\\.?" +
    ")" +
    // port number
    "(?::\\d{2,5})?" +
    // resource path
    "(?:[/?#]\\S*)?" +
    "$",
  "i"
);
