/**
 * Password authentication flow
 */
import OAuth from "./OAuth";
import OAuthToken from "./OAuthToken";
import {encodeQueryString, makeRequest} from "../util/requests";
import OAuthError from "./OAuthError";

export default class PasswordFlow extends OAuth {
  /**
   * Password authentication flow
   * @param {string} clientId - OAuth client id
   * @param {string} secret - OAuth secret
   * @param {string} username
   * @param {string} password
   * @param {Array<string>} scopes - A list of required scopes
   */
  constructor(clientId, secret, username, password, scopes = ['*']) {
    super(clientId, scopes);

    this.secret = secret;
    this.username = username;
    this.password = password;

    this.path = '/oauth/token';

    // Because the client requires a secret HTTP is highly recommended
    if (window.location.protocol !== "https:") {
      console.warn('Page was not loaded using https. You\'re probably leaking secrets right now');
    }
  }

  /**
   * Authenticate
   * @returns {Promise}
   */
  authenticate() {
    const url = this.host + this.path;
    const query = {
      grant_type: 'password',
      client_id: this.clientId,
      client_secret: this.secret,
      username: this.username,
      password: this.password,
      scope: this.scopes.join(' '),
    };

    return new Promise((resolve, reject) => {
      makeRequest(url, "POST", encodeQueryString(query)).then(request => {
        const data = JSON.parse(request.responseText);

        this.token = OAuthToken.fromResponseObject(data);
        this.token.scopes = this.scopes;
        resolve(this.token);
      }).catch(request => {
        const data = JSON.parse(request.responseText);

        reject(new OAuthError(data['error'], data['message']));
      });
    });
  }
}