/**
 * Oauth token container
 */
export default class OAuthToken {
  /**
   *
   * @param {string} token - OAuth token
   * @param {string} type - token type
   * @param {Date|Number} expires - expire time in seconds or Date
   */
  constructor(token, type, expires) {
    this.token = token;
    this.type = type
      .toLowerCase()
      .replace(/(\s|^)\w/g, x => x.toUpperCase());

    if (typeof expires === 'number') {
      // Expires is in seconds
      this.expires = new Date(Date.now() + (expires * 1000));
    } else if (expires instanceof Date) {
      this.expires = expires;
    } else {
      throw new TypeError('Expires not of type Date or Number');
    }
  }

  /**
   * @returns {string}
   */
  toString() {
    return `${this.type} ${this.token}`;
  }

  /**
   * If the token has expired
   * @returns {boolean}
   */
  get expired() {
    return new Date() > this.expires;
  }

  /**
   * Internal storage key name
   * @returns {string}
   * @constant
   */
  static get storageName() {
    return 'm4n_api_token';
  }

  /**
   * Build instance from response object
   * @param {string|object} data - object or JSON string
   * @returns {OAuthToken}
   */
  static fromResponseObject(data) {
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }

    return new OAuthToken(
      data['access_token'],
      data['token_type'],
      Number(data['expires_in'])
    )
  }

  /**
   * Store the token for later recovery. Token will be stored in HTTPs cookie if possible.
   * @param {string} name - db key name
   * @param {boolean} forceLocalStorage - force the token to be stored in the localStorage
   */
  save(name = OAuthToken.storageName, forceLocalStorage = false) {
    const data = {
      token: this.token,
      type: this.type,
      expires: this.expires.toUTCString()
    };

    if (window.location.protocol === "https:" && !forceLocalStorage) {

      const dataEncoded = encodeURIComponent(JSON.stringify(data));
      document.cookie = `${name}=${dataEncoded}; expires=${data.expires}`;
    } else {
      localStorage.setItem(name, JSON.stringify(data));
    }
  }

  /**
   * Recover a token
   * @param name -
   * @returns {OAuthToken|null} - null if none could be recovered
   */
  static recover(name = OAuthToken.storageName) {
    // Cookie
    if (window.location.protocol === "https:") {
      const cookies = `; ${document.cookie}`;
      const parts = cookies.split(`; ${name}=`);
      if (parts.length === 2) {
        const raw = decodeURIComponent(parts[1].split(";")[0]);
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
