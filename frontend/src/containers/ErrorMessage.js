import React, { Component } from "react";
import { connect } from "react-redux";

class ErrorMessage extends Component {
  parseError() {
    let error = this.props.error;
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      switch (error.response.status) {
        case 400:
          return this.badRequestError(error.response.data);
        case 401:
          return this.authenticationError(error.response.data);
        case 422:
          // Handle pattern issues on posting new shortcut
          return this.unableToProcessError(error.response.data);
        case 404:
          // Not found
          return this.notFoundError(error.response.data);
        default:
          return (
            "Server responded with unknown error. Status: " +
            error.response.status
          );
      }
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser
      return "Server not responding please try again.";
    } else if (error.message) {
      // Something happened in setting up the request that triggered an Error
      return error.message;
    } else {
      // Error without message only useful in the console
      console.log(error);
    }
  }

  badRequestError(errorData) {
    return (
      "The sent information could not be processed. " + errorData._error.message
    );
  }

  authenticationError(errorData) {
    return `Authentication: ${errorData.msg}`;
  }

  unableToProcessError(errorData) {
    if (errorData._issues) {
      if (errorData._issues.pattern instanceof Array) {
        return "Invalid pattern: " + errorData._issues.pattern.join(" and ");
      } else if (typeof errorData._issues.pattern === "string") {
        return "Invalid pattern: " + errorData._issues.pattern;
      }
    }
    return "Unable to process request.";
  }

  notFoundError(errorData) {
    if (errorData._error.message) {
      return "The requested action could not be completed. Please refresh the page and try again.";
    }
    return "Server responded with unknown not found error.";
  }

  render() {
    if (this.props.error) {
      return (
        <div className="row eight columns offset-by-two">
          <div className="error-message">
            <p>Error: {this.parseError()}</p>
          </div>
        </div>
      );
    } else {
      return null;
    }
  }
}

const mapStateToProps = state => {
  return {
    error: state.error
  };
};

const mapDispatchToProps = dispatch => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ErrorMessage);
