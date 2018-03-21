import React, { Component } from "react";

export default class InputField extends Component {
  capitalizeFirstLetter(word) {
    if (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
  }
  render() {
    let {...other} = this.props;
    return (
      <input
        type={
          this.props.name === "password" || this.props.name === "submit"
            ? this.props.name
            : "text"
        }
        placeholder={this.capitalizeFirstLetter(this.props.name)}
        {...other} // load props to input
      />
    );
  }
}
