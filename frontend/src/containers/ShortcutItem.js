import React, { Component } from "react";
import { connect } from "react-redux";
import { deleteShortcut, updateShortcut } from "../redux/actions/api";

import IconButton from "../components/IconButton";

class shortcutItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false,
      pattern: this.props.shortcut.pattern,
      target: this.props.shortcut.target,
      id: this.props.shortcut._id
    };
    this.enterEdit = this.enterEdit.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.confirmEdit = this.confirmEdit.bind(this);
    this.deleteShortcut = this.deleteShortcut.bind(this);
    this.renderEditButtons = this.renderEditButtons.bind(this);
  }

  allowedToEdit() {
    return this.props.view === "my" || this.props.rights === "admin";
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
    let shortcut = {
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
        this.setState({ editing: false });
      }
    });
  }

  deleteShortcut() {
    this.props.deleteShortcut(this.state.id);
  }

  renderEditButtons() {
    return (
      <td className="configure">
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
    } else {
      return null;
    }
  }

  render() {
    return this.state.deleted ? null : (
      <tr>
        <td className="pattern">{this.renderField("pattern")}</td>
        <td className="target">{this.renderField("target")}</td>
        {this.renderField("buttons")}
      </tr>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    deleteShortcut: id => dispatch(deleteShortcut(id)),
    updateShortcut: shortcut => dispatch(updateShortcut(shortcut))
  };
};

export default connect(null, mapDispatchToProps)(shortcutItem);
