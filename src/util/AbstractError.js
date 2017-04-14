export class AbstractError extends Error {}

export class AbstractClassError extends AbstractError {
  constructor() {
    super('Can not make an instance of an abstract class');
  }
}


export class AbstractMethodError extends AbstractError {
  constructor() {
    super('Can not call an abstract method');
  }
}