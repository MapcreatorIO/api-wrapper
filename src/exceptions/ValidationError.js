import ApiError from './ApiError';

export default class ValidationError extends ApiError {
  constructor(type, message, code, validationErrors) {
    super(type, message, code);
    this.validationErrors = validationErrors;
  }
}
