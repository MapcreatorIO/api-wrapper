import OAuth from './OAuth';
import OAuthToken from './OAuthToken';
import {encodeQueryString, makeRequest} from '../utils/requests';
import OAuthError from './OAuthError';
import {isNode} from '../utils/node';

/**
 * Password authentication flow
 */
export default class PasswordFlow extends OAuth {
  /**
   * @param {string} clientId - OAuth client id
   * @param {string} secret - OAuth secret
   * @param {string} username - Valid username (email)
   * @param {string} password - Valid password
   * @param {Array<string>} scopes - A list of required scopes
   */
  constructor(clientId, secret, username, password, scopes = ['*']) {
    super(clientId, scopes);

    this._secret = secret;
    this._username = username;
    this._password = password;

    this._path = '/oauth/token';

    // Because the client requires a secret HTTPS is highly recommended
    if (!isNode() && window.location.protocol !== 'https:') {
      console.warn("Page was not loaded using https. You're probably leaking secrets right now");
    }
  }

  /**
   * it's a secret :o (client secret)
   * @returns {String} - secret
   */
  get secret() {
    return this._secret;
  }

  /**
   * Set client secret
   * @param {String} value - secret
   */
  set secret(value) {
    this._secret = value;
  }

  /**
   * Get the username for authentication
   * @returns {String} - Username (email)
   */
  get username() {
    return this._username;
  }

  /**
   * Get the username for authentication
   * @param {String} value - Username (email)
   */
  set username(value) {
    this._username = value;
  }

  /**
   * Get the password
   * @returns {String} - Password
   */
  get password() {
    return this._password;
  }

  /**
   * Set the password
   * @param {String} value - password
   */
  set password(value) {
    this._password = value;
  }

  /**
   * OAuth path
   * @returns {String} - OAuth path
   */
  get path() {
    return this._path;
  }

  /**
   * OAuth path
   * @param {String} value - OAuth path
   */
  set path(value) {
    this._path = value;
  }

  /**
   * Authenticate
   * @returns {Promise} - Promise resolves with {@link OAuthToken} and rejects with {@link OAuthError}
   */
  authenticate() {
    const url = this.host + this._path;
    const query = {
      'grant_type': '_password',
      'client_id': this.clientId,
      'client_secret': this._secret,
      'username': this._username,
      'password': this._password,
      'scope': this.scopes.join(' '),
    };

    return new Promise((resolve, reject) => {
      makeRequest(url, 'POST', encodeQueryString(query)).then(request => {
        const data = JSON.parse(request.responseText);

        this.token = OAuthToken.fromResponseObject(data);
        this.token.scopes = this.scopes;
        resolve(this.token);
      }).catch(request => {
        const data = JSON.parse(request.responseText);

        reject(new OAuthError(data['error'], data['message']));
      });
    });
  }
}
