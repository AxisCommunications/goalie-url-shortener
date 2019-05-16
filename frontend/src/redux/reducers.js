import update from "immutability-helper";
import { combineReducers } from "redux";
import { types } from "../utils/constants";
import { validLogin } from "./actions/authentication";
import queryString from "query-string";

// The state before any shortcuts are loaded
const initialShortcuts = {
  items: [],
  loading: false,
  filter: queryString.parse(window.location.hash).search
    ? queryString.parse(window.location.hash).search
    : "",
  sort: "pattern",
  pages: 1,
  page: 1
};

// The initial authentication state is loaded from localstorage if available
const initialAuthentication = {
  loading: false,
  authenticated: validLogin(),
  admin: localStorage.getItem("admin") === "true",
  username: localStorage.getItem("username")
    ? localStorage.getItem("username")
    : ""
};

// The initial gui state presented to the user
const initialGUI = {
  view: "all",
  add_visible: false
};

// Reducer for interface state
function gui(state = initialGUI, action) {
  switch (action.type) {
    case types.ADD_SHORTCUT_TOGGLE:
      return update(state, {
        add_visible: { $set: !state.add_visible }
      });
    case types.CHANGE_VIEW:
      return update(state, {
        view: { $set: action.view }
      });
    case types.RESET_GUI:
      return initialGUI;

    default:
      return state;
  }
}

// Reducer for error state
function error(state = null, action) {
  switch (action.type) {
    case types.SET_ERROR:
      return action.error;
    case types.CLEAR_ERROR:
      return null;
    default:
      return state;
  }
}

// Reducer for shortcut data state
/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
function shortcuts(state = initialShortcuts, action) {
  switch (action.type) {
    case types.SHORTCUTS_REQUEST:
      return update(state, {
        loading: { $set: true }
      });
    case types.SHORTCUTS_SUCCESS:
      return update(state, {
        items: { $set: action.items },
        loading: { $set: false },
        pages: { $set: action.pages },
        page: { $set: action.page }
      });
    case types.SHORTCUTS_FAILURE:
      return update(state, {
        pages: { $set: 1 },
        page: { $set: 1 },
        loading: { $set: false }
      });
    case types.SHORTCUTS_RESET:
      return initialShortcuts;

    case types.ADD_SHORTCUT:
      return update(state, {
        items: { $push: [action.shortcut] }
      });

    case types.DELETE_SHORTCUT: {
      const index = state.items.findIndex(item => item._id === action.id);
      return update(state, {
        items: { $splice: [[index, 1]] }
      });
    }

    case types.UPDATE_SHORTCUT: {
      const index = state.items.findIndex(
        item => item._id === action.shortcut._id
      );
      return update(state, {
        items: { $splice: [[index, 1, action.shortcut]] }
      });
    }

    case types.SET_FILTER:
      if (action.filter) {
        window.location.hash = queryString.stringify({search: action.filter});
      } else {
        window.location.hash = "";
      }
      return update(state, {
        filter: { $set: action.filter }
      });
    case types.RESET_FILTER:
      window.location.hash = "";
      return update(state, {
        filter: { $set: "" }
      });

    case types.SET_SORT:
      return update(state, {
        sort: { $set: action.sort }
      });

    default:
      return state;
  }
}

function authentication(state = initialAuthentication, action) {
  switch (action.type) {
    case types.LOGIN_REQUEST:
      return {
        ...state,
        loading: true,
        authenticated: false,
        username: action.credentials.username
      };
    case types.LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        authenticated: true,
        username: action.username,
        admin: action.admin
      };
    case types.LOGOUT:
      return {
        loading: false,
        authenticated: false,
        username: "",
        admin: false
      };

    default:
      return state;
  }
}

// Combine above reducers
const rootReducer = combineReducers({
  shortcuts,
  authentication,
  error,
  gui
});

export default rootReducer;
