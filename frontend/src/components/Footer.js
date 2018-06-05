import React from "react";
import logo from "../assets/images/logo_small.png";

function Footer() {
  return (
    <footer>
      <div className="container footer">
        <div className="row text-center">
          <a href="https://www.example.com/">
            <img id="Company-Logo" src={logo} alt="Company Logo" />
          </a>
        </div>

        <div className="row text-center">
          <a href="https://docs.example.com">
            
          </a>
          <br />
          <a href="mailto:support@example.com?subject=go-service support">
            Contact: support@example.com
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
