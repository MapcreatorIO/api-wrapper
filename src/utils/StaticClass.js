/**
 * Disables the constructor
 */
export default class StaticClass {
  constructor() {
    throw new StaticClassError();
  }
}
