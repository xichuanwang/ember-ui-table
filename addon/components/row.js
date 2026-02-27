import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class RowComponent extends Component {

  @tracked
  isSelected = false;

  @action
  onClick() {
    this.isSelected = !this.isSelected;
    this.args.onClick(this.args.data);
  }
}