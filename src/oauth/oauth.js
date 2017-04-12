import OAuthToken from "./OAuthToken";

export default class OAuth {
  constructor(client_id) {
    this.client_id = client_id;
    this.token = OAuthToken.recover();
    this.host = 'https://api.Maps4News.com';
  }
  get authenticated() {
    return this.token !== null;
  }

  authenticate() {
    throw new Error()
  }
}
