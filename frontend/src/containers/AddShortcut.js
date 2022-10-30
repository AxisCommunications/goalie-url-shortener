import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import IconButton from "../components/IconButton";
import InputField from "../components/InputField";
import { addShortcut } from "../redux/actions/api";
import { renderAdd } from "../redux/actions/gui";
import { urlReg } from "../utils/constants";

const initialState = {
  shortcut: {
    pattern: "",
    target: "",
  },
  touched: { pattern: false, target: false },
  patternValid: "",
  targetValid: "",
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

  onChange(event) {
    const { value } = event.target;
    const { name } = event.target;
    this.validateInput(name, value);
    return this.setState((prevState) => ({
      shortcut: {
        ...prevState.shortcut,
        [name]: value,
      },
    }));
  }

  onFocus(event) {
    const { touched, shortcut } = this.state;
    this.setState({
      touched: { ...touched, [event.target.name]: true },
    });
    if (event.target.name === "target" && shortcut.target === "") {
      this.setState({
        shortcut: { ...shortcut, target: "https://" },
      });
    }
  }

  onCancel() {
    const { renderAdd: thisRenderAdd } = this.props;
    thisRenderAdd(false);
    this.reset();
  }

  onConfirm() {
    const { shortcut: oldShortcut } = this.state;
    const { username, addShortcut: thisAddShortcut } = this.props;
    const shortcut = {
      ...oldShortcut,
      ldapuser: username,
    };
    thisAddShortcut(shortcut).then(() => {
      const { visible } = this.props;
      if (!visible) {
        this.reset();
      }
    });
  }

  reset() {
    this.setState({ ...initialState });
  }

  confirmDisabled() {
    const { patternValid, targetValid } = this.state;
    return patternValid !== "valid" || targetValid !== "valid";
  }

  validateInput(fieldName, value) {
    const { touched } = this.state;
    if (touched[fieldName]) {
      switch (fieldName) {
        case "pattern":
          try {
            RegExp(value);
            if (
              value.length > 0 &&
              value.toLowerCase() !== "api" &&
              !value.toLowerCase().startsWith("api/")
            ) {
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

  renderInput(fieldName) {
    const { shortcut, touched } = this.state;
    return (
      <InputField
        // eslint-disable-next-line react/destructuring-assignment
        className={`${fieldName} ${this.state[`${fieldName}Valid`]}`}
        name={fieldName}
        value={shortcut[fieldName]}
        onBlur={() =>
          this.setState({
            touched: { ...touched, [fieldName]: true },
          })
        }
        onFocus={this.onFocus}
        onChange={this.onChange}
        autoFocus={fieldName === "pattern"}
      />
    );
  }

  render() {
    const { visible } = this.props;
    return visible ? (
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
  visible: PropTypes.bool.isRequired,
  username: PropTypes.string,
};

const mapStateToProps = (state) => ({
  visible: state.gui.add_visible,
  username: state.authentication.username,
});

const mapDispatchToProps = (dispatch) => ({
  renderAdd: (bool) => dispatch(renderAdd(bool)),
  addShortcut: (shortcut) => dispatch(addShortcut(shortcut)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AddShortcut);
