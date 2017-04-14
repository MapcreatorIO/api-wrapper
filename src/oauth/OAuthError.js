export default class OAuthError {
  /**
   * OAuth error response
   * @param {string} error
   * @param {string} message
   */
  constructor(error, message = '') {
    this._error = String(error);
    this._message = String(message);
  }

  get message() {
    return this._message;
  }

  get error() {
    return this._error;
  }

  toString() {
    let error = this._error;

    if (error.includes('_')) {
      error = error.replace('_', ' ').replace(/^./, x => x.toUpperCase());
    }

    if (this._message) {
      return `${error}: ${this._message}`;
    } else {
      return error;
    }
  }
}