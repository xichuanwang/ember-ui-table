import Controller from '@ember/controller';
import { generateData } from '../helpers/generate-data';
import { action } from '@ember/object';
import { TrackedAsyncData } from 'ember-async-data';
import { tracked } from '@glimmer/tracking';

export default class ApplicationController extends Controller {
  // Basic table column configuration
  columns = [
    {
      displayName: 'Name',
      key: 'name',
    },
    {
      displayName: 'Device',
      key: 'device',
    },
    {
      displayName: 'Path',
      key: 'path',
    },
    {
      displayName: 'Status',
      key: 'status',
      customCellComponent: 'status-cell', // Use custom cell component for status
    },
  ];

  /**
   * All generated data. In a real app this would come from an API.
   * Simulate all data from the API.
   */
  allData = generateData(300);

  /**
   * Number of items to load per page size. This would ideally be sent to the API
   * for each request.
   */
  pageSize = 10;

  /**
   * Keep track of current page - pagination is handled by the consumer
   */
  @tracked currentPage = 1;

  /**
   * Total pages based on page size and how many per page.
   */
  get totalPages() {
    return Math.ceil(this.allData.length / this.pageSize);
  }

  /**
   * Pagination configuration
   */
  get pagination() {
    return {
      pageSize: this.pageSize,
      currentPage: this.currentPage,
      totalPages: this.totalPages,
    };
  }

  fetchData(page) {
    const start = (page - 1) * this.pageSize;
    const pageData = this.allData.slice(start, start + this.pageSize);

    const p = new Promise((resolve) => {
      setTimeout(() => resolve(pageData), 600);
    });

    return new TrackedAsyncData(p);
  }

  /**
   * Returns a TrackedAsyncData instance that resolves with generated data after a delay.
   * @returns TrackedAsyncData instance
   */
  @action
  loadData() {
    return this.fetchData(this.currentPage);
  }

  @action
  onDownload(selectedItems) {
    const alertText = selectedItems.reduce((acc, item) => {
      acc.push(`Device: ${item.device} - Path: ${item.path}`);
      return acc;
    }, []).join('\n');

    alert(alertText);
  }

  @action
  validationFunction(status) {
    // Example validation: only allow download if status is 'available'
    return status.toLowerCase() === 'available';
  }

  @action
  handlePageChange(newPage) {
    this.currentPage = newPage;
    return this.fetchData(newPage);
  }
}