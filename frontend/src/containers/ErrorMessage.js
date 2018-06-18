import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

/* eslint no-underscore-dangle: ["error", { "allow": ["_error", "_issues"] }] */
class ErrorMessage extends Component {
  parseError() {
    const { error } = this.props;

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      switch (error.response.status) {
        case 400: {
          // Bad request error
          const msg = error.response.data._error.message;
          return `The sent information could not be processed. ${msg}`;
        }
        case 401: // Authentication error
          return `Authentication: ${error.response.data.msg}`;
        case 422: {
          // Unable to process error
          const issues = error.response.data._issues;
          if (issues) {
            if (issues.pattern instanceof Array) {
              return `Invalid pattern: ${issues.pattern.join(" and ")}`;
            } else if (typeof issues.pattern === "string") {
              return `Invalid pattern: ${issues.pattern}`;
            }
          }
          return "Unable to process request.";
        }
        case 404: {
          // Not found error
          if (error.response.data._error.message) {
            return "Resource not found. Please refresh the page.";
          }
          return "Server responded with unknown 404 error.";
        }
        default:
          return `Server responded with unknown error. Status: ${
            error.response.status
          }`;
      }
    } else if (error.request) {
      // The request was made but no response was received
      return "Server not responding please try again.";
    } else if (error.message) {
      // Something happened in setting up the request that triggered an Error
      return error.message;
    } else {
      // Error without message only useful in the console
      // console.log(error);
      return "";
    }
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
    }
    return null;
  }
}

ErrorMessage.propTypes = {
  error: PropTypes.shape({
    message: PropTypes.string,
    config: PropTypes.object,
    request: PropTypes.instanceOf(XMLHttpRequest),
    response: PropTypes.shape({
      data: PropTypes.shape({
        msg: PropTypes.string
      }),
      status: PropTypes.number,
      statusText: PropTypes.string,
      headers: PropTypes.object,
      config: PropTypes.object
    })
  })
};

const mapStateToProps = state => ({
  error: state.error
});

export default connect(mapStateToProps)(ErrorMessage);
