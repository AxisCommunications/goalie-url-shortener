import React from "react";
import PropTypes from "prop-types";

export default function InputField(props) {
  return (
    <input
      type={
        props.name === "password" || props.name === "submit"
          ? props.name
          : "text"
      }
      // Placeholder is name with first letter in upper-case
      placeholder={props.name.charAt(0).toUpperCase() + props.name.slice(1)}
      {...props} // load props to input
    />
  );
}

InputField.propTypes = {
  name: PropTypes.string
};
