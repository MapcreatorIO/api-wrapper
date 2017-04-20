export default class OAuthError {
  /**
   * OAuth error response
   * @param {string} error - OAuth error key
   * @param {string} message - OAuth error message
   */
  constructor(error, message = '') {
    this._error = String(error);
    this._message = String(message);
  }

  /**
   * OAuth error message
   * @returns {string} - message
   */
  get message() {
    return this._message;
  }

  /**
   * OAuth error code
   * @returns {string} - error
   */
  get error() {
    return this._error;
  }

  /**
   * Displayable error string
   * @returns {string} - error
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
