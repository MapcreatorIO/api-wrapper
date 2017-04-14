/**
 * Disables the constructor
 */
export default class StaticClass {
  constructor() {
    throw new StaticClassError();
  }
}

/**
 * Thrown upon invocation of a static class
 */
export class StaticClassError extends Error {
}
