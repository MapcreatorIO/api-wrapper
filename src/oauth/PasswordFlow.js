import OAuth from "./oauth";
import {encodeQueryString, makeRequest} from "../util";

export default class PasswordFlow extends OAuth {
  constructor(client_id, secret, username, password, scope = '') {
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
    const query = encodeQueryString({
      grant_type: 'password',
      client_id: this.client_id,
      client_secret: this.secret,
      username: this.username,
      password: this.password,
      scope: this.scope
    });

    return new Promise((resolve, reject) => {
      makeRequest(url, "POST", query).then(request => {
        console.log(request.responseText);
      }).catch(reject); // TODO: better catch
    });
  }
}