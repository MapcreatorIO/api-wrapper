import ApiError from './ApiError';

/**
 * Extension of {@link ApiError} containing an extra field for validation errors
 */
export default class ValidationError extends ApiError {
  /**
   * @param {String} type - Error type
   * @param {String} message - Error message
   * @param {Number} code - Http error code
   * @param {Object<String, Array<String>>} validationErrors - Any validation errors
   */
  constructor(type, message, code, validationErrors) {
    super(type, message, code);
    this._validationErrors = validationErrors;
  }

  /**
   * Any validation errors
   * @returns {Object.<String, Array.<String>>}
   */
  get validationErrors() {
    return this._validationErrors;
  }
}
