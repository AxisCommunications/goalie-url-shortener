import React from "react";
import Typist from "react-typist";

function generate_typing_elements(endpoints) {
  let delay = 1000;
  return endpoints.map(endpoint => {
    return [
      <b>{endpoint}</b>,
      <Typist.Backspace count={endpoint.length} delay={delay} />
    ];
  });
}

const Header = () => {
  let endpoints = ["axis", "tools", "google", "gerrit", "galaxis"];

  return (
    <header className="main-header">
      <div className="row">
        <div className="text-center">
          <Typist
            avgTypingDelay={100}
            cursor={{ show: false }}
            onTypingDone={this.onHeaderTyped}
          >
            <h1>
              <a href="/">
                <b>go/</b>
                {generate_typing_elements(endpoints)}
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
