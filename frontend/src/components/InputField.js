import React from "react";
import PropTypes from "prop-types";

export default function InputField(props) {
  const { name } = props;
  return (
    <input
      type={name === "password" || name === "submit" ? name : "text"}
      // Placeholder is name with first letter in upper-case
      placeholder={name.charAt(0).toUpperCase() + name.slice(1)}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props} // load props to input
    />
  );
}

InputField.propTypes = {
  name: PropTypes.string,
};
