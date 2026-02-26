import Component from '@glimmer/component';

export default class TableBodyComponent extends Component {
  /**
   * Separate the data so that its in the right order by column key.
   * This makes it so that we can place the data in the right column when we render the cell.
   */
  get processedRows() {
    return this.args.data.reduce((acc, item) => {
      const row = this.args.columns.map((col) => {
        if (col.key) {
          return item[col.key];
        } else {
          return null;
        }
      });
      acc.push(row);
      return acc;
    }, []);
  }
}