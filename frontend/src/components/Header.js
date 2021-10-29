import React from "react";
import Typist from "react-typist";

const Header = () => {
  const endpoints = ["axis", "tools", "google", "gerrit", "galaxis"];

  return (
    <header className="main-header">
      <div className="row">
        <div className="text-center">
          <Typist avgTypingDelay={100} cursor={{ show: false }}>
            <h1>
              <a href="/">
                <b>go/</b>
                {endpoints.map(endpoint => [
                  <b key={1}>{endpoint}</b>,
                  <Typist.Backspace
                    key={2}
                    count={endpoint.length}
                    delay={1000}
                  />
                ])}
              </a>
            </h1>
          </Typist>
          <p>Easy to remember URLs as a service.</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
