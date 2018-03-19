import React from "react";
import logo from "../assets/images/logo_small.png";

function Footer() {
  return (
    <footer>
      <div className="container footer">
        <div className="row text-center">
          <img id="Company-Logo" src={logo} alt="Company Logo" />
        </div>

        <div className="row text-center">
          <a href="http://tools-docs.company.com/tools_team/">
            
          </a>
          <br />
          <a href="mailto:support-tools@example.com">
            Contact: support@example.com
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
