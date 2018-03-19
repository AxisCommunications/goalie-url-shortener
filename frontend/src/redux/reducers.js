import { combineReducers } from "redux";
import { types } from "../utils/constants";
import update from "immutability-helper";

// The state before any shortcuts are loaded
const inital_shortcuts = {
  items: [],
  loading: false,
  filter: "",
  pages: 1,
  page: 1
};

// The initial authentication state is loaded from localstorage if available
const initial_authentication = {
  loading: false,
  authenticated: localStorage.getItem("access_token") ? true : false,
  rights: localStorage.getItem("rights") ? localStorage.getItem("rights") : "",
  username: localStorage.getItem("username")
    ? localStorage.getItem("username")
    : ""
};

// The initial gui state presented to the user
const initial_gui = {
  view: "all",
  add_visible: false
};

// Reducer for interface state
function gui(state = initial_gui, action) {
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
      return initial_gui;

    default:
      return state;
  }
}

// Reducer for error state
function error(state = null, action) {
  switch (action.type) {
    case types.SET_ERROR:
      return (state = action.error);
    case types.CLEAR_ERROR:
      return (state = null);
    default:
      return state;
  }
}

// Reducer for shortcut data state
function shortcuts(state = inital_shortcuts, action) {
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
      return inital_shortcuts;

    case types.ADD_SHORTCUT:
      return update(state, {
        items: { $push: [action.shortcut] }
      });

    case types.DELETE_SHORTCUT:
      let index = state.items.findIndex(item => item._id === action.id);
      return update(state, {
        items: { $splice: [[index, 1]] }
      });

    case types.UPDATE_SHORTCUT:
      index = state.items.findIndex(item => {
        return item._id === action.shortcut._id;
      });
      return update(state, {
        items: { $splice: [[index, 1, action.shortcut]] }
      });

    case types.SET_FILTER:
      return update(state, {
        filter: { $set: action.filter }
      });
    case types.RESET_FILTER:
      return update(state, {
        filter: { $set: "" }
      });

    default:
      return state;
  }
}

function authentication(state = initial_authentication, action) {
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
        rights: action.rights
      };
    case types.LOGOUT:
      return {
        loading: false,
        authenticated: false,
        username: ""
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
