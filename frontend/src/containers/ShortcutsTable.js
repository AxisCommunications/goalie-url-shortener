import React, { Component } from "react";
import { connect } from "react-redux";
import { getShortcuts } from "../redux/actions/api";
import ShortcutItem from "./ShortcutItem";

class ShortcutsTable extends Component {
  componentDidMount() {
    this.props.fetchShortcuts();
  }

  render() {
    return (
      <div>
        <table className="u-full-width fixed">
          <thead>
            <tr key="0">
              <th key="1">Pattern</th>
              <th key="2">Target</th>
              {this.props.view === "my" || this.props.rights === "admin" ? (
                <th key="3">
                  <div className="u-pull-right">Configure</div>
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {this.props.shortcuts.map(shortcut => {
              return (
                <ShortcutItem
                  key={shortcut._id}
                  shortcut={shortcut}
                  view={this.props.view}
                  rights={this.props.rights}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    shortcuts: state.shortcuts.items,
    view: state.gui.view,
    rights: state.authentication.rights
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchShortcuts: () => dispatch(getShortcuts())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ShortcutsTable);
