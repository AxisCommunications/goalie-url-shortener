import React, { Component } from "react";
import { connect } from "react-redux";
import { filter_result } from "../redux/actions/api";
import debounce from "lodash.debounce";

class SearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: ""
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    // Limit number of events fired with debounce
    this.updateSearch = debounce(this.updateSearch, 200);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
    this.updateSearch(); // Debounced
  }

  updateSearch() {
    this.props.filter(this.state.value);
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.filter(this.state.value);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.view !== nextProps.view) {
      this.setState({ value: "" });
    }
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input
          className="eight columns offset-by-two"
          type="text"
          placeholder="Search"
          value={this.state.value}
          onChange={this.handleChange}
        />
      </form>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    view: state.gui.view
  };
};

const mapDispatchToProps = dispatch => {
  return {
    filter: input => dispatch(filter_result(input))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchBar);
