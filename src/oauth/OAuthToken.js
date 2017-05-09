import {isNode} from '../utils/node';
import NodeError from '../exceptions/NodeError';

/**
 * Oauth token container
 */
export default class OAuthToken {
  /**
   * @param {String} token - OAuth token
   * @param {String} type - token type
   * @param {Date|Number} expires - expire time in seconds or Date
   * @param {Array<string>} scopes - Any scopes
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
   * String representation of the token, usable in the Authorization header
   * @returns {string} - String representation
   */
  toString() {
    return `${this.type} ${this.token}`;
  }

  /**
   * Get equivalent OAuth response object
   * @returns {{access_token: (String|*), token_type: String, expires_in: Number, scope: (Array.<String>|Array|*)}} - Raw response object
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
   * @returns {Boolean} - expired
   */
  get expired() {
    return new Date() > this.expires;
  }

  /**
   * Internal storage key name
   * @returns {String} - storage name
   * @constant
   */
  static get storageName() {
    return 'm4n_api_token';
  }

  /**
   * Filename for nodejs token storage
   * @returns {string} - filename
   * @constant
   */
  static get nodeTokenFilename() {
    return '.m4n_token';
  }

  /**
   * Gets the default name for the name parameter on save and restore
   * @returns {string} - name
   * @private
   * @static
   */
  static get _defaultName() {
    return isNode() ? OAuthToken.nodeTokenFilename : OAuthToken.storageName;
  }

  /**
   * Build instance from response object
   * @param {String|Object} data - object or JSON string
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
   * Store the token for later recovery. Token will be stored in HTTPS cookie if possible.
   * @param {String} name - db key name
   * @param {Boolean} forceLocalStorage - force the token to be stored in the localStorage
   * @returns {void}
   * @see OAuthToken#recover
   */
  save(name = OAuthToken._defaultName, forceLocalStorage = false) {
    const data = {
      token: this.token,
      type: this.type,
      expires: this.expires.toUTCString(),
    };

    if (isNode()) {
      if (forceLocalStorage) {
        throw new NodeError('Can not force localStorage usage when running under node');
      }

      const fs = require('fs');
      const json = JSON.stringify(data, null, 2);

      fs.writeFileSync(name, json);
    } else if (window.location.protocol === 'https:' && !forceLocalStorage) {
      const dataEncoded = encodeURIComponent(JSON.stringify(data));

      document.cookie = `${name}=${dataEncoded}; expires=${data.expires}`;
    } else {
      localStorage.setItem(name, JSON.stringify(data));
    }
  }

  /**
   * Recover a token by looking through the HTTPS cookies and localStorage
   * @param {String} name - Storage key name
   * @returns {OAuthToken|null} - null if none could be recovered
   * @see OAuthToken#save
   */
  static recover(name = OAuthToken._defaultName) {
    if (isNode()) {
      const fs = require('fs');
      const raw = fs.readFileSync(name, json);
      const data = JSON.parse(raw);

      return new OAuthToken(data.token, data.type, new Date(data.expires));
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
