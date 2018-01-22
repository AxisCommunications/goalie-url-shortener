import { connect } from "react-redux";
import React, { Component } from "react";
import safe from "safe-regex";

import IconButton from "../components/IconButton";
import InputField from "../components/InputField";
import { addShortcut } from "../redux/actions/api";
import { renderAdd } from "../redux/actions/gui";
import { url_reg } from "../utils/constants";

class AddShortcut extends Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
    this.onChange = this.onChange.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onConfirm = this.onConfirm.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  getInitialState = () => {
    const initialState = {
      shortcut: { pattern: "", target: "" },
      touched: { pattern: false, target: false },
      patternValid: "",
      targetValid: ""
    };
    return initialState;
  };

  resetInputFields() {
    this.setState(this.getInitialState());
  }

  capitalizeFirstLetter(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  confirmDisabled() {
    return (
      this.state.patternValid !== "valid" || this.state.targetValid !== "valid"
    );
  }

  validateField(fieldName, value) {
    if (this.state.touched[fieldName]) {
      switch (fieldName) {
        case "pattern":
          try {
            new RegExp(value);
            if (safe(value) && value.length > 0) {
              this.setState({ patternValid: "valid" });
            } else {
              this.setState({ patternValid: "not-valid" });
            }
          } catch (e) {
            this.setState({ patternValid: "not-valid" });
          }
          break;
        case "target":
          if (value.match(url_reg)) {
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
      this.resetInputFields();
    });
  }

  onCancel() {
    this.props.renderAdd(false);
    this.resetInputFields();
  }

  onFocus(event) {
    this.setState({
      touched: { ...this.state.touched, [event.target.name]: true }
    });
    if (event.target.name === "target" && this.state.shortcut.target === "") {
      this.setState({ shortcut: { ...this.state.shortcut, target: "http" } });
    }
  }

  onChange(event) {
    const field = event.target.name;
    this.validateField(field, event.target.value);
    const shortcut = this.state.shortcut;
    shortcut[field] = event.target.value;
    return this.setState({ shortcut });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.addShortcut(this.state.shortcut);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.visible === false) {
      this.resetInputFields();
    }
  }

  renderInput(fieldName) {
    return (
      <InputField
        className={`${fieldName} ${this.state[fieldName + "Valid"]}`}
        name={fieldName}
        value={this.state.shortcut[fieldName]}
        onBlur={() =>
          this.setState({
            touched: { ...this.state.touched, [fieldName]: true }
          })
        }
        onFocus={this.onFocus}
        onChange={this.onChange}
      />
    );
  }
  render() {
    return this.props.visible ? (
      <div className="eight columns offset-by-two add-group">
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

const mapStateToProps = (state, ownProps) => {
  return {
    visible: state.gui.add_visible
  };
};

const mapDispatchToProps = dispatch => {
  return {
    renderAdd: bool => dispatch(renderAdd(bool)),
    addShortcut: shortcut => dispatch(addShortcut(shortcut))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddShortcut);
