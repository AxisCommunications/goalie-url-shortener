import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import appReducers from "../redux/reducers";

const middlewares = [thunk];
const reducers = [appReducers];

// if development add support for redux dev
/* eslint-disable no-underscore-dangle */
if (process.env.NODE_ENV !== "production") {
  reducers.push(
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  );
}

const createStoreWithMiddleware = applyMiddleware(...middlewares)(createStore);
const store = createStoreWithMiddleware(...reducers);

export default store;
