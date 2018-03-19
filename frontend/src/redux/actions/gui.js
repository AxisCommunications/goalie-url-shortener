import { types } from "../../utils/constants";
import { validLogin, logoutUser, refreshSession } from "./authentication";
import { getShortcuts } from "./api";

export function changeView(view = "all") {
  return (dispatch, getState) => {
    if (!validLogin()) {
      return dispatch(logoutUser());
    }
    dispatch(refreshSession());
    if (view === getState().shortcuts.view) {
      return Promise.resolve(); // Already on the correct view
    } else {
      dispatch({ type: types.CHANGE_VIEW, view });
      if (getState().shortcuts.filter !== "") {
        dispatch({ type: types.RESET_FILTER });
      }
      return dispatch(getShortcuts());
    }
  };
}

export function renderAdd() {
  return (dispatch, getState) => {
    if (!validLogin()) {
      return dispatch(logoutUser());
    }
    dispatch(refreshSession());
    dispatch({ type: types.ADD_SHORTCUT_TOGGLE });
  };
}
