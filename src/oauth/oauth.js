import OAuthToken from "./OAuthToken";

export default class OAuth {
  constructor(client_id, scope) {
    this.client_id = client_id;
    this.scope = scope;
    this.token = OAuthToken.recover();
    this.host = 'https://api.Maps4News.com';
    this.path = '/';
  }
  get authenticated() {
    return this.token !== null;
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
