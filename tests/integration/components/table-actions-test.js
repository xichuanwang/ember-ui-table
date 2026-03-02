import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { render, find, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

async function renderActions({ selectedItems = [], isIndeterminate = false, onCheckboxChange = () => {}, onDownload = () => {}} = {}) {
  this.setProperties({ 
    selectedItems,
    isIndeterminate,
    onCheckboxChange,
    onDownload,
  });

  return await render(hbs`
    <TableActions
      @selectedItems={{this.selectedItems}}
      @isIndeterminate={{this.isIndeterminate}}
      @onCheckboxChange={{this.onCheckboxChange}}
      @onDownload={{this.onDownload}}
    />
  `);
}

module('Integration | Component | table-actions', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders the actions container', async function (assert) {
    await renderActions.call(this);
    assert.dom('.ui-table__actions').exists();
    assert.dom('.ui-table__actions-select').exists();
    assert.dom('.ui-table__actions input[type="checkbox"]').exists();
  });

  test('it shows "None selected" when selectedItems is empty', async function (assert) {
    await renderActions.call(this, { 
      selectedItems: new Set() 
    });

    assert.dom('label').hasText('None selected');
  });

  test('it shows the count when items are selected', async function (assert) {
    await renderActions.call(this, { 
      selectedItems: new Set([0, 1, 2]) 
    });

    assert.dom('label').hasText('Selected 3');
  });

  test('download button has type="button"', async function (assert) {
    await renderActions.call(this, { 
      selectedItems: new Set([0]) 
    });

    assert.dom('.ui-table__actions-download-button').hasAttribute('type', 'button');
  });

  test('download button is hidden when no items are selected', async function (assert) {
    await renderActions.call(this, { 
      selectedItems: new Set() 
    });

    assert.dom('.ui-table__actions-download-button').doesNotExist();
  });

  test('download button is visible when items are selected', async function (assert) {
    await renderActions.call(this, { 
      selectedItems: new Set([0]) 
    });

    assert.dom('.ui-table__actions-download-button').exists();
    assert.dom('.ui-table__actions-download-button').hasText('Download selected');
  });

  test('clicking download calls @onDownload', async function (assert) {
    assert.expect(1);

    this.set('onDownload', () => {
      assert.ok(true, 'onDownload called')
    });

    await renderActions.call(this, {
      selectedItems: new Set([0]),
      onDownload: this.onDownload,
    });

    const downloadButton = find('.ui-table__actions-download-button');
    await click(downloadButton);
  });

  test('clicking the select-all checkbox calls @onCheckboxChange', async function (assert) {
    assert.expect(1);

    this.set('onCheckboxChange', () => {
      assert.ok(true, 'onCheckboxChange called')
    });

    await renderActions.call(this, { onCheckboxChange: this.onCheckboxChange });

    const element = find('input[type="checkbox"]');
    await click(element);
  });
});
