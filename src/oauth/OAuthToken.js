import {isNode} from '../utils/node';

/**
 * Oauth token container
 */
export default class OAuthToken {
  /**
   * OAuth token store
   * @param {string} token - OAuth token
   * @param {string} type - token type
   * @param {Date|Number} expires - expire time in seconds or Date
   * @param {Array<string>} scopes - Any scopes
   * @returns {void}
   */
  constructor(token, type, expires, scopes = []) {
    this.scopes = scopes;
    this.token = token;
    this.type = type
      .toLowerCase()
      .replace(/(\s|^)\w/g, x => x.toUpperCase());

    if (typeof expires === 'number') {
      // Expires is in seconds
      this.expires = new Date(Date.now() + expires * 1000);
    } else if (expires instanceof Date) {
      this.expires = expires;
    } else {
      throw new TypeError('Expires not of type Date or Number');
    }
  }

  /**
   * String reprisentation of the token, useable in the Authorization header
   * @returns {string} - String reprisentation
   */
  toString() {
    return `${this.type} ${this.token}`;
  }

  /**
   * Get equivalent OAuth response object
   * @returns {{access_token: (string|*), token_type: string, expires_in: number, scope: (Array.<string>|Array|*)}} - Raw response object
   */
  toResponseObject() {
    return {
      'access_token': this.token,
      'token_type': this.type.toLowerCase(),
      'expires_in': this.expires - Date.now(),
      'scope': this.scopes,
    };
  }

  /**
   * If the token has expired
   * @returns {boolean} - expired
   */
  get expired() {
    return new Date() > this.expires;
  }

  /**
   * Internal storage key name
   * @returns {string} - storage name
   * @constant
   */
  static get storageName() {
    return 'm4n_api_token';
  }

  /**
   * Build instance from response object
   * @param {string|object} data - object or JSON string
   * @returns {OAuthToken} - New OAuthToken instance
   */
  static fromResponseObject(data) {
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }

    return new OAuthToken(
      data['access_token'],
      data['token_type'],
      Number(data['expires_in']),
      data['scope'] || []
    );
  }

  /**
   * Store the token for later recovery. Token will be stored in HTTPs cookie if possible.
   * @param {string} name - db key name
   * @param {boolean} forceLocalStorage - force the token to be stored in the localStorage
   * @returns {void}
   */
  save(name = OAuthToken.storageName, forceLocalStorage = false) {
    // TODO: Nodejs support
    if (isNode()) {
      return;
    }

    const data = {
      token: this.token,
      type: this.type,
      expires: this.expires.toUTCString(),
    };

    if (window.location.protocol === 'https:' && !forceLocalStorage) {

      const dataEncoded = encodeURIComponent(JSON.stringify(data));

      document.cookie = `${name}=${dataEncoded}; expires=${data.expires}`;
    } else {
      localStorage.setItem(name, JSON.stringify(data));
    }
  }

  /**
   * Recover a token
   * @param {string} name - Storage key name
   * @returns {OAuthToken|null} - null if none could be recovered
   */
  static recover(name = OAuthToken.storageName) {
    // TODO: Nodejs support
    if (isNode()) {
      return null;
    }

    // Cookie
    if (window.location.protocol === 'https:') {
      const cookies = `; ${document.cookie}`;
      const parts = cookies.split(`; ${name}=`);

      if (parts.length === 2) {
        const raw = decodeURIComponent(parts[1].split(';')[0]);
        const data = JSON.parse(raw);

        return new OAuthToken(data.token, data.type, new Date(data.expires));
      }
    }

    // LocalStorage
    const raw = localStorage.getItem(name);

    if (raw) {
      const data = JSON.parse(raw);

      const instance = new OAuthToken(data.token, data.type, new Date(data.expires));

      if (!instance.expired) {
        return instance;
      }
    }

    return null;
  }
}
