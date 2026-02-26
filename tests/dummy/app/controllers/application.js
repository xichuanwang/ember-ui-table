import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { generateData } from '../helpers/generate-data';
import { action } from '@ember/object';
import { TrackedAsyncData } from 'ember-async-data';


export default class ApplicationController extends Controller {
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
}