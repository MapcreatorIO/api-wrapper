/**
 *
 * @abstract
 */
import OAuthToken from "./OAuthToken";
import {AbstractClassError, AbstractMethodError} from "../util/AbstractError";

export default class OAuth {
  constructor(clientId, scope) {
    if (this.constructor === OAuth) {
      throw AbstractClassError();
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
    throw new AbstractMethodError();
  }
}
