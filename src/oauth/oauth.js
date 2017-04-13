import OAuthToken from "./OAuthToken";
import StateContainer from "./StateContainer";

// TODO: Make abstract
export default class OAuth {
  constructor(client_id, scope) {
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
