import StaticClassError from '../exceptions/StaticClassError';

/**
 * Disables the constructor
 */
export default class StaticClass {
  constructor() {
    throw new StaticClassError();
  }
}
