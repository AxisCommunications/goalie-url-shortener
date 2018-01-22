import React, { Component } from "react";

export default class InputField extends Component {
  capitalizeFirstLetter(word) {
    if (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
  }
  render() {
    return (
      <input
        className={this.props.className}
        type={
          this.props.name === "password" || this.props.name === "submit"
            ? this.props.name
            : "text"
        }
        placeholder={this.capitalizeFirstLetter(this.props.name)}
        name={this.props.name}
        value={this.props.value}
        onChange={this.props.onChange}
        onClick={this.props.onClick}
        onBlur={this.props.onBlur}
        onFocus={this.props.onFocus}
      />
    );
  }
}
