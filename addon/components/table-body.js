import Component from '@glimmer/component';

export default class TableBodyComponent extends Component {

  /**
   * Hacky way to loop through x number of times in hbs without using a template helper
   */
  get ghostRows() {
    return Array.from({ length: this.args.pageSize });
  }

  /**
   * Separate the data so that its in the right order by column key.
   * This makes it so that we can place the data in the right column when we render the cell.
   */
  get processedRows() {
    return this.args.data.value.reduce((acc, item) => {
      const row = this.args.columns.map((col) => {
        const rowData = {};
        if (col.key) {
          rowData.data = item[col.key];
        }
        if (col.customCellComponent) {
          rowData.customCellComponent = col.customCellComponent;
        }
        return rowData;
      });
      acc.push(row);
      return acc;
    }, []);
  }
}