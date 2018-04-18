import React, { Component } from "react";
import { connect } from "react-redux";
import Icon from "react-icons-kit";
import { arrowDown } from "react-icons-kit/icomoon/arrowDown";
import { arrowUp } from "react-icons-kit/icomoon/arrowUp";
import { getShortcuts, sort_result } from "../redux/actions/api";
import ShortcutItem from "./ShortcutItem";

class ShortcutsTable extends Component {
  constructor(props) {
    super(props);
    this.sort = this.sort.bind(this);
  }
  componentDidMount() {
    this.props.fetchShortcuts();
  }

  sort(order) {
    if (order === this.props.sortOrder) {
      this.props.sortShortcuts("-" + order);
    } else {
      this.props.sortShortcuts(order);
    }
  }

  shouldDisplayConfigure() {
    return this.props.view === "my" || this.props.rights === "admin";
  }

  renderArrow(heading) {
    if (this.props.sortOrder.includes(heading)) {
      let arrow = this.props.sortOrder.includes("-") ? arrowDown : arrowUp;
      return <Icon icon={arrow} />;
    }
  }

  render() {
    return (
      <div>
        <table className="u-full-width fixed">
          <thead>
            <tr key="0">
              <th
                className="sortable"
                key="1"
                onClick={() => this.sort("pattern")}
              >
                Pattern {this.renderArrow("pattern")}
              </th>
              <th
                className="sortable"
                key="2"
                onClick={() => this.sort("target")}
              >
                Target {this.renderArrow("target")}
              </th>
              <th
                className="sortable"
                key="4"
                onClick={() => this.sort("_updated")}
              >
                Modified {this.renderArrow("_updated")}
              </th>
              {this.shouldDisplayConfigure() ? (
                <th key="5">
                  <div className="u-pull-right">Configure</div>
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {this.props.shortcuts.map(shortcut => {
              return <ShortcutItem key={shortcut._id} shortcut={shortcut} />;
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
    sortOrder: state.shortcuts.sort,
    view: state.gui.view,
    rights: state.authentication.rights
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchShortcuts: () => dispatch(getShortcuts()),
    sortShortcuts: sort => dispatch(sort_result(sort))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ShortcutsTable);
