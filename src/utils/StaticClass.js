import StaticClassError from '../exceptions/StaticClassError';

/**
 * Disables the constructor and throws a {@link StaticClassError} when an instance is created.
 */
export default class StaticClass {
  constructor() {
    throw new StaticClassError();
  }
}
