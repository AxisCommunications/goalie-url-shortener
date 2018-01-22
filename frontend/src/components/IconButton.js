import React, { Component } from "react";
import Icon from "react-icons-kit";
import { check } from "react-icons-kit/entypo/check";
import { cross } from "react-icons-kit/entypo/cross";
import { trash } from "react-icons-kit/entypo/trash";
import { pencil } from "react-icons-kit/entypo/pencil";

export default class IconButton extends Component {
  constructor(props) {
    super(props);
    this.renderIcon = this.renderIcon.bind(this);
  }
  renderIcon(name) {
    switch (name) {
      case "check":
        return <Icon icon={check} />;
      case "cross":
        return <Icon icon={cross} />;
      case "trash":
        return <Icon icon={trash} />;
      case "pencil":
        return <Icon icon={pencil} />;
      default:
        return null;
    }
  }
  render() {
    return (
      <button
        className={"button icon " + this.props.className}
        onClick={this.props.onClick}
        disabled={this.props.disabled}
      >
        {this.renderIcon(this.props.icon)}
      </button>
    );
  }
}
