import OAuth from './oauth';
import OAuthToken from './OAuthToken';
import {encodeQueryString} from '../util';

export default class ImplicitFlow extends OAuth {
  constructor(client_id, redirect_uri = '', scope = '') {
    super(client_id, scope);

    this.path = '/oauth/authorize';

    this.redirectUri = redirect_uri;

    if (this.redirectUri === '') {
      // Drop the anchor (if any)
      this.redirectUri = window.location.toString().split('#')[0];
    }

    this._anchorParams = [
      'access_token', 'token_type', 'expires_in'
    ];

    if (this._anchorContainsOAuthResponse()) {
      const anchorParams = this._getOAuthAnchorParams();
      this._cleanAnchorParams();

      this.token = OAuthToken.fromResponseObject(anchorParams)
    }
  }

  authenticate() {
    let promise = super.authenticate();
    if(promise) {
      return promise;
    }

    // This promise will never be fulfilled
    return new Promise(() => {
      const queryParams = {
        client_id: this.client_id,
        redirect_uri: this.redirectUri,
        response_type: 'token',
        scope: this.scope
      };

      window.location = `${this.host + this.path}?${encodeQueryString(queryParams)}`;
    });
  }

  //noinspection JSMethodCanBeStatic
  _getAnchorParams() {
    const out = {};
    const query = window.location.hash.substr(1);

    for (let raw of query.split('&')) {
      let pair = raw.split('=').map(decodeURIComponent);
      out[pair[0]] = pair[1];
    }

    return out;
  }

  _getOAuthAnchorParams() {
    const query = this._getAnchorParams();

    return Object.keys(query)
      .filter(key => this._anchorParams.includes(key))
      .reduce((obj, key) => {
        obj[key] = query[key];
        return obj;
      }, {});
  }

  _cleanAnchorParams() {
    const anchorParams = this._getAnchorParams();

    for (let key of this._anchorParams) {
      // Should silently fail when key doesn't exist
      delete anchorParams[key];
    }

    window.location.hash = encodeQueryString(anchorParams);
  }

  _anchorContainsOAuthResponse() {
    const queryKeys = Object.keys(this._getOAuthAnchorParams());

    // Check if all the params are in the anchor
    return this._anchorParams.reduce((ret, key) =>
      ret && queryKeys.includes(key)
    );
  }
}


// Interfaces that all define a way to auth should be passed to the api class, if none is provided it will not
// authenticate for the implicit path a listener should check if the anchor query is set, remove it from the anchor and
// store the data. Tokens should be added to the request using some sort of wrapper.
// Check for access_token in anchor query
// http://localhost:8000/oauth/authorize?client_id=4&redirect_uri=http%3A%2F%2Flocalhost%3A1337%2Fcallback.php&response_type=token&scope=
// request /\    returns \/
// { access_token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiI…", token_type: "bearer", expires_in: "1296000" }
