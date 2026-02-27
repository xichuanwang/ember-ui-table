import { faker } from '@faker-js/faker';

/**
 * Returns an array of test objects with random data.
 * @param {number} length - The number of objects to generate (default: 20).
 * @returns {Array} An array of objects with random data.
 */
export function generateData(length = 20) {
  return Array.from({ length }, () => ({
    name: faker.system.fileName(),
    device: faker.helpers.arrayElement(['Mario', 'Luigi', 'Peach', 'Bowser', 'Toad', 'Yoshi', 'Donkey Kong']),
    path: faker.system.filePath(),
    status: faker.helpers.arrayElement(['Scheduled', 'Available']),
  }));
} 