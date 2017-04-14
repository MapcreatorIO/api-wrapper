import OAuth from "./OAuth";
import OAuthToken from "./OAuthToken";
import StateContainer from "./StateContainer";
import {encodeQueryString} from "../util/requests";

/**
 * Implicit OAuth flow using redirection
 */
export default class ImplicitFlow extends OAuth {

  /**
   * Implicit authentication flow
   * @param {string} clientId - OAuth client id
   * @param {string} redirectUri - redirectUri for obtaining the token. This should be a
   *                               page with this script on it. If left empty the current
   *                               url will be used.
   * @param {boolean} useState - use state verification
   * @param {Array<string>} scope - A list of required scopes
   */
  constructor(clientId, redirectUri = '', scope = ['*'], useState = true) {
    super(clientId, scope);

    this.path = '/oauth/authorize';

    this.redirectUri = redirectUri;
    this.useState = useState;

    if (!this.redirectUri) {
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

  /**
   * Authenticate
   * @returns {Promise}
   */
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

  /**
   * Builds the url for redirection
   * @returns {string}
   * @private
   */
  _buildRedirectUrl() {
    const queryParams = {
      clientId: this.clientId,
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
  /**
   * Builds an object containing all the anchor parameters
   * @returns {object<string, string>}
   * @private
   */
  _getAnchorParams() {
    const out = {};
    const query = window.location.hash.substr(1);

    for (let raw of query.split('&')) {
      let pair = raw.split('=').map(decodeURIComponent);
      out[pair[0]] = pair[1];
    }

    return out;
  }

  /**
   * Fetch OAuth anchor params
   * @param {string|undefined} query
   * @returns {object<string, string>} List of OAuth anchor parameters
   * @private
   */
  _getOAuthAnchorParams(query=undefined) {
    query = query || this._getAnchorParams();

    return Object.keys(query)
      .filter(key => this._anchorParams.includes(key))
      .reduce((obj, key) => {
        obj[key] = query[key];
        return obj;
      }, {});
  }

  /**
   * Remove OAuth related anchor parameters
   * @private
   */
  _cleanAnchorParams() {
    const anchorParams = this._getAnchorParams();

    for (let key of this._anchorParams) {
      // Should silently fail when key doesn't exist
      delete anchorParams[key];
    }

    window.location.hash = encodeQueryString(anchorParams);
  }

  /**
   * Test if the anchor contains an OAuth response
   * @returns {boolean}
   * @private
   */
  _anchorContainsOAuthResponse() {
    const queryKeys = Object.keys(this._getOAuthAnchorParams());

    // Check if all the params are in the anchor
    return this._anchorParams.reduce((output, key) =>
      output && queryKeys.includes(key)
    , true);
  }
}
