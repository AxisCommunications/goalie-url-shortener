import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Icon from "react-icons-kit";
import { sortAmountAsc } from "react-icons-kit/fa/sortAmountAsc";
import { sortAmountDesc } from "react-icons-kit/fa/sortAmountDesc";
import { getShortcuts, sortResult } from "../redux/actions/api";
import ShortcutItem from "./ShortcutItem";

/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
class ShortcutsTable extends Component {
  constructor(props) {
    super(props);
    this.sort = this.sort.bind(this);
  }

  componentDidMount() {
    const { fetchShortcuts } = this.props;
    fetchShortcuts();
  }

  sort(order) {
    const { sortOrder, sortShortcuts } = this.props;
    if (order === sortOrder) {
      sortShortcuts(`-${order}`);
    } else {
      sortShortcuts(order);
    }
  }

  shouldDisplayConfigure() {
    const { view, admin } = this.props;
    return view === "my" || admin;
  }

  renderArrow(heading) {
    const { sortOrder } = this.props;
    if (sortOrder.includes(heading)) {
      const arrow = sortOrder.includes("-") ? sortAmountDesc : sortAmountAsc;
      return <Icon icon={arrow} />;
    }
    return null;
  }

  render() {
    const { shortcuts } = this.props;
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
            {shortcuts.map((shortcut) => (
              <ShortcutItem key={shortcut._id} shortcut={shortcut} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

ShortcutsTable.propTypes = {
  fetchShortcuts: PropTypes.func.isRequired,
  admin: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  shortcuts: PropTypes.arrayOf(PropTypes.object).isRequired,
  sortOrder: PropTypes.string.isRequired,
  sortShortcuts: PropTypes.func.isRequired,
  view: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  shortcuts: state.shortcuts.items,
  sortOrder: state.shortcuts.sort,
  view: state.gui.view,
  admin: state.authentication.admin,
});

const mapDispatchToProps = (dispatch) => ({
  fetchShortcuts: () => dispatch(getShortcuts()),
  sortShortcuts: (sort) => dispatch(sortResult(sort)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ShortcutsTable);
