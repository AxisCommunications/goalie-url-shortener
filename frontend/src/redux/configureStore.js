import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import app_reducers from "../redux/reducers";

const middlewares = [thunk];
const reducers = [app_reducers];

// if development add support for redux dev
if (process.env.NODE_ENV !== "production") {
  reducers.push(
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  );
}

const createStoreWithMiddleware = applyMiddleware(...middlewares)(createStore);
const store = createStoreWithMiddleware(...reducers);

export default store;
