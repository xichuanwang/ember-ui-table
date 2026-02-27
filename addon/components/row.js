import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class RowComponent extends Component {

  /**
   * isSelected is a tracked property that indicates whether the row is currently selected or not.
   * @type {boolean}
   */
  @tracked
  isSelected = false;

  /**
   * A row can be selected if at least one of its items is available.
   * This is determined by checking if any item in the data array has the value 'available'.
   * @returns {boolean} - Returns true if the row can be selected, false otherwise.
   */
  get canRowBeSelected() {
    return this.args.data.filter((item) => item === 'available').length > 0;
  }
  
  @action
  onClick() {
    if (!this.canRowBeSelected) {
      return;
    }
    this.isSelected = !this.isSelected;
    this.args.onClick(this.args.data);
  }
}