import React from "react";
import PropTypes from "prop-types";
import Icon from "react-icons-kit";
import { check } from "react-icons-kit/entypo/check";
import { cross } from "react-icons-kit/entypo/cross";
import { trash } from "react-icons-kit/entypo/trash";
import { pencil } from "react-icons-kit/entypo/pencil";

export default function IconButton(props) {
  const renderIcon = name => {
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
  };

  return (
    <button
      className={`button icon ${props.className}`}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {renderIcon(props.icon)}
    </button>
  );
}

IconButton.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func,
  icon: PropTypes.string.isRequired,
  disabled: PropTypes.bool
};
