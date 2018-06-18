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
    this.props.changeView("all");
  }

  handleMy() {
    this.props.changeView("my");
  }

  handleAdd() {
    this.props.renderAdd();
  }

  allButtonClass() {
    return this.props.view === "all"
      ? "browse-all button-primary"
      : "browse-all";
  }

  myButtonClass() {
    return this.props.view === "my"
      ? "button browse-my button-primary"
      : "button browse-my";
  }

  addButtonClass() {
    return `button add-shortcut ${
      this.props.add_visible ? "button-primary" : ""
    }`;
  }

  render() {
    return (
      <div className="row text-center button-group">
        <button className={this.allButtonClass()} onClick={this.handleAll}>
          All Shortcuts
        </button>
        <button
          className={this.myButtonClass()}
          onClick={this.handleMy}
          disabled={!this.props.authenticated}
        >
          My Shortcuts
        </button>
        <button
          className={this.addButtonClass()}
          disabled={!this.props.authenticated}
          onClick={this.handleAdd}
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
  authenticated: PropTypes.bool.isRequired
};

const mapStateToProps = state => ({
  authenticated: state.authentication.authenticated,
  view: state.gui.view,
  add_visible: state.gui.add_visible
});

const mapDispatchToProps = dispatch => ({
  changeView: view => dispatch(changeView(view)),
  renderAdd: bool => dispatch(renderAdd(bool))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TopButtons);
