import OAuthToken from "./OAuthToken";

// TODO: Make abstract
export default class OAuth {
  constructor(client_id, scope) {
    if (this.constructor === OAuth) {
      throw TypeError('Can not make an instance of an abstract class');
    }

    this.client_id = client_id;
    this.scope = scope;
    this.token = OAuthToken.recover();
    this.host = 'https://api.Maps4News.com';
    this.path = '/';
  }

  /**
   * If the current
   * @returns {boolean}
   */
  get authenticated() {
    return this.token !== null && !this.token.expired;
  }

  authenticate() {
    if (this.authenticated) {
      return new Promise(resolve => {
        resolve(this.token);
      });
    }

    return null;
  }
}
