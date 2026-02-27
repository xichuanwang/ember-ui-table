import Component from '@glimmer/component';

export default class CheckBoxComponent extends Component {

  get isChecked() {
    return this.args.selectedItems.size > 0;
  }
}