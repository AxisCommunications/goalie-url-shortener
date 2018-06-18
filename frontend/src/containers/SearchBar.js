import React, { Component } from "react";
import PropTypes from "prop-types";
import debounce from "lodash.debounce";
import { connect } from "react-redux";
import { filterResult } from "../redux/actions/api";

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
    let search = this.state.value;
    try {
      RegExp(this.state.value);
    } catch (error) {
      search = encodeURI(this.state.value);
    }
    this.props.filter(search);
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.filter(this.state.value);
  }

  componentDidUpdate(prevProps) {
    if (this.props.view !== prevProps.view) {
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

SearchBar.propTypes = {
  filter: PropTypes.func.isRequired,
  view: PropTypes.string.isRequired
};

const mapStateToProps = state => ({
  view: state.gui.view
});

const mapDispatchToProps = dispatch => ({
  filter: input => dispatch(filterResult(input))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchBar);
