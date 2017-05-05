/**
 * OAuth error
 */
export default class OAuthError extends Error {
  /**
   * OAuth error response
   * @param {String} error - OAuth error key
   * @param {String} message - OAuth error message
   */
  constructor(error, message = '') {
    super();
    this._error = String(error);
    this._message = String(message);
  }

  /**
   * OAuth error message
   * @returns {String} - message
   */
  get message() {
    return this._message;
  }

  /**
   * OAuth error code
   * @returns {String} - error
   */
  get error() {
    return this._error;
  }

  /**
   * Displayable error string
   * @returns {String} - error
   */
  toString() {
    let error = this._error;

    if (error.includes('_')) {
      error = error.replace('_', ' ').replace(/^./, x => x.toUpperCase());
    }

    if (this._message) {
      return `${error}: ${this._message}`;
    }
    return error;

  }
}
