import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Paginate from "react-paginate";
import { getShortcuts } from "../redux/actions/api";

class Pagination extends Component {
  render() {
    return (
      <Paginate
        forcePage={this.props.page - 1} // Paginate is 0-indexed
        previousLabel={"<"}
        nextLabel={">"}
        pageCount={this.props.pages}
        marginPagesDisplayed={2}
        pageRangeDisplayed={3}
        onPageChange={page =>
          this.props
            .fetchShortcuts(page.selected + 1)
            .then(() => window.scrollTo(0, 0))
        }
        containerClassName={"pagination text-center"}
        subContainerClassName={"page"}
        activeClassName={"active"}
      />
    );
  }
}

Pagination.propTypes = {
  fetchShortcuts: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  pages: PropTypes.number.isRequired
};

const mapStateToProps = state => ({
  pages: state.shortcuts.pages,
  page: state.shortcuts.page
});

const mapDispatchToProps = dispatch => ({
  fetchShortcuts: page => dispatch(getShortcuts(page))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Pagination);
