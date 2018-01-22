import React, { Component } from "react";
import { getShortcuts } from "../redux/actions/api";
import { connect } from "react-redux";
import Paginate from "react-paginate";

class Pagination extends Component {
  componentDidUpdate(prevProps) {
    // Fix for reset on view change
    if (this.props.page !== prevProps.page) {
      // Paginate internal index is page-1
      this._paginate.setState({ selected: this.props.page - 1 });
    }
  }

  render() {
    return (
      <Paginate
        ref={a => (this._paginate = a)}
        previousLabel={"<"}
        nextLabel={">"}
        pageCount={this.props.pages}
        marginPagesDisplayed={3}
        pageRangeDisplayed={6}
        onPageChange={page =>
          this.props
            .fetchShortcuts(page.selected + 1)
            .then(() => window.scrollTo(0, 0))
        }
        containerClassName={"pagination text-center"}
        subContainerClassName={"page"}
        activeClassName={"active"}
        initialPage={this.props.page - 1}
      />
    );
  }
}

const mapStateToProps = state => {
  return {
    pages: state.shortcuts.pages,
    page: state.shortcuts.page
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchShortcuts: page => dispatch(getShortcuts(page))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Pagination);
