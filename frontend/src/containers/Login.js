import React, { Component } from "react";
import { connect } from "react-redux";
import {
  loginUser,
  logoutUser,
  activeSessionCheck
} from "../redux/actions/authentication";

import InputField from "../components/InputField";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      credentials: {
        username: "",
        password: ""
      }
    };

    this.onChange = this.onChange.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.onLogout = this.onLogout.bind(this);
  }

  componentDidMount() {
    this.props.logoutOnInvalidSession();
  }

  onChange(event) {
    const { name, value } = event.target;
    const { credentials } = this.state;
    credentials[name] = name === "username" ? value.toLowerCase() : value;
    return this.setState({ credentials });
  }

  onLogin(event) {
    event.preventDefault();
    this.props.login(this.state.credentials);
  }

  onLogout(event) {
    event.preventDefault();
    this.props.logout();
  }

  render() {
    if (this.props.authenticated) {
      return (
        <form id="login">
          <div className="confirm">
            <InputField
              className="button button-primary button-logout"
              name="submit"
              value={`Logout ${this.props.username}`}
              onClick={this.onLogout}
            />
          </div>
        </form>
      );
    }
    return (
      <form id="login">
        <div className="credentials">
          <InputField
            name="username"
            value={this.state.credentials.username}
            onChange={this.onChange}
          />
          <InputField
            name="password"
            value={this.state.credentials.password}
            onChange={this.onChange}
          />
        </div>
        <div className="confirm">
          <InputField
            className="button button-primary button-login"
            name="submit"
            value="Login"
            onClick={this.onLogin}
          />
        </div>
      </form>
    );
  }
}

const mapStateToProps = state => {
  return {
    loading: state.authentication.loading,
    error: state.authentication.error,
    authenticated: state.authentication.authenticated,
    username: state.authentication.username
  };
};

const mapDispatchToProps = dispatch => {
  return {
    login: credentials => dispatch(loginUser(credentials)),
    logout: () => dispatch(logoutUser()),
    logoutOnInvalidSession: () => dispatch(activeSessionCheck())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
