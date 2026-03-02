import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { render, find, findAll, click, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { TrackedAsyncData } from 'ember-async-data';

const mockColumns = [
  { displayName: 'Name', key: 'name' },
  { displayName: 'Device', key: 'device' },
  { displayName: 'Status', key: 'status' },
];

const mockData = [
  { name: 'alpha.exe', device: 'Mario', status: 'Available' },
  { name: 'beta.exe',  device: 'Luigi', status: 'Scheduled' },
  { name: 'gamma.exe', device: 'Peach', status: 'Available' },
];

/**
 * Mocks endpoint that resolves mock data and returns the reference to the async object.
 */
function resolvedData(data) {
  return new TrackedAsyncData(Promise.resolve(data));
}

/**
 * Mocks an endpoing that never returns data
 */
function pendingData() {
  return new TrackedAsyncData(new Promise(() => {}));
}

/**
 * Renders UiTable with properties
 */
async function renderTable({ columns = mockColumns, onFetch = () => resolvedData(mockData), onDownload, validationFunction = undefined, pagination = {}, onPageChange = () => {}, title} = {}) {

  this.setProperties({
    columns,
    onFetch,
    onDownload,
    validationFunction,
    pagination,
    onPageChange,
    title,
  });

  await render(hbs`
    <UiTable
      @columns={{this.columns}}
      @onFetch={{this.onFetch}}
      @onDownload={{this.onDownload}}
      @validationFunction={{this.validationFunction}}
      @pagination={{this.pagination}}
      @onPageChange={{this.onPageChange}}
      @title={{this.title}}
    />
  `);

  // Wait for async data to resolve before proceeding
  await waitUntil(() => !find('.ui-table__ghost-row'), { timeout: 1000 });
}

module('Integration | Component | ui-table', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders a table with the correct ARIA region role and label', async function (assert) {
    await renderTable.call(this);

    const wrapper = find('.ui-table-wrapper');
    assert.dom(wrapper).hasAttribute('role', 'region');
    assert.dom(wrapper).hasAttribute('aria-labelledby', 'table-caption');
  });

  test('it renders a column header for each configured column plus one for the checkbox', async function (assert) {
    await renderTable.call(this);

    const headers = findAll('.ui-table__header th');
    assert.equal(headers.length, mockColumns.length + 1, 'correct number of header cells');
    assert.dom(headers[0]).hasNoText('first header is empty — checkbox column');

    assert.dom(headers[1]).hasText('Name');
    assert.dom(headers[1]).hasAttribute('scope', 'col');

    assert.dom(headers[2]).hasText('Device');
    assert.dom(headers[2]).hasAttribute('scope', 'col');

    assert.dom(headers[3]).hasText('Status');
    assert.dom(headers[3]).hasAttribute('scope', 'col');
  });

  test('it renders the correct number of data rows', async function (assert) {
    await renderTable.call(this);

    const rows = findAll('.ui-table__row');
    assert.equal(rows.length, mockData.length, 'one row per data item');
  });

  test('it renders cell content in column order', async function (assert) {
    await renderTable.call(this);

    const firstRow = find('.ui-table__row');
    const cells = firstRow.querySelectorAll('.ui-table__cell');

    assert.dom(cells[0]).hasText(mockData[0].name);
    assert.dom(cells[1]).hasText(mockData[0].device);
    assert.dom(cells[2]).hasText(mockData[0].status);
  });

  module('row selection', function (hooks) {
    test('it should unselect all rows by default', async function (assert) {
      await renderTable.call(this);

      findAll('.ui-table__row').forEach((row) => {
        assert.dom(row).hasAttribute('aria-selected', 'false');
      });
    });

    test('it selects a row when clicked and updates aria-selected', async function (assert) {
      await renderTable.call(this);

      const firstRow = find('.ui-table__row');
      console.log(firstRow);
      await click(firstRow);

      assert.dom(firstRow).hasAttribute('aria-selected', 'true');
      assert.ok(firstRow.querySelector('input[type="checkbox"]').checked, 'checkbox is checked');
    });

    test('it deselects a row when clicking the same row', async function (assert) {
      await renderTable.call(this);

      const firstRow = find('.ui-table__row');
      await click(firstRow);
      await click(firstRow);

      assert.dom(firstRow).hasAttribute('aria-selected', 'false');
      assert.notOk(firstRow.querySelector('input[type="checkbox"]').checked);
    });

    test('it can select multiple rows', async function (assert) {
      await renderTable.call(this);

      const rows = findAll('.ui-table__row');
      await click(rows[0]);
      await click(rows[2]);

      assert.dom(rows[0]).hasAttribute('aria-selected', 'true');
      assert.dom(rows[1]).hasAttribute('aria-selected', 'false');
      assert.dom(rows[2]).hasAttribute('aria-selected', 'true');
    });

    test('it should select a row when clicking on a checkbox', async function (assert) {
      await renderTable.call(this);

      const firstRow = find('.ui-table__row');
      const checkbox = firstRow.querySelector('input[type="checkbox"]');
      await click(checkbox);

      assert.dom(firstRow).hasAttribute('aria-selected', 'true');
      assert.ok(checkbox.checked);
    });

    test('it should set a tabindex of 0 on each row', async function (assert) {
      await renderTable.call(this);

      findAll('.ui-table__row').forEach((row) => {
        assert.dom(row).hasAttribute('tabindex', '0');
      });
    });
  });

  module('validation', function (hooks) {
    test('it should disable checkbox that fails a custom validation', async function (assert) {
      await renderTable.call(this, {
        validationFunction: (status) => status.toLowerCase() === 'available',
      });

      const rows = findAll('.ui-table__row');
      assert.notOk(rows[0].querySelector('input[type="checkbox"]').disabled, 'Available row enabled');
      assert.ok(rows[1].querySelector('input[type="checkbox"]').disabled,    'Scheduled row disabled');
      assert.notOk(rows[2].querySelector('input[type="checkbox"]').disabled, 'Available row enabled');
    });

    test('it should be able to select all rows when no validationFunction is provided', async function (assert) {
      await renderTable.call(this, { validationFunction: null });

      const rows = findAll('.ui-table__row');

      rows.forEach((row) => {
        assert.notOk(row.querySelector('input[type="checkbox"]').disabled);
      });
    });
  });

  module('select all', function (hooks) {
    test('it should show "None selected" when nothing is selected', async function (assert) {
      await renderTable.call(this);
      assert.dom('.ui-table__actions label').hasTextContaining('None selected');
    });

    test('it should show the selected count when some rows are selected', async function (assert) {
      await renderTable.call(this);

      await click(findAll('.ui-table__row')[0]);

      assert.dom('.ui-table__actions label').hasTextContaining('Selected 1');
    });

    test('it should show indeterminate state when some but not all rows are selected', async function (assert) {
      await renderTable.call(this);

      await click(findAll('.ui-table__row')[0]);

      const selectAllCheckbox = find('.ui-table__actions input[type="checkbox"]');
      assert.ok(selectAllCheckbox.indeterminate, 'checkbox is indeterminate');
    });

    test('it should not set indeterminate state when select-all checkbox is checked', async function (assert) {
      await renderTable.call(this);

      const selectAllCheckbox = find('.ui-table__actions input[type="checkbox"]');
      await click(selectAllCheckbox);

      assert.notOk(selectAllCheckbox.indeterminate, 'not indeterminate');
      assert.ok(selectAllCheckbox.checked, 'fully checked');
    });

    test('it should select all rows when clicking the select all checkbox', async function (assert) {
      await renderTable.call(this);

      await click(find('.ui-table__actions input[type="checkbox"]'));

      assert.equal(findAll('.ui-table__row[aria-selected="true"]').length, mockData.length);
      assert.dom('.ui-table__actions label').hasTextContaining(`Selected ${mockData.length}`);
    });

    test('it should deselect all rows when clicking select-all', async function (assert) {
      await renderTable.call(this);

      const selectAllCheckbox = find('.ui-table__actions input[type="checkbox"]');
      await click(selectAllCheckbox);
      await click(selectAllCheckbox);

      assert.equal(findAll('.ui-table__row[aria-selected="true"]').length, 0);
      assert.dom('.ui-table__actions label').hasTextContaining('None selected');
    });

    test('it should only select rows that meets validation rules when clicking select-all', async function (assert) {
      await renderTable.call(this, {
        validationFunction: (status) => status.toLowerCase() === 'available',
      });

      await click(find('.ui-table__actions input[type="checkbox"]'));

      const rows = findAll('.ui-table__row');
      assert.dom(rows[0]).hasAttribute('aria-selected', 'true');
      assert.dom(rows[1]).hasAttribute('aria-selected', 'false', 'ineligible row stays unselected');
      assert.dom(rows[2]).hasAttribute('aria-selected', 'true');
      assert.dom('.ui-table__actions label').hasTextContaining('Selected 2');
    });
  });

  module('download', function (hooks) {
    test('it should hide the download button when nothing is selected', async function (assert) {
      await renderTable.call(this);
      assert.dom('.ui-table__actions-download-button').doesNotExist();
    });

    test('it should show the download button once a row is selected', async function (assert) {
      await renderTable.call(this);

      await click(find('.ui-table__row'));

      assert.dom('.ui-table__actions-download-button').exists();
      assert.dom('.ui-table__actions-download-button').hasText('Download selected');
    });

    test('it should hide the download button if all rows are deselected', async function (assert) {
      await renderTable.call(this);

      const row = find('.ui-table__row');
      await click(row);
      await click(row);

      assert.dom('.ui-table__actions-download-button').doesNotExist();
    });

    test('it should call onDownload with the correct selected item', async function (assert) {
      assert.expect(2);

      const onDownloadMock = (items) => {
        assert.equal(items.length, 1, 'one item passed');
        assert.equal(items[0].name, mockData[0].name, 'correct item passed');
      };

      await renderTable.call(this, { onDownload: onDownloadMock });

      await click(findAll('.ui-table__row')[0]);
      await click(find('.ui-table__actions-download-button'));
    });

    test('it should call onDownload with all selected items when multiple rows are selected', async function (assert) {
      assert.expect(1);

      const onDownloadMock = (items) => {
        assert.equal(items.length, 2, 'two items passed');
      };

      await renderTable.call(this, { onDownload: onDownloadMock });

      await click(findAll('.ui-table__row')[0]);
      await click(findAll('.ui-table__row')[2]);
      await click(find('.ui-table__actions-download-button'));
    });
  });

  module('pagination', function (hooks) {
    test('it should render pagination controls when @pagination is provided', async function (assert) {
      await renderTable.call(this, {
        pagination: { currentPage: 1, totalPages: 5, pageSize: 3 },
      });

      assert.dom('nav').exists('pagination nav is rendered');
      assert.dom('nav button:first-child').hasText('Previous');
      assert.dom('nav button:last-child').hasText('Next');
    });

    test('it should display the current page and total pages', async function (assert) {
      await renderTable.call(this, {
        pagination: { currentPage: 2, totalPages: 5, pageSize: 3 },
      });

      assert.dom('nav span').hasText('Page 2 of 5');
    });

    test('it should disable the previous button on the first page', async function (assert) {
      await renderTable.call(this, {
        pagination: { currentPage: 1, totalPages: 5, pageSize: 3 },
      });

      assert.dom('nav button:first-child').isDisabled();
    });

    test('it should disable the next button on the last page', async function (assert) {
      await renderTable.call(this, {
        pagination: { currentPage: 5, totalPages: 5, pageSize: 3 },
      });

      assert.dom('nav button:last-child').isDisabled();
    });

    test('it should enable both previous and next buttons while on a middle page', async function (assert) {
      await renderTable.call(this, {
        pagination: { currentPage: 3, totalPages: 5, pageSize: 3 },
      });

      assert.dom('nav button:first-child').isNotDisabled();
      assert.dom('nav button:last-child').isNotDisabled();
    });

    test('it should call onPageChange when clicking Next with currentPage + 1', async function (assert) {
      assert.expect(1);

      const onPageChangeMock = (newPage) => {
        assert.equal(newPage, 3, 'onPageChange called with page 3');
        return resolvedData(mockData);
      };

      await renderTable.call(this, {
        pagination: { currentPage: 2, totalPages: 5, pageSize: 3 },
        onPageChange: onPageChangeMock,
      });

      await click(find('nav button:last-child'));
    });

    test('it should call onPageChange when clicking Previous with currentPage - 1', async function (assert) {
      assert.expect(1);

      const onPageChangeMock = (newPage) => {
        assert.equal(newPage, 1, 'onPageChange called with page 1');
        return resolvedData(mockData);
      };

      await renderTable.call(this, {
        pagination: { currentPage: 2, totalPages: 5, pageSize: 3 },
        onPageChange: onPageChangeMock,
      });

      await click(find('nav button:first-child'));
    });
  });

});