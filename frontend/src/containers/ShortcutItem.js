import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import moment from "moment";
import { deleteShortcut, updateShortcut } from "../redux/actions/api";

import IconButton from "../components/IconButton";

/* eslint no-underscore-dangle: ["error", { "allow": ["_id", "_updated"] }] */
class ShortcutItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false,
      pattern: this.props.shortcut.pattern,
      target: this.props.shortcut.target,
      // Moment.js supports RFC 822 date (RFC2822)
      date: moment(this.props.shortcut._updated),
      id: this.props.shortcut._id
    };
    this.enterEdit = this.enterEdit.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.confirmEdit = this.confirmEdit.bind(this);
    this.deleteShortcut = this.deleteShortcut.bind(this);
    this.renderEditButtons = this.renderEditButtons.bind(this);
  }

  allowedToEdit() {
    return this.props.view === "my" || this.props.admin;
  }

  enterEdit() {
    this.setState({ editing: true });
  }

  cancelEdit() {
    this.setState({
      editing: false,
      pattern: this.props.shortcut.pattern,
      target: this.props.shortcut.target
    });
  }

  confirmEdit() {
    const shortcut = {
      ...this.props.shortcut,
      pattern: this.state.pattern,
      target: this.state.target,
      id: this.state.id
    };

    if (
      shortcut.pattern === this.props.shortcut.pattern &&
      shortcut.target === this.props.shortcut.target
    ) {
      this.setState({
        editing: false
      });
      return;
    }
    this.props.updateShortcut(shortcut).then(() => {
      if (
        this.props.shortcut.pattern === this.state.pattern &&
        this.props.shortcut.target === this.state.target
      ) {
        this.setState({
          editing: false,
          date: moment()
        });
      }
    });
  }

  deleteShortcut() {
    this.props.deleteShortcut(this.state.id);
  }

  renderEditButtons() {
    return (
      <td className={this.state.editing ? "configure edit" : "configure"}>
        <div className="u-pull-right button-group">
          {this.state.editing ? (
            [
              <IconButton
                key="1"
                className="button-confirm"
                icon="check"
                onClick={this.confirmEdit}
              />,
              <IconButton
                key="2"
                className="button-delete"
                icon="trash"
                onClick={this.deleteShortcut}
              />,
              <IconButton
                key="3"
                className="button-cancel"
                icon="cross"
                onClick={this.cancelEdit}
              />
            ]
          ) : (
            <IconButton
              className="button-edit"
              icon="pencil"
              onClick={this.enterEdit}
            />
          )}
        </div>
      </td>
    );
  }

  renderField(field) {
    if (field === "buttons" && this.allowedToEdit()) {
      return this.renderEditButtons();
    } else if (this.state.editing) {
      return (
        <input
          className="shortcut-edit"
          type="text"
          value={this.state[field]}
          onChange={event => this.setState({ [field]: event.target.value })}
        />
      );
    } else if (field === "pattern") {
      return <span>{this.state.pattern}</span>;
    } else if (field === "target") {
      return <a href={this.state.target}>{this.state.target}</a>;
    }
    return null;
  }

  render() {
    return this.state.deleted ? null : (
      <tr>
        <td className="pattern">{this.renderField("pattern")}</td>
        <td className="target">{this.renderField("target")}</td>
        <td className="modified">
          {this.state.date.fromNow()} by {this.props.shortcut.ldapuser}
        </td>
        {this.renderField("buttons")}
      </tr>
    );
  }
}

ShortcutItem.propTypes = {
  deleteShortcut: PropTypes.func.isRequired,
  admin: PropTypes.bool,
  shortcut: PropTypes.shape({
    _created: PropTypes.string,
    _id: PropTypes.string.isRequired,
    _links: PropTypes.shape({
      self: PropTypes.shape({
        href: PropTypes.string,
        title: PropTypes.string
      })
    }),
    _updated: PropTypes.string,
    ldapuser: PropTypes.string.isRequired,
    pattern: PropTypes.string.isRequired,
    target: PropTypes.string.isRequired
  }),
  updateShortcut: PropTypes.func.isRequired,
  username: PropTypes.string.isRequired,
  view: PropTypes.string.isRequired
};

const mapStateToProps = state => ({
  view: state.gui.view,
  admin: state.authentication.admin,
  username: state.authentication.username
});

const mapDispatchToProps = dispatch => ({
  deleteShortcut: id => dispatch(deleteShortcut(id)),
  updateShortcut: shortcut => dispatch(updateShortcut(shortcut))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ShortcutItem);
