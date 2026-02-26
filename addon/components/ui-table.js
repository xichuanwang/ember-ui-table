import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class UITable extends Component {
  @tracked
  data;

  /**
   * On element initialization, the onLoad method is called to fetch the data for the table. 
   * This ensures that the table is populated with data as soon as it is rendered.
   */
  constructor() {
    super(...arguments);
    
    this.onLoad();
  }

  /**
   * This method calls the onFetch function passed in as an argument to fetch the data for the table. 
   * The function is expected to return a TrackedAsyncData instance, which will automatically update the 
   * table state when the loading is complete.
   */
  onLoad() {
    const trackedData = this.args.onFetch();
    this.data = trackedData;
  }
}