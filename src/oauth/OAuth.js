import OAuthToken from "./OAuthToken";

/**
 *
 * @abstract
 */
export default class OAuth {
  constructor(clientId, scope) {
    if (this.constructor === OAuth) {
      throw TypeError('Can not make an instance of an abstract class');
    }

    this.clientId = clientId;
    this.scopes = scope || ['*'];
    this.token = OAuthToken.recover();
    this.host = 'https://api.Maps4News.com';
    this.path = '/';
  }

  /**
   * If the current instance has a valid token
   * @returns {boolean}
   */
  get authenticated() {
    return this.token !== null && !this.token.expired;
  }

  /**
   * Authenticate
   * @returns {Promise}
   */
  authenticate() {
    if (this.authenticated) {
      return new Promise(resolve => {
        resolve(this.token);
      });
    }

    return null;
  }
}
