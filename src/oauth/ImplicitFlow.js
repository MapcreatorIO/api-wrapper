import OAuth from "./OAuth";
import OAuthToken from "./OAuthToken";
import {encodeQueryString} from "../util";
import StateContainer from "./StateContainer";

export default class ImplicitFlow extends OAuth {
  constructor(client_id, redirect_uri = '', scope = '*', useState = true) {
    super(client_id, scope);

    this.path = '/oauth/authorize';

    this.redirectUri = redirect_uri;
    this.useState = useState;

    if (this.redirectUri === '') {
      // Drop the anchor (if any)
      this.redirectUri = window.location.toString().split('#')[0];
    }

    this._anchorParams = [
      'access_token', 'token_type', 'expires_in'
    ];

    if (this.useState) {
      this._anchorParams.push('state');
    }

    if (this._anchorContainsOAuthResponse()) {
      const anchorParams = this._getOAuthAnchorParams();
      this._cleanAnchorParams();

      if (this.useState && !StateContainer.validate(anchorParams['state'])) {
        console.log('Encountered an invalid state response, ignoring token');
        console.log('State: ' + anchorParams['state']);
        console.log(StateContainer.list());

        throw Error('Invalid state in url');
      } else {
        this.token = OAuthToken.fromResponseObject(anchorParams)
      }
    }
  }

  authenticate() {
    let promise = super.authenticate();
    if (promise) {
      return promise;
    }

    // This promise will never be fulfilled
    return new Promise(() => {
      window.location = this._buildRedirectUrl();
    });
  }

  _buildRedirectUrl() {
    const queryParams = {
      client_id: this.client_id,
      redirect_uri: this.redirectUri,
      response_type: 'token',
      scope: this.scope
    };

    if (this.useState) {
      queryParams['state'] = StateContainer.generate();
    }

    return `${this.host + this.path}?${encodeQueryString(queryParams)}`;
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

  _getOAuthAnchorParams(query) {
    query = query || this._getAnchorParams();

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
    return this._anchorParams.reduce((output, key) =>
      output && queryKeys.includes(key)
    );
  }
}
