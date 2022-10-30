import { types } from "../../utils/constants";

export default function setErrorWithTimeout(error) {
  return (dispatch) => {
    setTimeout(() => {
      // clears error after timeout
      dispatch({ type: types.CLEAR_ERROR });
    }, 4000);
    return dispatch({ type: types.SET_ERROR, error });
  };
}
