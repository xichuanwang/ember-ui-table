import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class RowComponent extends Component {
  
  /**
   * Determines if the current row is selected by checking if the index is in the selectedItems set.
   * @returns {boolean} - Returns true if the row is selected, false otherwise.
   */
  get isSelected() {
    return this.args.selectedItems.has(this.args.idx);
  }

  /**
   * A row can be selected if at least one of its items is available.
   * This is determined by checking if any item in the data array has the value 'available'.
   * @returns {boolean} - Returns true if the row can be selected, false otherwise.
   */
  get canRowBeSelected() {
    if (!this.args.validationFunction) {
      return true;
    }
    return this.args.rowData.filter((row) => this.args.validationFunction(row.data)).length > 0;
  }
  
  /**
   * When a row is clicked, this action is triggered.
   * Calls the onClick handler passed in through args with the index of the row.
   * @param {PointerEvent} event 
   */
  @action
  onRowClick(event) {
    // Prevent double event firing when clicking on a checkbox or label
    if (event.target.type === "checkbox" || event.target.tagName === "LABEL") {
      return;
    }

    if (!this.canRowBeSelected) {
      return;
    }

    this.args.onClick(this.args.idx);
  }

  /**
   * When a checkbox is clicked, this action is triggered.
   * Also calls the onclick - but only if the row can be selected. If the row cannot be selected, 
   * it prevents the default checkbox behavior.
   * @param {PointerEvent} event 
   * @returns 
   */
  @action
  onCheckboxClick(event) {
    this.args.onClick(this.args.idx);
  }
}