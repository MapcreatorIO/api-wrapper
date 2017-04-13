import OAuth from "./OAuth";
import {encodeQueryString, makeRequest} from "../util";
import OAuthToken from "./OAuthToken";

export default class PasswordFlow extends OAuth {
  constructor(client_id, secret, username, password, scope = '*') {
    super(client_id, scope);

    this.secret = secret;
    this.username = username;
    this.password = password;

    this.path = '/oauth/token';

    if (window.location.protocol !== "https:") {
      console.log('Page was not loaded using https. You\'re probably leaking secrets right now');
    }
  }

  authenticate() {
    const url = this.host + this.path;
    const query = {
      grant_type: 'password',
      client_id: this.client_id,
      client_secret: this.secret,
      username: this.username,
      password: this.password,
      scope: this.scope
    };

    return new Promise((resolve, reject) => {
      makeRequest(url, "POST", encodeQueryString(query)).then(request => {
        const data = JSON.parse(request.responseText);

        this.token = OAuthToken.fromResponseObject(data);
        resolve(this.token);
      }).catch(reject); // TODO: better catch
    });
  }
}