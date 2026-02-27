import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { render, find, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

async function renderCheckBox({ isIndeterminate = false, selectedItems = [], onCheckboxChange = () => {} } = {}) {
  this.setProperties({ isIndeterminate, selectedItems, onCheckboxChange });
  return await render(hbs`
    <CheckBox 
      @isIndeterminate={{this.isIndeterminate}} 
      @selectedItems={{this.selectedItems}} 
      @onCheckboxChange={{this.onCheckboxChange}}
    />
  `);
}

module('Integration | Component | check-box', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('onCheckboxChange', () => {});

    await renderCheckBox.call(this);
    assert.dom(this.element).exists();
  });

  test('it shows "None selected" when no items are selected', async function (assert) {
    await renderCheckBox.call(this, { selectedItems: [] });
    assert.dom(this.element).hasTextContaining('None selected');
  });

  test('it shows the number of selected items', async function (assert) {
    const selectedItems = new Set(['item1', 'item2']);
    await renderCheckBox.call(this, { selectedItems });
    assert.dom(this.element).hasTextContaining('Selected 2');
  });

  test('it shows indeterminate state', async function (assert) {
    await renderCheckBox.call(this, { isIndeterminate: true });
    const checkbox = find('input[type="checkbox"]');
    assert.ok(checkbox.indeterminate, 'Checkbox should be in indeterminate state');
  });

  test('it calls onCheckboxChange when checkbox is changed', async function (assert) {
    assert.expect(1);
    const onCheckboxChange = () => {
      assert.ok(true, 'onCheckboxChange should be called');
    };

    await renderCheckBox.call(this, { onCheckboxChange });
    const checkbox = find('input[type="checkbox"]');
    await click(checkbox);
  });
});
