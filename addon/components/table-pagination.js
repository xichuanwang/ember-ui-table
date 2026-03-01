import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class TablePaginationComponent extends Component {

  /**
   * Return true if we are on the first page to disable the prev button.
   * @return {boolean}
   */
  get isFirstPage() {
    return this.args.pagination.currentPage === 1;
  }

  /**
   * Return true if we are on the last page to disable the next button.
   * @return {boolean}
   */
  get isLastPage() {
    return this.args.pagination.currentPage === this.args.pagination.totalPages;
  }

  /**
   * Click handler to either add or subtract increments of 1 to the
   * current page number and then trigger consumer passed callback.
   * @param {number} incremental 
   */
  @action
  onPageChange(incremental) {
    const newPage = this.args.pagination.currentPage + incremental;
    this.args.onPageChange(newPage);
  }
}