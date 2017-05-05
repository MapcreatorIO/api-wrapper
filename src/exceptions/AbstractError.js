/**
 * Thrown by abstract methods and classes
 */
export class AbstractError extends Error {}

/**
 * Thrown upon invocation of an abstract class
 */
export class AbstractClassError extends AbstractError {
  constructor() {
    super('Can not make an instance of an abstract class');
  }
}

/**
 * Thrown upon invocation of an abstract method
 */
export class AbstractMethodError extends AbstractError {
  constructor() {
    super('Can not call an abstract method');
  }
}
