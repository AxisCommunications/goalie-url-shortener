/* eslint-disable camelcase */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { changeView, renderAdd } from "../redux/actions/gui";

class TopButtons extends Component {
  constructor(props) {
    super(props);
    this.handleAdd = this.handleAdd.bind(this);
    this.handleAll = this.handleAll.bind(this);
    this.handleMy = this.handleMy.bind(this);
  }

  handleAll() {
    const { changeView: thisChangeView } = this.props;
    thisChangeView("all");
  }

  handleMy() {
    const { changeView: thisChangeView } = this.props;
    thisChangeView("my");
  }

  handleAdd() {
    const { renderAdd: thisRenderAdd } = this.props;
    thisRenderAdd();
  }

  allButtonClass() {
    const { view } = this.props;
    return view === "all" ? "browse-all button-primary" : "browse-all";
  }

  myButtonClass() {
    const { view } = this.props;
    return view === "my"
      ? "button browse-my button-primary"
      : "button browse-my";
  }

  addButtonClass() {
    const { add_visible } = this.props;
    return `button add-shortcut ${add_visible ? "button-primary" : ""}`;
  }

  render() {
    const { authenticated } = this.props;
    return (
      <div className="row text-center button-group">
        <button
          className={this.allButtonClass()}
          onClick={this.handleAll}
          type="button"
        >
          All Shortcuts
        </button>
        <button
          className={this.myButtonClass()}
          onClick={this.handleMy}
          disabled={!authenticated}
          type="button"
        >
          My Shortcuts
        </button>
        <button
          className={this.addButtonClass()}
          disabled={!authenticated}
          onClick={this.handleAdd}
          type="button"
        >
          Add Shortcut
        </button>
      </div>
    );
  }
}

TopButtons.propTypes = {
  changeView: PropTypes.func.isRequired,
  renderAdd: PropTypes.func.isRequired,
  view: PropTypes.string.isRequired,
  add_visible: PropTypes.bool.isRequired,
  authenticated: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  authenticated: state.authentication.authenticated,
  view: state.gui.view,
  add_visible: state.gui.add_visible,
});

const mapDispatchToProps = (dispatch) => ({
  changeView: (view) => dispatch(changeView(view)),
  renderAdd: (bool) => dispatch(renderAdd(bool)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TopButtons);
