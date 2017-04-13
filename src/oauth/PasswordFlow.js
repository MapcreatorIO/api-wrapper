import OAuth from "./OAuth";
import {encodeQueryString, makeRequest} from "../util";
import OAuthToken from "./OAuthToken";
import StateContainer from "./StateContainer";

export default class PasswordFlow extends OAuth {
  constructor(client_id, secret, username, password, scope = '*', useState = true) {
    super(client_id, scope);

    this.secret = secret;
    this.username = username;
    this.password = password;
    this.useState = useState;

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
        const data = JSON.parse(request.responseText);

        if (this.useState && !StateContainer.validate(data['state'])) {
          console.log('Encountered an invalid state response, ignoring token');
          reject(request);
        } else {
          this.token = OAuthToken.fromResponseObject(data);
          resolve(this.token);
        }

      }).catch(reject); // TODO: better catch
    });
  }
}