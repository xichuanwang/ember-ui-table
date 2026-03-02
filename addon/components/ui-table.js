import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class UITable extends Component {
  /**
   * Tracked property to hold the async data for the table.
   */
  @tracked
  data;

  /**
   * Used to keep track of selected items in the table. It is a Set to ensure uniqueness and efficient lookups.
   * @type {Set}
   */
  @tracked
  selectedItems = new Set();

  /** 
   * Computed property to determine if the "Select All" checkbox should be in an indeterminate state.
   * @type {boolean}
   */
  get isIndeterminate() {
    return this.selectedItems.size > 0 && this.selectedItems.size !== this.selectableItems.length;
  }

  /**
   * A getter for the items that are selected and can be downloaded. It filters the data based on the selected item index.
   * @type {Array}
   */
  get downloadableItems() {
    return this.data.value.filter((item, idx) => this.selectedItems.has(idx));
  }

  /**
   * A getter to show indices of items that are selectable based on the validation function provided in the arguments.
   * If no validation function is provided, it defaults to all items being selectable.
   * @type {Array}
   */
  get selectableItems() {
    if (!this.args.validationFunction) {
      return this.data.value.map((_, idx) => idx);
    }

    return this.data.value.reduce((acc, item, idx) => {
      if (this.args.validationFunction(item.status)) {
        acc.push(idx);
      }
      return acc;
    }, []);
  }

  /**
   * Columns configuration for the table. Consumer of component
   * should define the name of the column and the data key to be displayed in the column.
   * Example:
   * columns = [
   *   { name: 'Name', key: 'name' },
   *   { name: 'Age', key: 'age' },
   * ]
   * If no columns are provided, it will default to an empty array, and the component will throw an error during initialization.
   */
  columns = this.args.columns || undefined;

  /**
   * On element initialization, the onLoad method is called to fetch the data for the table. 
   * This ensures that the table is populated with data as soon as it is rendered.
   */
  constructor() {
    super(...arguments);

    if (!this.args.columns) {
      throw new Error('Missing table column configuration. Please provide a columns argument to the UITable component.');
    }

    this.onLoad();
  }

  /**
   * This method calls the onFetch function passed in as an argument to fetch the data for the table. 
   * The function is expected to return a TrackedAsyncData instance, which will automatically update the 
   * table state when the loading is complete.
   */
  async onLoad() {
    const trackedData = this.args.onFetch();
    this.data = await trackedData;
  }

  /**
   * Handle when a row is clicked. It toggles the selection state of the item based on its index. If the item is ]
   * already selected, it will be deselected, and vice versa.
   * @param {number} id 
   */
  @action
  handleRowClick(id) {
    if (this.selectedItems.has(id)) {
      this.selectedItems.delete(id);
    } else {
      this.selectedItems.add(id);
    }
    this.selectedItems = new Set(this.selectedItems);
  }

  /**
   * Handle when the "Select All" checkbox is changed. If all items are currently selected, it will deselect all items.
   */
  @action
  onCheckboxChange() {
    if (this.selectedItems.size === this.selectableItems.length) {
      this.selectedItems = new Set();
    } else {
      this.selectedItems = new Set(this.selectableItems);
    }
  }

  /**
   * Handles when the download button is called. Will pass the list of downloadable items to the callee of the
   * function so that it can be handled externally. This can be useful when an additional API call is needed.
   */
  @action
  onDownload() {
    if (!this.args.onDownload) {
      return;
    }

    this.args.onDownload(this.downloadableItems);
  }

  /**
   * Handles a page change request from the pagination component.
   * Calls the consumer provided handler that fetch new data and also
   * resets the internal set since its a requesting new data
   * @param {number} newPage
   */
  @action
  onPageChange(newPage) {
    this.selectedItems = new Set();
    this.data = this.args.onPageChange(newPage);
  }
}