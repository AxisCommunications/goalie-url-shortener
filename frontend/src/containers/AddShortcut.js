import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import IconButton from "../components/IconButton";
import InputField from "../components/InputField";
import { addShortcut } from "../redux/actions/api";
import { renderAdd } from "../redux/actions/gui";
import { urlReg } from "../utils/constants";

const initialState = {
  shortcut: { pattern: "", target: "" },
  touched: { pattern: false, target: false },
  patternValid: "",
  targetValid: ""
};

class AddShortcut extends Component {
  constructor(props) {
    super(props);
    this.state = { ...initialState };
    this.onChange = this.onChange.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onConfirm = this.onConfirm.bind(this);
    this.onCancel = this.onCancel.bind(this);
  }

  reset() {
    this.setState({ ...initialState });
  }

  confirmDisabled() {
    return (
      this.state.patternValid !== "valid" || this.state.targetValid !== "valid"
    );
  }

  validateInput(fieldName, value) {
    if (this.state.touched[fieldName]) {
      switch (fieldName) {
        case "pattern":
          try {
            RegExp(value);
            if (value.length > 0) {
              this.setState({ patternValid: "valid" });
            } else {
              this.setState({ patternValid: "not-valid" });
            }
          } catch (e) {
            this.setState({ patternValid: "not-valid" });
          }
          break;
        case "target":
          if (value.match(urlReg)) {
            this.setState({ targetValid: "valid" });
          } else {
            this.setState({ targetValid: "not-valid" });
          }
          break;
        default:
          break;
      }
    }
  }

  onConfirm() {
    this.props.addShortcut(this.state.shortcut).then(() => {
      if (!this.props.visible) {
        this.reset();
      }
    });
  }

  onCancel() {
    this.props.renderAdd(false);
    this.reset();
  }

  onFocus(event) {
    this.setState({
      touched: { ...this.state.touched, [event.target.name]: true }
    });
    if (event.target.name === "target" && this.state.shortcut.target === "") {
      this.setState({
        shortcut: { ...this.state.shortcut, target: "https://" }
      });
    }
  }

  onChange(event) {
    const { value } = event.target;
    const { name } = event.target;
    this.validateInput(name, value);
    return this.setState({
      shortcut: {
        ...this.state.shortcut,
        [name]: value
      }
    });
  }

  renderInput(fieldName) {
    return (
      <InputField
        className={`${fieldName} ${this.state[`${fieldName}Valid`]}`}
        name={fieldName}
        value={this.state.shortcut[fieldName]}
        onBlur={() =>
          this.setState({
            touched: { ...this.state.touched, [fieldName]: true }
          })
        }
        onFocus={this.onFocus}
        onChange={this.onChange}
        autoFocus={fieldName === "pattern"}
      />
    );
  }
  render() {
    return this.props.visible ? (
      <div className="ten columns offset-by-one add-group">
        {this.renderInput("pattern")}
        {this.renderInput("target")}
        <IconButton
          icon="check"
          className="button-add-confirm"
          onClick={this.onConfirm}
          disabled={this.confirmDisabled()}
        />
        <IconButton
          icon="cross"
          className="button-add-cancel"
          onClick={this.onCancel}
        />
      </div>
    ) : null;
  }
}

AddShortcut.propTypes = {
  addShortcut: PropTypes.func.isRequired,
  renderAdd: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired
};

const mapStateToProps = state => ({
  visible: state.gui.add_visible
});

const mapDispatchToProps = dispatch => ({
  renderAdd: bool => dispatch(renderAdd(bool)),
  addShortcut: shortcut => dispatch(addShortcut(shortcut))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddShortcut);
