import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  loginUser,
  logoutUser,
  activeSessionCheck,
} from "../redux/actions/authentication";

import InputField from "../components/InputField";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      credentials: {
        username: "",
        password: "",
      },
    };

    this.onChange = this.onChange.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.onLogout = this.onLogout.bind(this);
  }

  componentDidMount() {
    const { logoutOnInvalidSession } = this.props;
    logoutOnInvalidSession();
  }

  onChange(event) {
    const { name, value } = event.target;
    const { credentials } = this.state;
    credentials[name] = name === "username" ? value.toLowerCase() : value;
    return this.setState({ credentials });
  }

  onLogin(event) {
    const {
      credentials: { username, password },
      credentials,
    } = this.state;
    const { login } = this.props;
    event.preventDefault();
    if (username && password) {
      login(credentials);
    }
  }

  onLogout(event) {
    const { logout } = this.props;
    event.preventDefault();
    logout();
  }

  render() {
    const { credentials } = this.state;
    const { authenticated, username } = this.props;
    if (authenticated) {
      return (
        <form id="login">
          <div className="confirm">
            <InputField
              className="button button-primary button-logout"
              name="submit"
              value={`Logout ${username}`}
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
            value={credentials.username}
            onChange={this.onChange}
          />
          <InputField
            name="password"
            value={credentials.password}
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

Login.propTypes = {
  authenticated: PropTypes.bool.isRequired,
  login: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  logoutOnInvalidSession: PropTypes.func.isRequired,
  username: PropTypes.string,
  credentials: PropTypes.shape({
    username: PropTypes.string,
    password: PropTypes.string,
  }),
};

const mapStateToProps = (state) => ({
  authenticated: state.authentication.authenticated,
  username: state.authentication.username,
});

const mapDispatchToProps = (dispatch) => ({
  login: (credentials) => dispatch(loginUser(credentials)),
  logout: () => dispatch(logoutUser()),
  logoutOnInvalidSession: () => dispatch(activeSessionCheck()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
