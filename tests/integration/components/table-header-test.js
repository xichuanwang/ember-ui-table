import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { render, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | table-header', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders the correct columns', async function (assert) {
    const columns = [
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
      },
    ]
    this.set('columns', columns);

    await render(hbs`<TableHeader @columns={{this.columns}}/>`);

    const headerColumns = findAll('.ui-table__header th')
    
    assert.dom(headerColumns[0]).hasNoText('the first header is empty to provide column for checkbox');
    assert.dom(headerColumns[0]).hasAttribute('scope', 'col');
    assert.equal(headerColumns.length, columns.length + 1, 'equals the number of columns configured + 1 to accomodate for the checkbox column');

    assert.dom(headerColumns[1]).hasText('Name', 'The first data column is labelled correctly');
    assert.dom(headerColumns[2]).hasText('Device', 'The second data column is labelled correctly')
    assert.dom(headerColumns[3]).hasText('Path', 'The third data column is labelled correctly')
    assert.dom(headerColumns[4]).hasText('Status', 'The foruth data column is labelled correctly')
  });
});
