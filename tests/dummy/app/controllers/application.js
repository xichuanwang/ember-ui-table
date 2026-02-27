import Controller from '@ember/controller';
import { generateData } from '../helpers/generate-data';
import { action } from '@ember/object';
import { TrackedAsyncData } from 'ember-async-data';


export default class ApplicationController extends Controller {
  // Basic table column configuration
  columns = [
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
  ];

  /**
   * Returns a TrackedAsyncData instance that resolves with generated data after a delay.
   * @returns TrackedAsyncData instance
   */
  @action
  loadData() {

    const p = new Promise((resolve) => {
      setTimeout(() => {
        const newData = generateData();
        resolve(newData);
      }, 1200);
    });

    return new TrackedAsyncData(p);
  }

  @action
  onDownload(selectedItems) {
    const alertText = selectedItems.reduce((acc, item) => {
      acc.push(`Device: ${item.device} - Path: ${item.path}`);
      return acc;
    }, []).join('\n');

    alert(alertText);
  }
}