import React, { Component } from "react";
import PropTypes from "prop-types";
import debounce from "lodash.debounce";
import { connect } from "react-redux";
import { filterResult } from "../redux/actions/api";

class SearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.search,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    // Limit number of events fired with debounce
    this.updateSearch = debounce(this.updateSearch, 200);
  }

  componentDidUpdate(prevProps) {
    const { view } = this.props;
    if (view !== prevProps.view) {
      this.setState({ value: "" });
    }
  }

  handleSubmit(event) {
    const { filter } = this.props;
    const { value } = this.state;
    event.preventDefault();
    filter(value);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
    this.updateSearch(); // Debounced
  }

  updateSearch() {
    const { filter } = this.props;
    const { value } = this.state;
    let search = value;
    try {
      RegExp(value);
    } catch (error) {
      search = encodeURI(value);
    }
    filter(search);
  }

  render() {
    const { value } = this.state;
    return (
      <form onSubmit={this.handleSubmit}>
        <input
          className="eight columns offset-by-two"
          type="text"
          placeholder="Search"
          value={value}
          onChange={this.handleChange}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
        />
      </form>
    );
  }
}

SearchBar.propTypes = {
  filter: PropTypes.func.isRequired,
  view: PropTypes.string.isRequired,
  search: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  view: state.gui.view,
  search: state.shortcuts.filter,
});

const mapDispatchToProps = (dispatch) => ({
  filter: (input) => dispatch(filterResult(input)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchBar);
