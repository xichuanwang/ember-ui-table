import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class UITable extends Component {
  @tracked
  data;

  @tracked
  selectedItems = new Set();

  get isIndeterminate() {
    return this.selectedItems.size > 0 && this.selectedItems.size !== this.selectableItems.length;
  }

  get downloadableItems() {
    return this.data.value.filter((item, idx) => this.selectedItems.has(idx));
  }

  get selectableItems() {
    return this.data.value.reduce((acc, item, idx) => {
      if (item.status === 'available') {
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

  @action
  handleRowClick(id) {
    if (this.selectedItems.has(id)) {
      this.selectedItems.delete(id);
    } else {
      this.selectedItems.add(id);
    }
    this.selectedItems = new Set(this.selectedItems);
  }

  @action
  onCheckboxChange() {
    if (this.selectedItems.size === this.selectableItems.length) {
      this.selectedItems = new Set();
    } else {
      this.selectedItems = new Set(this.selectableItems);
    }
  }

  @action
  onDownload() {
    if (!this.args.onDownload) {
      return;
    }

    this.args.onDownload(this.downloadableItems);
  }
}