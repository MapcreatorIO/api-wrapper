import OAuthToken from './OAuthToken';
import {AbstractClassError, AbstractMethodError} from '../exceptions/AbstractError';

/**
 * OAuth base class
 * @abstract
 */
export default class OAuth {
  /**
   * @param {String} clientId - OAuth client id
   * @param {Array<String>} scopes - A list of required scopes
   * @returns {void}
   */
  constructor(clientId, scopes = ['*']) {
    if (this.constructor === OAuth) {
      throw new AbstractClassError();
    }

    this.clientId = String(clientId);
    this.scopes = scopes;
    this.token = OAuthToken.recover();
    this.host = 'https://api.Maps4News.com';
    this.path = '/';
  }

  /**
   * If the current instance has a valid token
   * @returns {Boolean} - if a valid token is availble
   */
  get authenticated() {
    return this.token !== null && !this.token.expired;
  }

  /**
   * Authenticate
   * @returns {Promise} - Promise resolves with OAuthToken and rejects with OAuthError
   */
  authenticate() {
    throw new AbstractMethodError();
  }
}
