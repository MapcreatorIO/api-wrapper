import ApiError from './ApiError';

export default class ValidationException extends ApiError {
  constructor(type, message, code, validationErrors) {
    super(type, message, code);
    this.validationErrors = validationErrors;
  }
}
