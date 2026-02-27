import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { render, find, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

const seed = [
  { data: 'smss.exe' },
  { data: 'Mario' },
  { data: '/Device/harddisk/volumn/2' },
  { data: 'available' },
];

async function renderRowComponent({ idx = 0, rowData = [], validationFunction = null, selectedItems = new Set(), onClick = () => {} } = {}) {
  this.setProperties({ idx, rowData, validationFunction, selectedItems, onClick });
  return await render(hbs`
    <Row
      @idx={{this.idx}}
      @rowData={{this.rowData}}
      @validationFunction={{this.validationFunction}}
      @selectedItems={{this.selectedItems}}
      @onClick={{this.onClick}}
    />
  `);
}

module('Integration | Component | row', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await renderRowComponent.call(this);
    const element = find('.ui-table__row');
    assert.dom(element).hasAttribute('tabindex', '0');
    assert.dom(element).hasAttribute('aria-selected', 'false');
  });

  test('it renders with row data', async function (assert) {
    await renderRowComponent.call(this, { rowData: seed });
    const element = find('.ui-table__row');
    const cells = element.querySelectorAll('.ui-table__cell');
    assert.equal(cells.length, seed.length, 'renders the correct number of cells');

    cells.forEach((cell, index) => {
      assert.dom(cell).hasText(seed[index].data, `cell ${index} has correct text`);
    });
  });

  test('it applies validation function correctly and enables checkbox', async function (assert) {
    const validationFunction = (data) => data === 'available';
    await renderRowComponent.call(this, { rowData: seed, validationFunction });
    const element = find('.ui-table__row input[type="checkbox"]');

    assert.equal(element.disabled, false);
  });

  test('it applies validation function correctly and disables checkbox', async function (assert) {
    const validationFunction = (data) => data === 'something else';
    await renderRowComponent.call(this, { rowData: seed, validationFunction });
    const element = find('.ui-table__row input[type="checkbox"]');

    assert.equal(element.disabled, true);
  });

  test('it calls onClick when row is clicked', async function (assert) {
    assert.expect(1);
    this.set('onClick', (idx) => {
      assert.equal(idx, 0, 'onClick should be called with the correct index');
    });

    await renderRowComponent.call(this, { onClick: this.onClick });
    const element = find('.ui-table__row');
    await click(element);
  });

  test('it calls onClick when checkbox is clicked', async function (assert) {
    assert.expect(1);
    this.set('onClick', (idx) => {
      assert.equal(idx, 0, 'onClick should be called with the correct index');
    });

    await renderRowComponent.call(this, { onClick: this.onClick });
    const checkbox = find('.ui-table__row input[type="checkbox"]');
    await click(checkbox);
  });

  test('it does not call onClick when row is clicked but checkbox is disabled', async function (assert) {
    assert.expect(0);
    const validationFunction = (data) => data === 'something else';
    this.set('onClick', () => {
      assert.ok(false, 'onClick should not be called when checkbox is disabled');
    });

    await renderRowComponent.call(this, { rowData: seed, validationFunction, onClick: this.onClick });
    const element = find('.ui-table__row');
    await click(element);
  });

  test('it should select the checkbox when the id is selected', async function (assert) {
    const selectedItems = new Set([0]);
    await renderRowComponent.call(this, { rowData: seed, selectedItems, });
    const checkbox = find('.ui-table__row input[type="checkbox"]');

    assert.equal(checkbox.checked, true);
  });
});
