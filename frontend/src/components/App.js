import React from "react";
import { Provider } from "react-redux";

import Header from "./Header";
import TopButtons from "../containers/TopButtons";
import AddShortcut from "../containers/AddShortcut";
import Footer from "./Footer";
import SearchBar from "../containers/SearchBar";
import Pagination from "../containers/Pagination";
import Login from "../containers/Login";
import ShortcutsTable from "../containers/ShortcutsTable";
import ErrorMessage from "../containers/ErrorMessage";
import store from "../redux/configureStore";

export default function App() {
  return (
    <Provider store={store}>
      <div>
        <Login />
        <div className="container">
          <Header />
          <ErrorMessage />
          <TopButtons />
          <div className="row separator">
            <SearchBar />
          </div>
          <div className="row">
            <AddShortcut />
          </div>
          <div key="table" className="row">
            <div className="twelve columns">
              <ShortcutsTable />
              <p className="separator " />
            </div>
          </div>
          <div>
            <Pagination />
          </div>
          <Footer />
        </div>
      </div>
    </Provider>
  );
}
